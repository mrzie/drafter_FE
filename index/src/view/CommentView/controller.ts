import { fromEvent, combineLatest, concat } from "rxjs";
import { useContext, useRef } from "react";
import Context from "../../model/store";
import { map, withLatestFrom, filter, pluck, take, skip } from "rxjs/operators";
import { KEYOF_FETCH_COMMENTS } from "../../model/keyExtractor";
import { useObservable, useBehaviorSubject, useDefinition, useLayoutObservable } from "../../precast/magic";
import { Comment } from '../../model/types';
import { BlogCompProps } from "../types";
import { CommentsContextValue } from "./commentsContext";
import { commentsFromState, loadStackFromState } from "../../precast/operators";

export const commentViewController = ({ blog$, id$ }: BlogCompProps) => {
    const { state$, actions } = useContext(Context);
    const mainRef = useRef(null as HTMLDivElement);
    const layout$ = useLayoutObservable();
    const [isLoading$, comments$] = useDefinition((useSubject, deferCleanup) => {
        const comments$ = combineLatest(id$, state$.pipe(commentsFromState())).pipe(
            map(([id, comments]) => comments.get(id))
        );
        const isLoading$ = combineLatest(id$, state$.pipe(loadStackFromState())).pipe(
            map(([id, keys]) => keys.includes(KEYOF_FETCH_COMMENTS(id)))
        );

        const commentsFetcher$ = useSubject(source => source.pipe(
            map(() => mainRef.current),
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
        }));

        const fetchCommentsWhenScroll$$ = fromEvent(document, 'scroll').subscribe(commentsFetcher$);

        const fetchCommentsWhenRoute$$ = concat(
            layout$.pipe(take(1)),
            id$
        ).pipe(
            skip(1)
        ).subscribe(commentsFetcher$);

        deferCleanup(() => {
            fetchCommentsWhenScroll$$.unsubscribe();
            fetchCommentsWhenRoute$$.unsubscribe();
        });

        return [isLoading$, comments$] as [typeof isLoading$, typeof comments$];
    });


    const commentsCount = useObservable(() => comments$.pipe(
        filter(comments => !!comments),
        pluck<Comment[], number>('length')
    ), 0);
    const quoteId$ = useBehaviorSubject<string>(null);

    return [
        mainRef,
        commentsCount,
        {
            quoteId$,
            comments$,
            isLoading$,
            id$,
            blog$,
        } as CommentsContextValue,
    ] as [typeof mainRef, number, CommentsContextValue];
};

export default commentViewController;