//  PACKAGES
import t from "./actionTypes";

const initialState = {
  coreDeps: [],
  coreManifest: null,
  staticIp: null,
  staticIpInput: ""
};

export default function(state = initialState, action) {
  switch (action.type) {
    case t.UPDATE_CORE_DEPS:
      return {
        ...state,
        coreDeps: action.coreDeps
      };
    case t.UPDATE_CORE_MANIFEST:
      return {
        ...state,
        coreManifest: action.coreManifest
      };
    case t.UPDATE_STATIC_IP:
      return {
        ...state,
        staticIp: action.staticIp
      };
    case t.UPDATE_STATIC_IP_INPUT:
      return {
        ...state,
        staticIpInput: action.staticIpInput
      };
    default:
      return state;
  }
}
