import * as React from 'react';
import { useMemo, createContext, useContext } from 'react';
import { useObservableFrom, useListener } from 'fugo';
import { RouteComponentProps } from 'react-router';
import { Observable } from 'rxjs';
import { History } from 'history';

const RouteContext = createContext({} as RouteContextValue<any>);

export const useRouteContext = <T extends {}>() => useContext(RouteContext) as RouteContextValue<T>;

interface RouteContextValue<T> {
    // match$: Observable<match<T>>,
    params$: Observable<T>,
    history$: Observable<History<any>>,
}

export const Page = (C: React.ComponentType<{}>) => ({ match, history }: RouteComponentProps) => {
    const params$ = useObservableFrom(match.params);
    const history$ = useObservableFrom(history);

    useListener(() => params$.subscribe(() => window.scrollTo(0, 0)));

    const node = useMemo(() => <RouteContext.Provider value={{ params$, history$ }}>
        <C />
    </RouteContext.Provider>, []);
    return node;
};

export default Page;