import * as React from 'react';
import { useMemo } from 'react';
import { useObservableFrom } from './magic';
import { RouteComponentProps, match, } from 'react-router';
import { History } from 'history';
import { Observable } from 'rxjs';

export interface RouteObservableProps<T> {
    match$: Observable<match<T>>,
    history$: Observable<History>,
    params$: Observable<T>,
};

export const Page = <T extends any>(C: React.ComponentType<RouteObservableProps<T>>) => ({ match, history }: RouteComponentProps<T>) => {
    const match$ = useObservableFrom(match);
    const params$ = useObservableFrom(match.params);
    const history$ = useObservableFrom(history);
    const node = useMemo(() => <C match$={match$} history$={history$} params$={params$} />, [match$, history$, params$]);
    return node;
};

export default Page;