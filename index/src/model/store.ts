import { makeContext, StoredState } from '../precast/context';
import { State } from './types';
import actions from './actions';

const Store = makeContext(actions);
const { Provider, useStore } = Store;
export type Stored = StoredState<State, typeof actions>;
export default Store;
export { Provider, useStore };