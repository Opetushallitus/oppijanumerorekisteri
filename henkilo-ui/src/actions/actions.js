
import { INCREMENT, DECREMENT, CHANGE} from './actiontypes';

export const increment = () => ({ type: INCREMENT });
export const decrement = () => ({ type: DECREMENT });
export const change = (count) => ({type: CHANGE, count});
