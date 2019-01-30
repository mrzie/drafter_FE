import * as React from 'react';
import { memo } from "react";
import {
    commentListViewController,
    CommentItemProps,
    commentItemController,
    CommentItemQuoteProps,
    commentItemQuoteController,
} from './commentListViewController';
import { timeFormat } from '../../precast/pure';
import { Reply } from '../../svgSymbols';
import ContentCollapsable from './ContentCollapsable';



const CommentListView = memo(() => {
    const [comments, isLoading, onQuote] = commentListViewController();
    return <div>
        {isLoading && <div className="load-more">加载中</div>}
        {!isLoading && comments === undefined && <div>加载失败</div>}
        {comments ? comments.sort((a, b) => a.time > b.time ? 1 : -1).map(comment => <CommentItem
            comment={comment}
            onQuote={onQuote}
            key={comment.id}
        />) : null}
    </div>;
});


const CommentItem = memo((props: CommentItemProps) => {
    const { comment, onQuote } = props;
    const [author, user] = commentItemController(props);

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
            <CommentItemQuote id={comment.ref} />
            <div className="comment-content">{comment.content}</div>
        </div>
    </div>;
});


const CommentItemQuote = (props: CommentItemQuoteProps) => {
    const [quote, author] = commentItemQuoteController(props);

    if (!quote) {
        return null;
    }
    return <div className="comment-ref">
        <div className="comment-ref-head">
            <div className="comment-author">{author && author.name}</div>
            <div className="comment-time">{timeFormat(new Date(quote.time * 1000), 'y年m月d日')}</div>
        </div>
        <ContentCollapsable content={quote.content} />
    </div>
};

export default CommentListView;