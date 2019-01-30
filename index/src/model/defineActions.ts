import { Observable, Subject, of } from "rxjs";
import { State, BlogId, Blog, Comment } from "./types";
import * as apis from '../cgi';
import { withLatestFrom, map, publish, filter, mapTo } from "rxjs/operators";
import { onlyNotErr } from "../precast/operators";
import { useDefinition } from "../precast/magic";
import * as keyExtractors from './keyExtractor';
import { loginResult$ } from "./oauth";
import { makeMutations } from "./mutations";
import { AxiosError } from "axios";

export default (
    state$: Observable<State>,
    mutations$: Subject<Partial<State>>
) => useDefinition((useSubject, deferCleanup) => {

    const {
        withLoadKey,

        upsertList$,
        upsertTag$,
        upsertBlogs$,
        upsertComments$,
        addComment$,
        upsertUsers$,
        setUser$,
    } = makeMutations(state$, mutations$, useSubject, deferCleanup);

    const setUserWhenLogin$$ = loginResult$.subscribe(user => setUser$.next(user));

    deferCleanup(() => {
        setUserWhenLogin$$.unsubscribe();
    });

    return {
        logout() {
            const source = of(null).pipe(
                withLoadKey(
                    keyExtractors.KEYOF_LOGOUT,
                    () => apis.logout()
                )
            );
            const published = publish<[string, [apis.SimpleMessage, AxiosError]]>()(source);
            const pms = published.toPromise();

            published.pipe(mapTo(null)).subscribe(user => setUser$.next(user));

            published.connect();
            return pms;
        },

        fetchList(tagname: string, page: number) {
            const source = of([tagname, page]).pipe(
                withLatestFrom(state$),
                map(([[tagname, page], state]) => [
                    tagname,
                    page,
                    tagname && !state.tags.find(t => t.name === tagname)
                ] as [string, number, boolean]),
                withLoadKey(
                    ([tagname, page]) => keyExtractors.KEYOF_FETCH_LIST(tagname, page),
                    ([tagname, page, showTag]) => apis.fetchList(tagname, page, showTag)
                ),
            );
            const published = publish<[[string, number, boolean], [apis.ListResponse, AxiosError]]>()(source);
            const pms = published.toPromise();

            published.pipe(onlyNotErr).subscribe(([[tagname, page, showTag], [{ blogs, count, tag }]]) => {
                if (showTag) {
                    upsertTag$.next(tag);
                }
                upsertList$.next([blogs, tagname, page, count]);
                upsertBlogs$.next(blogs);
            });

            published.connect();
            return pms;
        },

        fetchComments(blogid: BlogId) {
            const source = of(blogid).pipe(
                withLoadKey(
                    keyExtractors.KEYOF_FETCH_COMMENTS,
                    blogid => apis.fetchComments(blogid)
                )
            );
            const published = publish<[string, [apis.CommentsResponse, AxiosError]]>()(source);
            const pms = published.toPromise();

            published.pipe(onlyNotErr).subscribe(([blogid, [{ comments, users, ok }]]) => {
                if (ok) {
                    upsertUsers$.next(users);
                    upsertComments$.next([blogid, comments]);
                }
            });

            published.connect();
            return pms;
        },

        fetchBlog(blogid: BlogId) {
            const source = of(blogid).pipe(
                withLoadKey(
                    keyExtractors.KEYOF_FETCH_BLOG,
                    id => apis.fetchBlog(id)
                )
            );
            const published = publish<[string, [Blog, AxiosError]]>()(source);
            const pms = published.toPromise();

            published.pipe(onlyNotErr).subscribe(([id, [blog]]) => {
                upsertBlogs$.next([blog]);
            });

            published.connect();
            return pms;
        },

        postComment(blogid: BlogId, content: string, quote: string) {
            const source = of({ blogid, content, quote }).pipe(
                withLatestFrom(state$),
                filter(([, state]) => !!state.user),
                map(([values]) => values),
                withLoadKey(
                    ({ blogid }) => keyExtractors.KEYOF_POST_COMMENT(blogid),
                    ({ blogid, content, quote }) => apis.postComment(blogid, content, quote)
                ),
            );
            const published = publish<[{
                blogid: string,
                content: string,
                quote: string
            }, [Comment, AxiosError]]>()(source);
            const pms = published.toPromise();

            published.pipe(onlyNotErr).subscribe(([{ blogid }, [comment]]) => {
                addComment$.next([blogid, comment]);
            });

            published.connect();
            return pms;
        }
    };
});