import * as React from 'react';
import { useContext, memo, useMemo } from 'react';
import CommentsContext from './CommentsContext';
import { useObservable, useObservableFrom, useEventHandler, useListener } from '../../../precast/magic';
import { Comment } from '../../../model/types';
import { useStore } from '../../../model/store';
import { map, withLatestFrom } from 'rxjs/operators';
import useAuthorFrom from './useAuthorFrom';
import { timeFormat } from '../../../precast/pure';
import { Reply } from '../../../svgSymbols';
import { userFromState } from '../../../model/operators';
import { combineLatest } from 'rxjs';
import ContentCollapsable from './ContentCollapsable';

const CommentList = () => {
    const { isLoading$, comments$ } = useContext(CommentsContext);
    const isLoading = useObservable(() => isLoading$, true);
    const comments = useObservable(() => comments$, null);

    return <div>
        {isLoading && <div className="load-more">加载中</div>}
        {!isLoading && comments === null && <div>加载失败</div>}
        {comments ? comments.sort((a, b) => a.time > b.time ? 1 : -1).map(comment => <CommentItem
            comment={comment}
            key={comment.id}
        />) : null}
    </div>;
};

interface CommentItemProps {
    comment: Comment,
}

const CommentItem = memo(({ comment }: CommentItemProps) => {
    const { state$ } = useStore();
    const comment$ = useObservableFrom(comment);
    const { quoteId$, comments$ } = useContext(CommentsContext);
    const author = useAuthorFrom(state$, comment$);
    const [onQuote, quoteClick$] = useEventHandler<React.MouseEvent<HTMLDivElement>>();
    const user = useObservable(() => state$.pipe(userFromState), null);

    // quote click
    useListener(
        () => quoteClick$
            .pipe(withLatestFrom(comment$))
            .subscribe(([, comment]) => quoteId$.next(comment.id))
    );

    // quote comment
    const quote$ = useMemo(() => combineLatest(comment$, comments$).pipe(
        map(([comment, comments]) => comments ? comments.find(c => c.id === comment.ref) : null)
    ), []);

    const quote = useObservable(() => quote$, null);

    const quoteAuthor = useAuthorFrom(state$, quote$);

    const quoteView = quote ? <div className="comment-ref">
        <div className="comment-ref-head">
            <div className="comment-author">{quoteAuthor && quoteAuthor.name}</div>
            <div className="comment-time">{timeFormat(new Date(quote.time * 1000), 'y年m月d日')}</div>
        </div>
        <ContentCollapsable content={quote.content} />
    </div> : null;

    return <div
        className={comment.state === 1 ? "comment-item" : "comment-item comment-item-pending"}
        key={comment.id}
    >
        <div
            className="comment-avatar"
            style={{
                backgroundImage: `url(${author && author.avatar})`,
            }}
        />
        <div className="comment-body">
            <div className="comment-head">
                <div className="coment-head-left">
                    <div className="comment-autor">{author && author.name}</div>
                    <div className="comment-time">{timeFormat(new Date(comment.time * 1000), 'y年m月d日')}</div>
                </div>
                <div className="comment-head-right" onClick={onQuote} data-id={comment.id}>
                    {user && comment.state === 1 && <div className="comment-ref-this"><Reply /></div>}
                </div>
            </div>
            {quoteView}
            <div className="comment-content">{comment.content}</div>
        </div>
    </div>;
});

export default memo(CommentList);