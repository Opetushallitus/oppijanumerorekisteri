import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'
import { l10n } from './l10n.reducer';
import { frontProperties } from './frontProperties.reducer';
import { kutsuList } from './kutsuList.reducer';


const rootReducer = combineReducers({
    routing,
    kutsuList,
    frontProperties,
    l10n
});

export default rootReducer;
