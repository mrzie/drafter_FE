import { Observable, Subject, OperatorFunction } from "rxjs";
import { State, Tag, Blog, List, Comment, User } from "./types";
import { withLatestFrom, map, pluck } from "rxjs/operators";
import { withLoadKeyBuilder } from "../precast/operators";
import { UseSubject, DeferCleanup } from "../precast/magic";
import { upsertItem, generateAbstract } from "../precast/pure";

export const makeMutations = (state$: Observable<State>, mutations$: Subject<Partial<State>>, useSubject: UseSubject, deferCleanup: DeferCleanup) => {
    const tags$ = state$.pipe(pluck<State, Tag[]>('tags'));
    const loadStack$ = state$.pipe(pluck<State, string[]>('loadStack'));
    const lists$ = state$.pipe(pluck<State, List[]>('lists'));
    const blogs$ = state$.pipe(pluck<State, Blog[]>('blogs'));
    const comments$ = state$.pipe(pluck<State, Map<string, Comment[]>>('comments'));
    const users$ = state$.pipe(pluck<State, User[]>('users'));

    const addLoadKey$ = useSubject<string>($ => $.pipe(
        withLatestFrom(loadStack$),
        map(([key, stack]) => [...stack, key]),
        map(loadStack => ({ loadStack }))
    ).subscribe(mutations$));

    const removeLoadKey$ = useSubject<string>($ => $.pipe(
        withLatestFrom(loadStack$),
        map(([key, stack]) => stack.filter(k => k !== key)),
        map(loadStack => ({ loadStack }))
    ).subscribe(mutations$));

    const useStream = <T>(op: OperatorFunction<T, Partial<State>>) => useSubject<T>($ => op($).subscribe(mutations$));

    return {
        withLoadKey: withLoadKeyBuilder(
            loadStack$,
            addLoadKey$,
            removeLoadKey$
        ),

        upsertTag$: useStream<Tag>($ => $.pipe(
            withLatestFrom(tags$),
            map(([value, tags]) => upsertItem(
                tags,
                t => t.name === value.name,
                () => value
            )),
            map(tags => ({ tags }))
        )),
        upsertList$: useStream<[Blog[], string, number, number]>($ => $.pipe(
            withLatestFrom(lists$),
            map(([[blogs, query, pagenum, count], lists]) => {
                return upsertItem(lists, l => l.query === query, old => {
                    const syncAt = +new Date();
                    const blogIds = blogs.map(b => b.id);
                    if (old) {
                        const storedBlogs = [...old.blogs];
                        storedBlogs[pagenum] = blogIds;

                        return {
                            query,
                            blogs: storedBlogs,
                            syncAt,
                            count,
                        }
                    } else {
                        return {
                            query,
                            blogs: [blogIds],
                            syncAt,
                            count,
                        }
                    }
                });
            }),
            map(lists => ({ lists }))
        )),
        upsertBlogs$: useStream<Blog[]>($ => $.pipe(
            withLatestFrom(blogs$),
            map(([blogs, stored]) => {
                const syncAt = +new Date();
                return [
                    ...stored.filter(item => blogs.findIndex(b => b.id === item.id) === -1),
                    ...blogs.map(b => ({
                        ...b,
                        abstract: generateAbstract(b),
                        syncAt,
                    }))
                ];
            }),
            map(blogs => ({ blogs }))
        )),
        upsertComments$: useStream<[string, Comment[]]>($ => $.pipe(
            withLatestFrom(comments$),
            map(([[blogid, comments], state]) => new Map(state).set(blogid, comments)),
            map(comments => ({ comments }))
        )),
        addComment$: useStream<[string, Comment]>($ => $.pipe(
            withLatestFrom(comments$),
            map(([[blogid, comment], state]) => new Map(state).set(
                blogid,
                [...state.get(blogid), comment]
            )),
            map(comments => ({ comments }))
        )),
        upsertUsers$: useStream<User[]>($ => $.pipe(
            withLatestFrom(users$),
            map(([users, state]) => [
                ...state.filter(currentUser => users.find(u => u.id === currentUser.id) === null),
                ...users,
            ]),
            map(users => ({ users }))
        )),
        setUser$: useStream<User>($ => $.pipe(
            map(user => ({ user }))
        ))
    };
};
