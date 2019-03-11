import * as React from 'react';
import { useContext, memo, useMemo, useRef, createContext, FunctionComponent } from 'react';
import CommentsContext from './CommentsContext';
import { useObservable, useEventHandler, useListener, useWhenLayout } from 'fugo';
import { useStore } from '../../../model/store';
import { userFromState, debouncePartition, loadStackFromState } from '../../../model/operators';
import { Cross } from '../../../svgSymbols';
import { map, withLatestFrom, mapTo, pluck, throttle, filter, scan, startWith, refCount } from 'rxjs/operators';
import { BehaviorSubject, merge, combineLatest, Subject } from 'rxjs';
import BlogContext from '../BlogContext';
import { timeFormat, handleReject } from '../../../precast/pure';
import useAuthorFrom from './useAuthorFrom';
import { KEYOF_POST_COMMENT } from '../../../model/keyExtractor';
import { useRouteContext } from '../../../precast/page';
import { AxiosError, AxiosResponse } from 'axios';
import { Errors } from '../../../model/actions';
import { Exception } from '../../../model/cgi';

interface CommentInputContextValue {
    isFocus$: BehaviorSubject<boolean>,
    text$: BehaviorSubject<string>,
    toast$: Subject<string>,
}

const CommentInputContext = createContext(null as CommentInputContextValue);

const CommentInputBox = () => {
    const context = useMemo(() => {
        return {
            isFocus$: new BehaviorSubject(false),
            text$: new BehaviorSubject(''),
            toast$: new Subject<string>(),
        }
    }, []);
    const { params$ } = useRouteContext();
    // clean text when route
    useListener(() => params$.subscribe(() => context.text$.next('')));

    return <CommentInputContext.Provider value={context}>
        <CommentInputBoxContainer>

            <div className="comment-editor-body">
                <UserView />
                <div className="comment-editor-content-wrapper">
                    <CommentInputQuote />
                    <CommentTextarea />
                </div>
            </div>
            <CommentSubmit />
            <ToastView />

        </CommentInputBoxContainer>
    </CommentInputContext.Provider>
};

const CommentInputBoxContainer: FunctionComponent = ({ children }) => {
    const ref = useRef(null as HTMLDivElement);
    const { isFocus$ } = useContext(CommentInputContext);
    const isFocus = useObservable(() => isFocus$, false);
    const child = useMemo(() => children, []);
    const { quoteId$, comments$ } = useContext(CommentsContext);

    // scroll when quote
    useListener(() => combineLatest(quoteId$, comments$).pipe(
        map(([id, comments]) => comments ? comments.find(c => c.id === id) : null),
        map(quote => [quote, ref.current] as [typeof quote, typeof ref.current]),
        filter(([quote, el]) => {
            if (!quote) {
                return false;
            }
            if (!el) {
                return false;
            }
            return true;
        })
    ).subscribe(([, el]) => {
        window.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
    }));

    return <div
        className={isFocus ? "comment-editor comment-editor-focus" : "comment-editor"}
        ref={ref}
    >
        {child}
    </div >;
};

const UserView = () => {
    const { state$ } = useStore();
    const user = useObservable(() => userFromState(state$), null);
    if (!user) {
        // never
        return;
    }
    return <div className="comment-editor-user">
        <div
            className="comment-editor-avatar"
            style={{ backgroundImage: `url(${user.avatar})` }}
        />
        <div className="comment-editor-username">{user.name}</div>
    </div>;
};

const CommentInputQuote = () => {
    const { quoteId$, comments$ } = useContext(CommentsContext);
    const [onQuoteCancel, cancel$] = useEventHandler();
    const refBox = useRef(null as HTMLDivElement);
    const refContent = useRef(null as HTMLDivElement);
    const { state$ } = useStore();

    const quote$ = useMemo(() => quoteId$.pipe(
        withLatestFrom(comments$),
        map(([id, comments]) => comments ? comments.find(c => c.id === id) : null)
    ), []);
    const quote = useObservable(() => quote$, null);
    const quoteUser = useAuthorFrom(state$, quote$);

    // cancel quote
    useListener(() => cancel$.subscribe(() => quoteId$.next(null)));

    const ref$ = useWhenLayout(() => ({
        box: refBox.current,
        content: refContent.current,
    }));
    // quote animation
    useListener(() => ref$.pipe(
        throttle(() => quote$),
    ).subscribe(({ box: elBox, content: elContent }) => {
        if (elBox) {
            if (elContent) {
                elBox.style.height = `${elContent.clientHeight + 10}px`;
                elBox.style.opacity = '1';
            } else {
                elBox.style.height = '0';
                elBox.style.opacity = '0';
            }
        }
    }));

    return <div ref={refBox} className="comment-ref-box">
        {
            quote
                ? <div className="comment-ref" ref={refContent}>
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
                : null
        }
    </div>
};

const CommentTextarea = () => {
    const [onBlur, blur$] = useEventHandler();
    const [onFocus, focus$] = useEventHandler();
    const { isFocus$, text$ } = useContext(CommentInputContext);
    const { id$ } = useContext(BlogContext);
    const { state$ } = useStore();
    const ref = useRef(null as HTMLTextAreaElement);
    const isPosting = useObservable(() => combineLatest(id$, loadStackFromState(state$)).pipe(
        map(([blogid, loadStack]) => loadStack.includes(KEYOF_POST_COMMENT(blogid)))
    ), true);
    const ref$ = useWhenLayout(() => ref.current);

    // set focus
    useListener(() => merge(
        blur$.pipe(mapTo(false)),
        focus$.pipe(mapTo(true))
    ).subscribe(v => isFocus$.next(v)));

    // height adjustment
    useListener(() => ref$.pipe(
        throttle(() => text$),
    ).subscribe(el => {
        if (!el) {
            return;
        }
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    }));

    return <TextArea
        text$={text$}
        onFocus={onFocus}
        onBlur={onBlur}
        refTextArea={ref}
        readOnly={isPosting}
    />
};

interface TextAreaProps {
    text$: BehaviorSubject<string>,
    refTextArea: React.MutableRefObject<HTMLTextAreaElement>,
    onFocus: (e: any) => void,
    onBlur: (e: any) => void,
    readOnly: boolean,
}

const TextArea = ({ text$, refTextArea, onFocus, onBlur, readOnly }: TextAreaProps) => {
    const [onChange, change$] = useEventHandler<React.ChangeEvent<HTMLTextAreaElement>>();

    // set text
    useListener(() => change$.pipe(
        pluck<React.ChangeEvent<HTMLTextAreaElement>, string>('target', 'value')
    ).subscribe(text => text$.next(text)));

    const text = useObservable(() => text$, '');

    return <textarea
        className="comment-editor-content"
        placeholder="真热啊今天"
        onChange={onChange}
        ref={refTextArea}
        value={text}
        onFocus={onFocus}
        onBlur={onBlur}
        readOnly={readOnly}
    />
}

const CommentSubmit = () => {
    const { actions } = useStore();
    const { quoteId$ } = useContext(CommentsContext);
    const { id$ } = useContext(BlogContext);
    const { text$, toast$ } = useContext(CommentInputContext);
    const [onSubmit, submit$] = useEventHandler();
    const [validSubmit$, frequentSubmit$] = useMemo(() => debouncePartition(3000)(submit$), []);

    // submit frequent warning
    useListener(() => frequentSubmit$.pipe(
        mapTo('慢点说，不着急')
    ).subscribe(toast$));

    // submit callback warning
    useListener(() => validSubmit$.pipe(
        withLatestFrom(text$, quoteId$, id$)
    ).subscribe(async ([, content, quote, blogid]) => {
        if (!blogid) {
            toast$.next('未知错误');
            return false;
        }
        if (content.trim() === '') {
            toast$.next('内容不能为空');
            return false;
        }
        const err = await handleReject<AxiosError | Errors>(actions.postComment(blogid, content, quote));
        if (err === Errors.userRequired) {
            toast$.next('未知错误，请刷新重试');
        } else if (err) {
            const response = err.response as AxiosResponse<Exception>;
            if (!response || !response.data) {
                toast$.next('未知错误');
            }
            const code = response.data.code;
            if (code == 109) {
                toast$.next('系统繁忙请稍后再试');
            } else if (code == 110) {
                toast$.next('系统错误');
            } else {
                toast$.next('未知错误');
            }
        } else {
            text$.next('');
        }
    }));

    return <div className="comment-submit-button" onClick={onSubmit}>评论</div>
};

interface Toast {
    content: string,
    uniq: number,
};

const ToastView = () => {
    const { toast$ } = useContext(CommentInputContext);
    const [onAnimationEnd, animationEnd$] = useEventHandler<React.AnimationEvent<HTMLDivElement>>();

    const toasts = useObservable(() => merge(toast$, animationEnd$).pipe(
        scan<string | React.AnimationEvent, Toast[]>((toasts, value, uniq) => {
            if (typeof value === 'string') {
                return [...toasts, { content: value, uniq }];
            } else {
                return toasts.slice(1)
            }
        }, [] as Toast[]),
        startWith([] as Toast[])
    ), []);

    return <div className="toast-view-container">
        {toasts.map(t => (
            <div className="toast-box" key={t.uniq} onAnimationEnd={onAnimationEnd}>
                {t.content}
            </div>
        ))}
    </div>
}

export default memo(CommentInputBox);