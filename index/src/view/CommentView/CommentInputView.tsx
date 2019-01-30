import * as React from 'react';
import { memo } from "react";
import {
    commentInputViewController,
    commentInputBoxController,
    commentInputQuoteController,
    commentTextareaController,
    CommentTextareaProps,
    toastViewController,
    ToastViewProps,
} from './commentInputViewController';
import { timeFormat } from '../../precast/pure';
import { Cross, Sina } from '../../svgSymbols';
import { OAuthLogin, OAuthExclusiveLogin } from '../../model/oauth';

const CommentInputView = memo(() => {
    const [hasLogin] = commentInputViewController();
    return hasLogin
        ? <CommentInputBox />
        : <CommentLoginButton />
});

const CommentInputBox = memo(() => {
    const [anchor, user, text$, isFocus, isFocus$, onSubmit, toastTrigger$] = commentInputBoxController();

    return <div
        className={isFocus ? "comment-editor comment-editor-focus" : "comment-editor"}
        ref={anchor}
    >
        <div className="comment-editor-body">
            <div className="comment-editor-user">
                <div
                    className="comment-editor-avatar"
                    style={{ backgroundImage: `url(${user.avatar})` }}
                />
                <div className="comment-editor-username">{user.name}</div>
            </div>
            <div className="comment-editor-content-wrapper">
                <CommentInputQuote />
                <CommentTextarea
                    text$={text$}
                    isFocus$={isFocus$}
                />
            </div>
        </div>
        <div className="comment-submit-button" onClick={onSubmit}>评论</div>
        <ToastView toastTrigger$={toastTrigger$} />
    </div >
});

const CommentInputQuote = () => {
    const [
        quote,
        quoteUser,
        onQuoteCancel,
        anchorBox,
        anchorContent,
    ] = commentInputQuoteController();

    return <div ref={anchorBox} className="comment-ref-box">
        {quote ? <div className="comment-ref" ref={anchorContent}>
            <div className="comment-ref-head">
                <div className="comment-head-left">
                    <div className="comment-author">{quoteUser.name}</div>
                    <div className="comment-time">{timeFormat(new Date(quote.time), 'y年m月d日')}</div>
                </div>
                <div className="comment-head-right">
                    <div className="comment-ref-cancle" onClick={onQuoteCancel}><Cross /></div>
                </div>
            </div>
            <div className="comment-ref-body">
                {quote.content}
            </div>
        </div>
            : null}
    </div>
};

const CommentTextarea = (props: CommentTextareaProps) => {
    const [
        text,
        onChange,
        onFocus,
        onBlur,
        isPosting,
        anchor,
    ] = commentTextareaController(props);

    return <textarea
        className="comment-editor-content"
        placeholder="真热啊今天"
        onChange={onChange}
        ref={anchor}
        value={text}
        onFocus={onFocus}
        onBlur={onBlur}
        readOnly={isPosting}
    />
};

const ToastView = (props: ToastViewProps) => {
    const [toasts, onAnimationEnd] = toastViewController(props);
    return <div className="toast-view-container">
        {toasts.map(t => (
            <div className="toast-box" key={t.uniq} onAnimationEnd={onAnimationEnd}>
                {t.content}
            </div>
        ))}
    </div>
}

const CommentLoginButton = () => {
    return <div className="flex-row-container">
        <div
            className="login-button"
            onClick={OAuthLogin}
        >
            <Sina /> 登陆后发表评论
        </div>
        <div
            className="exclusive-login-button"
            onClick={OAuthExclusiveLogin}
        >
            强势登陆
        </div>
    </div>
};

export default CommentInputView;