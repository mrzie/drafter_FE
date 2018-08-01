import { createStore } from 'redux'
import { reducer, Types } from './reducers'


export const store = createStore(reducer);
export { Types };
export default store;
