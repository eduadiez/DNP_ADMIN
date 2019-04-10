import store from "../store";
// Actions to push received content
import { pushNotification } from "services/notifications/actions";
import { updateChainData } from "services/chainData/actions";
import { updateDevices } from "services/devices/actions";
import { updateDnpDirectory } from "services/dnpDirectory/actions";
import { updateDnpInstalled } from "services/dnpInstalled/actions";
import { pushUserActionLog } from "services/userActionLogs/actions";
import { updateIsInstallingLog } from "services/isInstallingLogs/actions";

export default function subscriptions(session) {
  /**
   * Utilities to encode arguments to publish with the Crossbar format (args, kwargs)
   * - Publisher:
   *     publish("event.name", arg1, arg2)
   * - Subscriber:
   *     session.subscribe("event.name", args => {
   *       listener(...args)
   *     })
   */
  // function publish(event, ...args) {
  //   // session.publish(topic, args, kwargs, options)
  //   session.publish(event, args);
  // }
  function subscribe(event, cb) {
    // session.subscribe(topic, function(args, kwargs, details) )
    session.subscribe(event, args => {
      try {
        cb(...args);
      } catch (e) {
        console.error(`Error on WAMP ${event}: ${e.stack}`);
      }
    });
  }

  /**
   * @param {object} userActionLog = {
   *   level: "info" | "error", {string}
   *   event: "installPackage.dnp.dappnode.eth", {string}
   *   message: "Successfully install DNP", {string} Returned message from the call function
   *   result: { data: "contents" }, {*} Returned result from the call function
   *   kwargs: { id: "dnpName" }, {object} RPC key-word arguments
   *   // Only if error
   *   message: e.message, {string}
   *   stack.e.stack {string}
   * }
   */
  subscribe("logUserAction.dappmanager.dnp.dappnode.eth", userActionLog => {
    store.dispatch(pushUserActionLog(userActionLog));
  });

  /**
   * DNP installation progress log
   * @param {object} logData = {
   *   id: "ln.dnp.dappnode.eth@/ipfs/Qmabcdf", {String} overall log id (to bundle multiple logs)
   *   name: "bitcoin.dnp.dappnode.eth", {String} dnpName the log is referring to
   *   message: "Downloading 75%", {String} log message
   * }
   */
  subscribe("log.dappmanager.dnp.dappnode.eth", ({ id, name, message }) => {
    store.dispatch(updateIsInstallingLog({ id, dnpName: name, log: message }));
  });

  /**
   * @param {array} dnpList = res.result = [{
   *   id: '927623894...',
   *   isDNP: true,
   *   name: otpweb.dnp.dappnode.eth,
   *   ... (see `api/rpcMethods/dappmanager#listPackages` for more details)
   * }, ... ]
   */
  subscribe("packages.dappmanager.dnp.dappnode.eth", dnpList => {
    store.dispatch(updateDnpInstalled(dnpList));
  });

  /**
   * @param {object} dnps {
   *   "dnpName.dnp.dappnode.eth": {
   *     name: "dnpName.dnp.dappnode.eth",
   *     manifest: { ... },
   *     ...
   *   }, ... }
   */
  subscribe("directory.dappmanager.dnp.dappnode.eth", dnps => {
    store.dispatch(updateDnpDirectory(dnps));
  });

  /**
   * @param {array} devices = [{
   *   id: "MyPhone",
   *   isAdmin: false
   * }, ... ]
   */
  subscribe("devices.vpn.dnp.dappnode.eth", devices => {
    store.dispatch(updateDevices(devices));
  });

  /**
   * Periodic updates of the state of all chains bundled together
   * `chainData` is an array and is sent as an `arg` not `kwarg`
   * @param {array} chainData = [{
   *     syncing: true, {Bool}
   *     message: "Blocks synced: 543000 / 654000", {String}
   *     progress: 0.83027522935,
   *   }, {
   *     message: "Could not connect to RPC", {String}
   *     error: true {Bool},
   *   }, ... ]
   */
  subscribe("chainData.dappmanager.dnp.dappnode.eth", chainData => {
    store.dispatch(updateChainData(chainData));
  });

  /**
   * @param {object} notification = {
   *   id: "diskSpaceRanOut-stoppedPackages",
   *   type: "danger",
   *   title: "Disk space ran out, stopped packages",
   *   body: "Available disk space is less than a safe ... ",
   * }
   */
  subscribe("pushNotification.dappmanager.dnp.dappnode.eth", notification => {
    store.dispatch(pushNotification({ notification, fromDappmanager: true }));
  });
}
