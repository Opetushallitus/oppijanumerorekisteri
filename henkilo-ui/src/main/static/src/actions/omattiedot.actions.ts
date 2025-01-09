import { UPDATE_ANOMUSILMOITUS } from './actiontypes';
import { AppDispatch } from '../store';

const updateAnomusilmoitusState = (value: boolean) => ({
    type: UPDATE_ANOMUSILMOITUS,
    value,
});
export const updateAnomusilmoitus = (value: boolean) => (dispatch: AppDispatch) => {
    dispatch(updateAnomusilmoitusState(value));
};
