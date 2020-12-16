import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import rootReducer from '../reducers';

const configureStore = () => createStore(rootReducer, undefined, applyMiddleware(thunkMiddleware));

export default configureStore;
