import * as React from 'react';
import { memo, useContext, useMemo, useLayoutEffect, useRef } from 'react';
import { useStore } from '../../../model/store';
import BlogContext from '../BlogContext';
import { combineLatest, concat, fromEvent, merge } from 'rxjs';
import { commentsFromState, loadStackFromState } from '../../../model/operators';
import { map, take, skip, withLatestFrom, filter } from 'rxjs/operators';
import { KEYOF_FETCH_COMMENTS } from '../../../model/keyExtractor';
import { useListener, useBehaviorSubject, useSubject } from '../../../precast/magic';
import CommentsContext from './CommentsContext';
import CommentsHeader from './CommentsHeader';
import CommentList from './CommentList';
import { useRouteContext } from '../../../precast/page';
import CommentInput from './CommentInput';

const CommentView = () => {
    const { state$, actions } = useStore();
    const { id$, blog$ } = useContext(BlogContext);
    const refBox = useRef(null as HTMLDivElement);

    const firstLayout$ = useSubject();
    useLayoutEffect(() => firstLayout$.next(null), []);

    const { isLoading$, comments$ } = useMemo(() => {
        const comments$ = combineLatest(id$, state$.pipe(commentsFromState)).pipe(
            map(([id, comments]) => comments.get(id))
        );
        const isLoading$ = combineLatest(id$, state$.pipe(loadStackFromState)).pipe(
            map(([id, keys]) => keys.includes(KEYOF_FETCH_COMMENTS(id)))
        );

        return { isLoading$, comments$ };
    }, []);

    // fetch comments
    useListener(() => {
        const afterRoute$ = concat(firstLayout$.pipe(take(1)), blog$).pipe(
            skip(1)
        );
        const afterScroll$ = fromEvent<UIEvent>(document, 'scroll');

        return merge(afterRoute$, afterScroll$).pipe(
            map(() => refBox.current),
            withLatestFrom(id$, isLoading$, comments$, blog$),
            filter(([el, id, isLoading, comments, blog]) => {
                if (comments) {
                    return false;
                }
                if (!blog) {
                    // load blog first
                    return false;
                }
                if (isLoading) {
                    return false;
                }
                if (!id) {
                    return false;
                }
                if (!el) {
                    return false;
                }
                const commentsViewReached = window.pageYOffset + window.innerHeight > el.offsetTop;
                return commentsViewReached;
            })
        ).subscribe(([, id]) => {
            actions.fetchComments(id);
        });
    });

    const quoteId$ = useBehaviorSubject(null as string);

    const { params$ } = useRouteContext();
    // clean quoteId when route
    useListener(() => params$.subscribe(() => quoteId$.next(null)));

    return <CommentsContext.Provider value={{ quoteId$, isLoading$, comments$ }}>
        <div ref={refBox}>
            {/* <div className="comments-title">留言（{commentsCount}）</div> */}
            <CommentsHeader />
            <CommentList />
            <CommentInput />
        </div>
    </CommentsContext.Provider>
};

export default memo(CommentView);