import * as React from 'react';
import { timeFormat } from '../utils';
import { Reply } from '../svgSymbols';
import { QuoteContent } from './TextArea'
import { User, Comment } from '../models'

interface CommentListProps {
    isLoading: boolean,
    comments: Comment[],
    users: User[],
    user: User,
    onQuoteComment: React.MouseEventHandler<HTMLDivElement>
}

const CommentList = ({ isLoading, comments, users, user, onQuoteComment }: CommentListProps) => <div>
    {isLoading && <div>加载中</div>}
    {!isLoading && comments === undefined && <div>加载失败</div>}
    {comments && comments.sort((a, b) => a.time > b.time ? 1 : -1).map((comment, key, comments) => {
        const
            author = users.find(u => u.id === comment.user),
            quote = comment.ref ? comments.find(c => c.id === comment.ref) : null,
            quoteUser = quote ? users.find(u => u.id === quote.user) : null

        return <div className={comment.state === 1 ? "comment-item" : "comment-item comment-item-pending"} key={comment.id}>
            <div className="comment-avatar" style={{ backgroundImage: `url(${author && author.avatar})` }}></div>
            <div className="comment-body">
                <div className="comment-head">
                    <div className="coment-head-left">
                        <div className="comment-autor">{author && author.name}</div>
                        <div className="comment-time">{timeFormat(new Date(comment.time * 1000), 'y年m月d日')}</div>
                    </div>
                    <div className="comment-head-right" onClick={onQuoteComment} data-id={comment.id}>
                        {user && comment.state === 1 && <div className="comment-ref-this"><Reply /></div>}
                    </div>
                </div>
                {
                    quote
                        ? <div className="comment-ref">
                            <div className="comment-ref-head">
                                <div className="comment-author">{quoteUser && quoteUser.name}</div>
                                <div className="comment-time">{timeFormat(new Date(quote.time * 1000), 'y年m月d日')}</div>
                            </div>
                            {/* <div className="comment-ref-body">{quote.content}</div> */}
                            <QuoteContent content={quote.content} />
                        </div>
                        : null
                }
                <div className="comment-content">{comment.content}</div>
            </div>
        </div>
    })}
</div>

export default CommentList