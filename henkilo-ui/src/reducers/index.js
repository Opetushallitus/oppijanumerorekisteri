import { INCREMENT, DECREMENT, CHANGE } from '../actions/actiontypes';

import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';

const testCounter = (state = 0, action) => {
    const { type } = action;
    switch(type) {
        case INCREMENT:
            return state + 1;
        case DECREMENT:
            return state - 1;
        case CHANGE:
            return action.count;
        default:
            return state;
    }
};

const rootReducer = combineReducers({
  testCounter,
  routing
});

export default rootReducer;
