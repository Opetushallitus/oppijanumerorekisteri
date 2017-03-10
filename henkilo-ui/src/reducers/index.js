import { INCREMENT, DECREMENT } from '../actions/actiontypes';

import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';

const testCounter = (state = 0, action) => {
  const { type } = action;
  if(type === INCREMENT) {
    return state + 1;
  } else if( type === DECREMENT) {
    return state - 1
  } else {
    return 0;
  }
};

const rootReducer = combineReducers({
  testCounter,
  routing
});

export default rootReducer;
