import { createStore, Store, Dispatch, AnyAction } from 'redux'
import { reducer, Action } from './reducers'


export const store = createStore(reducer);

export default store;
export {
    Action
}
console.log(store)