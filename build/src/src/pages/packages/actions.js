// INSTALLER
import { confirm } from "components/ConfirmDialog";
import { shortNameCapitalized as sn } from "utils/format";
import api from "API/rpcMethods";
// Selectors
import {
  getDnpInstalledById,
  getDependantsOfId
} from "services/dnpInstalled/selectors";

/* Notice: togglePackage, restartPackage, etc use redux-thunk
   Since there is no return value, and the state change
   is triggered via a ws subscription there is not need
   to handle this async action in a redux-saga.

   That was the original method, but just calling the API
   directly requires less boilerplate and is more clear

   api.methodName will never throw if toastMessage is true
 */

// Used in package interface / envs

export const updatePackageEnv = (id, envs) => () =>
  api.updatePackageEnv(
    { id, envs, restart: true },
    { toastMessage: `Updating ${sn(id)} ${Object.keys(envs).join(", ")}...` }
  );

// Used in package interface / controls

export const togglePackage = id => () =>
  api.togglePackage({ id }, { toastMessage: `Toggling ${sn(id)}...` });

export const restartPackage = id => (_, getState) => {
  const restartPackageCallback = () =>
    api.restartPackage({ id }, { toastMessage: `Restarting ${sn(id)}...` });

  // If the DNP is gracefully stopped, do not ask for confirmation to reset
  const dnp = getDnpInstalledById(getState(), id);
  if (dnp && !dnp.running && dnp.state === "exited")
    return restartPackageCallback();

  // Display a dialog to confirm restart
  confirm({
    title: `Restarting ${sn(id)}`,
    text: `This action cannot be undone. If this DAppNode Package holds state, it may be lost.`,
    label: "Restart",
    onClick: restartPackageCallback
  });
};

export const restartPackageVolumes = id => async (_, getState) => {
  // Make sure there are no colliding volumes with this DNP
  const dnp = getDnpInstalledById(getState(), id);

  const warningsList = [];
  if (dnp.name === "ethchain.dnp.dappnode.eth")
    warningsList.push({
      title: "Warning! Resync time",
      body: "The mainnet chain will have to resync and may take a few days"
    });

  /**
   * If there are volumes which this DNP is the owner and some other
   * DNPs are users, they will be removed by the DAPPMANAGER.
   * Alert the user about this fact
   */
  const dnpsToRemove = getDnpsToRemove(dnp);
  if (dnpsToRemove.length)
    warningsList.push({
      title: "Warning! DAppNode Packages to be removed",
      body: `Some other DAppNode Packages will be reseted in order to remove ${id} volumes. \n\n ${dnpsToRemove
        .map(name => `- ${name}`)
        .join("\n")}`
    });

  // If there are NOT conflicting volumes,
  // Display a dialog to confirm volumes reset
  await new Promise(resolve =>
    confirm({
      title: `Removing ${sn(id)} data`,
      text: `This action cannot be undone. If this DAppNode Package is a blockchain node, it will lose all the chain data and start syncing from scratch.`,
      list: warningsList.length ? warningsList : null,
      label: "Remove volumes",
      onClick: resolve
    })
  );

  await api.restartPackageVolumes(
    { id },
    { toastMessage: `Removing volumes of ${sn(id)}...` }
  );
};

export const removePackage = id => async (_, getState) => {
  const dnp = getDnpInstalledById(getState(), id);

  // Dialog to confirm remove + USER INPUT for delete volumes
  const deleteVolumes = await new Promise(resolve => {
    const title = `Removing ${sn(id)}`;
    let text = `This action cannot be undone.`;
    const buttons = [{ label: "Remove", onClick: resolve.bind(this, false) }];
    if (areThereVolumesToRemove(dnp)) {
      // Only show the remove data related text if necessary
      text += ` If you do NOT want to keep ${id}'s data, remove it permanently clicking the "Remove and delete data" option.`;
      // Only display the "Remove and delete data" button if necessary
      buttons.push({
        label: "Remove and delete data",
        onClick: resolve.bind(this, true)
      });
    }
    return confirm({ title, text, buttons });
  });

  const warningsList = [];
  // Don't show the same DNP in both dnpsToRemove and dependantsOf
  const dnpsToRemove = getDnpsToRemove(dnp);
  const dependantsOf = getDependantsOfId(getState(), id).filter(
    name => !dnpsToRemove.includes(name)
  );

  // dependantsOf = ["raiden.dnp.dappnode.eth", "another.dnp.dappnode.eth"]
  if (dependantsOf.length)
    warningsList.push({
      title: "Warning! There are package dependants",
      body: `Some DAppNode Packages depend on ${id} and may stop working if you continue. \n\n ${dependantsOf
        .map(name => `- ${name}`)
        .join("\n")}`
    });

  // dnpsToRemove = "raiden.dnp.dappnode.eth, another.dnp.dappnode.eth"
  if (dnpsToRemove.length)
    warningsList.push({
      title: "Warning! Other packages to be removed",
      body: `Some other DAppNode Packages will be removed as well because they are dependent on ${id} volumes. \n\n ${dnpsToRemove
        .map(name => `- ${name}`)
        .join("\n")}`
    });

  if (warningsList.length)
    await new Promise(resolve =>
      confirm({
        title: `Removing ${sn(id)}`,
        text: `This action cannot be undone.`,
        list: warningsList,
        label: "Continue",
        onClick: resolve
      })
    );

  await api.removePackage(
    { id, deleteVolumes },
    {
      toastMessage: `Removing ${sn(id)} ${
        deleteVolumes ? " and volumes" : ""
      }...`
    }
  );
};

// File manager

export const copyFileTo = ({ id, dataUri, filename, toPath }) => () =>
  api.copyFileTo(
    { id, dataUri, filename, toPath },
    { toastMessage: `Copying file ${filename} to ${sn(id)} ${toPath}...` }
  );

// DAPPMANAGER dedicated cleanCache RPC

export const cleanCache = () => () =>
  confirm({
    title: `Deleting cache`,
    text: `This action cannot be undone. You should only clean the cache in response to a problem.`,
    label: "Clean cache",
    onClick: () => api.cleanCache({}, { toastMessage: `Cleaning cache...` })
  });

/**
 * Re-used disclaimers and warnings
 */

/**
 * If there are volumes which this DNP is the owner and some other
 * DNPs are users, they will be removed by the DAPPMANAGER.
 * Alert the user about this fact
 * @param {object} dnp DNP is installed object
 * @returns {string} list of DNPs to remove
 */
function getDnpsToRemove(dnp) {
  const dnpsToRemoveObj = {};
  for (const vol of dnp.volumes || [])
    if (vol.name && vol.isOwner && vol.users.length > 1)
      for (const dnpName of vol.users)
        if (dnpName !== dnp.name) dnpsToRemoveObj[dnpName] = true;
  return Object.keys(dnpsToRemoveObj);
}

/**
 * Checks if there are volumes to be removed on this DNP
 * @param {object} dnp DNP is installed object
 * @returns {bool}
 */
function areThereVolumesToRemove(dnp) {
  return (dnp.volumes || []).filter(vol => vol.isOwner).length;
}
