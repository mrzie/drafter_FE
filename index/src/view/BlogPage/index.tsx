import * as React from 'react';
import { useMemo } from 'react';
import Page, { useRouteContext } from '../../precast/page';
import { useStore } from '../../model/store';
import { useListener } from '../../precast/magic';
import { combineLatest } from 'rxjs';
import { withLatestFrom, pluck, map, filter, pairwise, distinctUntilChanged } from 'rxjs/operators';
import { __basic } from '../../model/conf';
import { loadStackFromState, blogsFromState } from '../../model/operators';
import { KEYOF_FETCH_BLOG } from '../../model/keyExtractor';
import BlogContext from './BlogContext';
import BlogView from './BlogView';
import CommentView from './CommentView';


const BlogPage = () => {
    const { state$, actions } = useStore();
    const { params$, history$ } = useRouteContext<{ id: string }>();

    const sinks = useMemo(() => {
        const id$ = params$.pipe(
            pluck<{ id: string }, string>('id'),
            distinctUntilChanged()
        );
        const blog$ = combineLatest(state$.pipe(blogsFromState), id$).pipe(
            map(([blogs, id]) => blogs.find(blog => blog.id === id))
        );

        const isLoading$ = combineLatest(state$.pipe(loadStackFromState), id$).pipe(
            map(([keys, id]) => keys.includes(KEYOF_FETCH_BLOG(id)))
        );

        return { id$, blog$, isLoading$ };
    }, []);

    const { id$, blog$, isLoading$ } = sinks;

    // set title 
    useListener(() => blog$.subscribe(blog => {
        if (!blog) {
            document.title = 'Loading...';
        } else {
            document.title = `${blog.title} | ${__basic.sitename}`;
        }
    }));

    // fetch blog 
    useListener(() => id$.pipe(
        withLatestFrom(blog$, isLoading$),
        filter(([id, blog, isLoading]) => !isLoading && !blog)
    ).subscribe(([id]) => {
        actions.fetchBlog(id);
    }));

    // empty handler 
    useListener(() => isLoading$.pipe(
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
    }));

    return <BlogContext.Provider value={sinks}>
        <div>
            <BlogView />
            <CommentView />
        </div>
    </BlogContext.Provider>
};

export default Page(BlogPage);