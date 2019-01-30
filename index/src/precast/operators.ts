import { OperatorFunction, Observable, Subject } from 'rxjs';
import { withLatestFrom, map, filter, mergeMap, pairwise, startWith, partition, tap, pluck, distinctUntilChanged } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal/observable/fromPromise';
import { State, Tag, List, Blog, User, Comment } from '../model/types';

export const withLoadKeyBuilder = (
    loadStack$: Observable<string[]>,
    addLoadKey$: Subject<string>,
    removeLoadKey$: Subject<string>,
) => <T, R>(keyExtractor: (value: T) => string, fn: (value: T) => Promise<R>) => (
    $ => $.pipe(
        withLatestFrom(loadStack$),
        filter(([value, loadStack]) => !loadStack.includes(keyExtractor(value))),
        map(([value]) => [value, keyExtractor(value)] as [T, string]),
        tap(([value, key]) => addLoadKey$.next(key)),
        map(async ([value, key]) => {
            const result = await fn(value);
            return [value, result, key] as [T, R, string];
        }),
        mergeMap(v => fromPromise(v)),
        tap(([value, result, key]) => removeLoadKey$.next(key))
    )
) as OperatorFunction<T, [T, R]>;

export const onlyNotErr = filter(
    ([args, [res, err]]) => err === null as
        <A, R>(data: [A, [R, any]]) => boolean
);

const makePartition = <T>(ruler: OperatorFunction<T, [T, boolean]>, source: Observable<T>) => {
    const [passed$, intercepted$] = partition<[T, boolean]>(([value, ok]) => ok)(source.pipe(ruler));
    return [
        passed$.pipe(map(([value]) => value)),
        intercepted$.pipe(map(([value]) => value)),
    ] as [Observable<T>, Observable<T>]
};

export const debouncePartition = (duration: number) => <T>(source: Observable<T>) => makePartition(
    $ => $.pipe(
        map(value => [value, +new Date()] as [T, number]),
        startWith([null, 0] as [T, number]),
        pairwise(),
        map(
            ([
                [, prevTimer],
                [value, timer]
            ]) => [
                value,
                timer - prevTimer > duration,
            ] as [T, boolean]
        )
    ),
    source
);

export const tagsFromState = () => ($ => $.pipe(
    pluck('tags'),
    distinctUntilChanged()
)) as OperatorFunction<State, Tag[]>;

export const listsFromState = () => ($ => $.pipe(
    pluck('lists'),
    distinctUntilChanged()
)) as OperatorFunction<State, List[]>;

export const blogsFromState = () => ($ => $.pipe(
    pluck('blogs'),
    distinctUntilChanged()
)) as OperatorFunction<State, Blog[]>;

export const userFromState = () => ($ => $.pipe(
    pluck('user'),
    distinctUntilChanged()
)) as OperatorFunction<State, User>;

export const usersFromState = () => ($ => $.pipe(
    pluck('users'),
    distinctUntilChanged()
)) as OperatorFunction<State, User[]>;

export const loadStackFromState = () => ($ => $.pipe(
    pluck('loadStack'),
    distinctUntilChanged()
)) as OperatorFunction<State, string[]>;

export const commentsFromState = () => ($ => $.pipe(
    pluck('comments'),
    distinctUntilChanged()
)) as OperatorFunction<State, Map<string, Comment[]>>