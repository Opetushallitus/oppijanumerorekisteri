import { UPDATE_ANOMUSILMOITUS } from './actiontypes';
import { AppDispatch } from '../store';

const updateAnomusilmoitusState = (value: number[]) => ({
    type: UPDATE_ANOMUSILMOITUS,
    value,
});
export const updateAnomusilmoitus = (value: number[]) => (dispatch: AppDispatch) => {
    dispatch(updateAnomusilmoitusState(value));
};
