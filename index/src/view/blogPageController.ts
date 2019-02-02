import { BlogCompProps } from './types';
import { useContext, useRef } from "react";
import Context from "../model/store";
import { combineLatest, Observable} from "rxjs";
import { map, withLatestFrom, filter, pairwise, pluck, distinctUntilChanged, throttle, mapTo } from "rxjs/operators";
import { useLayoutObservable, useObservable, useDefinition } from "../precast/magic";
import { __basic } from "../model/conf";
import { Blog, BlogId } from "../model/types";
import { RouteObservableProps } from '../precast/page';
import { loadStackFromState, blogsFromState } from '../precast/operators';
import { KEYOF_FETCH_BLOG } from '../model/keyExtractor';

declare let PR: {
    prettyPrint: () => void
}

export const blogPageController = ({ history$, params$ }: RouteObservableProps<{ id: string }>) => {
    const { state$ } = useContext(Context);

    const [id$, blog$] = useDefinition((useSubject, deferCleanup) => {
        const id$ = params$.pipe(
            pluck<{ id: string }, string>('id'),
            distinctUntilChanged()
        );
        const blog$ = combineLatest(
            state$.pipe(blogsFromState()),
            id$
        ).pipe(map(([blogs, id]) => blogs.find(blog => blog.id === id)));

        return [id$, blog$] as [Observable<BlogId>, Observable<Blog>]
    })

    return [id$, blog$, history$] as [typeof id$, typeof blog$, typeof history$];
};


export const blogViewController = ({ id$, blog$, history$ }: BlogCompProps) => {
    const { state$, actions } = useContext(Context);
    const anchorContent = useRef(null as HTMLDivElement);
    const layout$ = useLayoutObservable();

    const isLoading$ = useDefinition((useSubject, deferCleanup) => {
        const isLoading$ = combineLatest(
            state$.pipe(loadStackFromState()),
            id$
        ).pipe(
            map(([keys, id]) => keys.includes(KEYOF_FETCH_BLOG(id)))
        );

        const scrollTop$$ = id$.subscribe(() => {
            window.scrollTo(0, 0);
        });

        const titleSettlement$$ = blog$.subscribe(blog => {
            if (!blog) {
                document.title = 'Loading...';
            } else {
                document.title = `${blog.title} | ${__basic.sitename}`;
            }
        });


        const fetchWhenRoute$$ = id$.pipe(
            withLatestFrom(blog$, isLoading$),
            filter(([id, blog, isLoading]) => !isLoading && !blog)
        ).subscribe(([id]) => {
            actions.fetchBlog(id);
        });


        const routeWhenEmpty$$ = isLoading$.pipe(
            withLatestFrom(id$, blog$),
            pairwise(),
            filter(([[, prevId], [isLoading, id, blog]]) => {
                if (isLoading) {
                    return false;
                }
                if (blog) {
                    return false;
                }
                return prevId === id;
            }),
            withLatestFrom(history$)
        ).subscribe(([, history]) => {
            history.push('/error');
        });


        const prettyPrint$$ = layout$.pipe(
            throttle(() => blog$.pipe(pluck<Blog, string>('content'))),
            map(() => anchorContent.current),
            withLatestFrom(blog$, isLoading$),
            filter(([el, blog, isLoading]) => {
                if (isLoading) {
                    return false;
                }
                if (!blog) {
                    return false;
                }
                if (!el) {
                    return false;
                }
                return true;
            })
        ).subscribe(([el]) => {
            const codeBoxes = Array.from(el.querySelectorAll('pre')).filter(pre => {
                const { firstElementChild: child } = pre;
                return child && child.nodeName === 'CODE' && child.className;
            });
            codeBoxes.forEach(pre => pre.classList.add('prettyprint'));
            try {
                if (PR) {
                    PR.prettyPrint();
                    codeBoxes.forEach(pre => {
                        const nums = document.createElement('div');
                        nums.classList.add('linenums-wrapper');
                        nums.innerText = pre.querySelector('code')
                            .innerText
                            .split('\n')
                            .map((_, index) => index + 1 + '.')
                            .join('\n');
                        pre.insertBefore(nums, pre.firstChild);
                    });
                }
            } catch (e) { }
        });

        deferCleanup(() => {
            scrollTop$$.unsubscribe();
            titleSettlement$$.unsubscribe();
            fetchWhenRoute$$.unsubscribe();
            routeWhenEmpty$$.unsubscribe();
            prettyPrint$$.unsubscribe();
        });

        return isLoading$;
    });

    const isLoading = useObservable(() => isLoading$, false);
    const blog = useObservable(() => blog$, null);

    return [isLoading, blog, anchorContent] as [boolean, Blog, typeof anchorContent]
};

export default blogViewController;