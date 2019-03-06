import { createContext, ReactNode, useMemo, useEffect, createElement, useContext } from "react";
import { BehaviorSubject, Observable, of, concat } from "rxjs";
import { take, debounce, distinctUntilChanged } from "rxjs/operators";
import { animationFrame } from "rxjs/internal/scheduler/animationFrame";


export interface MutationDefiner<S, Args extends any[]> {
    (...args: Args): (state: S) => Partial<S>,
};

export interface MutationsDefiner<S> {
    [name: string]: MutationDefiner<S, any[]>
};

type Mutations<D extends MutationsDefiner<any>> = {
    [P in keyof D]: (...any: Parameters<D[P]>) => void
};

export interface MutationsMaker<S> {
    <D extends MutationsDefiner<S>>(definer: D): Mutations<D>
};

export interface ActionsFactory<S> {
    (getState: () => S, makeMutations: MutationsMaker<S>): {
        [name: string]: Function
    }
};

export type StoredState<S, F extends ActionsFactory<S>> = {
    state$: Observable<S>,
    actions: ReturnType<F>,
};

export type Stored<T, F extends ActionsFactory<T>> = {
    Provider: React.ComponentType<ProviderProps<T>>,
    useStore: () => StoredState<T, F>,
    context: React.Context<StoredState<T, F>>,
}

export const makeContext = <F extends ActionsFactory<any>>(actions: F) => {
    type T = F extends ActionsFactory<infer T> ? T : any
    const context = createContext(null as StoredState<T, F>);
    return {
        Provider: ProviderFactory(context, actions),
        useStore: () => useContext(context),
        context, 
    } as Stored<T, F>;
};

type ProviderProps<T> = {
    initValue: T,
    children?: ReactNode,
};

const ProviderFactory = <T, F extends ActionsFactory<T>>(
    context: React.Context<StoredState<T, F>>,
    actionsFactory: F,
) => ((props: ProviderProps<T>) => {
    const [state$, actions, cleanUp] = useMemo(() => {
        const source$ = new BehaviorSubject(props.initValue);
        const state$ = concat(
            source$.pipe(take(1)),
            source$.pipe(
                debounce(() => of(animationFrame))
            )
        ).pipe(distinctUntilChanged());

        const getState = () => source$.value;

        // simplify bottom data struct
        const execReducer = (reducer: (state: T) => Partial<T>) => {
            const state = getState();
            source$.next({ ...state, ...reducer(state) });
        };

        const makeMutations: MutationsMaker<T> = definer => Object.entries(definer).reduce(
            (mutations, [key, def]) => {
                mutations[key] = (...args) => execReducer(def(...args));
                return mutations;
            },
            {} as Mutations<typeof definer>
        );

        const cleanUp = () => source$.complete();

        const actions = actionsFactory(getState, makeMutations);

        return [
            state$,
            actions,
            cleanUp,
        ] as [Observable<T>, ReturnType<F>, () => void]
    }, []);

    useEffect(() => cleanUp, []);

    return createElement(context.Provider, {
        value: { state$, actions },
        children: props.children
    });
});