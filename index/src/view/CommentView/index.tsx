import * as React from 'react';
import { BlogCompProps } from '../types';
import CommentListView from './CommentListView';
import CommentsContext from './commentsContext';
import commentViewController from './controller'
import CommentInputView from './CommentInputView';

export const CommentView = (props: BlogCompProps) => {
    const [mainRef, commentsCount, context] = commentViewController(props);

    return <CommentsContext.Provider value={context}>
        <div ref={mainRef}>
            <div className="comments-title">留言（{commentsCount}）</div>
            <CommentListView />
            <CommentInputView />
        </div>
    </CommentsContext.Provider>
};

export default CommentView;