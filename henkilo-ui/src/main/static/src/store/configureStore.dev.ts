import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import rootReducer from '../reducers';

const configureStore = () => {
    const isDev = process.env.NODE_ENV !== 'production';
    const isClient = typeof window !== 'undefined';
    const composeEnchancers = (isDev && isClient && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

    return createStore(rootReducer, undefined, composeEnchancers(applyMiddleware(thunkMiddleware)));
};

export default configureStore;
