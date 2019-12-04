import { wrapRoute } from "./wrapRoute";

import * as _fetchCoreUpdateData from "../route-types/fetchCoreUpdateData";
import * as _fetchDirectory from "../route-types/fetchDirectory";
import * as _fetchDnpRequest from "../route-types/fetchDnpRequest";
import * as _installPackage from "../route-types/installPackage";
import * as _packageGettingStartedToggle from "../route-types/packageGettingStartedToggle";
import * as _listPackages from "../route-types/listPackages";

export const fetchCoreUpdateData = wrapRoute<
  _fetchCoreUpdateData.RequestData,
  _fetchCoreUpdateData.ReturnData
>(_fetchCoreUpdateData);

export const fetchDirectory = wrapRoute<
  _fetchDirectory.RequestData,
  _fetchDirectory.ReturnData
>(_fetchDirectory);

export const fetchDnpRequest = wrapRoute<
  _fetchDnpRequest.RequestData,
  _fetchDnpRequest.ReturnData
>(_fetchDnpRequest);

export const installPackage = wrapRoute<
  _installPackage.RequestData,
  _installPackage.ReturnData
>(_installPackage);

export const packageGettingStartedToggle = wrapRoute<
  _packageGettingStartedToggle.RequestData,
  _packageGettingStartedToggle.ReturnData
>(_packageGettingStartedToggle);

export const listPackages = wrapRoute<
  _listPackages.RequestData,
  _listPackages.ReturnData
>(_listPackages);