import { pluck, distinctUntilChanged, pairwise, map, partition, startWith } from "rxjs/operators";
import { OperatorFunction, Observable } from "rxjs";
import { State, Comment, Tag, List, Blog, User } from "../../src/model/types";

export const tagsFromState = ($ => $.pipe(
    pluck('tags'),
    distinctUntilChanged()
)) as OperatorFunction<State, Tag[]>;

export const listsFromState = ($ => $.pipe(
    pluck('lists'),
    distinctUntilChanged()
)) as OperatorFunction<State, List[]>;

export const blogsFromState = ($ => $.pipe(
    pluck('blogs'),
    distinctUntilChanged()
)) as OperatorFunction<State, Blog[]>;

export const userFromState = ($ => $.pipe(
    pluck('user'),
    distinctUntilChanged()
)) as OperatorFunction<State, User>;

export const usersFromState = ($ => $.pipe(
    pluck('users'),
    distinctUntilChanged()
)) as OperatorFunction<State, User[]>;

export const loadStackFromState = ($ => $.pipe(
    pluck('loadStack'),
    distinctUntilChanged()
)) as OperatorFunction<State, string[]>;

export const commentsFromState = ($ => $.pipe(
    pluck('comments'),
    distinctUntilChanged()
)) as OperatorFunction<State, Map<string, Comment[]>>;

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