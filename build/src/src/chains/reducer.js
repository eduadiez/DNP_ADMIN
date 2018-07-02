// WATCHERS
import * as t from "./actionTypes";

const initialState = {};

export default function(state = initialState, action) {
  switch (action.type) {
    case t.REMOVE_CHAIN:
      const { [action.id]: chain, ...withoutChain } = state;
      return withoutChain;
    case t.UPDATE_STATUS:
      return {
        ...state,
        [action.id]: action.payload
      };
    default:
      return state;
  }
}
