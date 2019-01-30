import { useContext, useMemo, useRef } from "react";
import commentsContext from "./commentsContext";
import Context from "../../model/store";
import {
    useObservable,
    useEventHandler,
    useLayoutObservable,
    useBehaviorSubject,
    useDefinition,
} from "../../precast/magic";
import { withLatestFrom, map, filter, mapTo, pluck, throttle } from "rxjs/operators";
import { useCommentAuthor } from "./hook";
import { User, Comment } from "../../model/types";
import { BehaviorSubject, combineLatest, Observable, of } from "rxjs";
import { debouncePartition, userFromState, loadStackFromState} from "../../precast/operators";
import { KEYOF_POST_COMMENT } from "../../model/keyExtractor";
import { Exception } from "../../cgi";
import { AxiosResponse } from "axios";

export const commentInputViewController = () => {
    const { state$ } = useContext(Context);
    const hasLogin = useObservable(() => state$.pipe(userFromState(), map(user => !!user)), null);

    return [hasLogin];
};

export const commentInputBoxController = () => {
    const { comments$, quoteId$, id$ } = useContext(commentsContext);

    const { state$, actions } = useContext(Context);
    const anchor = useRef(null as HTMLDivElement);
    const text$ = useBehaviorSubject('');
    const isFocus$ = useBehaviorSubject(false);
    const isFocus = useObservable(() => isFocus$, false);
    const [onSubmit, submit$] = useEventHandler<React.MouseEvent<HTMLDivElement>>();
    
    const toastTrigger$ = useDefinition((useSubject, deferCleanup) => {
        const toastTrigger$ = useSubject<string>();
        const quote$ = quoteId$.pipe(
            withLatestFrom(comments$),
            map(([id, comments]) => comments ? comments.find(c => c.id === id) : null)
        );

        const scrollToHereWhenQuote$$ = quote$.pipe(
            map(quote => [quote, anchor.current] as [typeof quote, typeof anchor.current]),
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
        });


        const [validSubmit$, frequentSubmit$] = debouncePartition(3000)(submit$);

        const frequentWarning$$ = frequentSubmit$.pipe(
            mapTo('慢点说，不着急')
        ).subscribe(toastTrigger$);


        const postComment$$ = validSubmit$.pipe(
            withLatestFrom(text$, quoteId$, id$)
        ).subscribe(async ([, content, quote, blogid]) => {
            if (!blogid) {
                toastTrigger$.next('未知错误');
                return false;
            }
            if (content.trim() === '') {
                toastTrigger$.next('内容不能为空');
                return false;
            }
            const [, [, err]] = await actions.postComment(blogid, content, quote);
            if (err) {
                const response = err.response as AxiosResponse<Exception>;
                if (!response || !response.data) {
                    toastTrigger$.next('未知错误');
                }
                const code = response.data.code;
                if (code == 109) {
                    toastTrigger$.next('系统繁忙请稍后再试');
                } else if (code == 110) {
                    toastTrigger$.next('系统错误');
                } else {
                    toastTrigger$.next('未知错误');
                }
            } else {
                text$.next('');
            }
        });

        deferCleanup(() => {
            scrollToHereWhenQuote$$.unsubscribe();
            frequentWarning$$.unsubscribe();
            postComment$$.unsubscribe();
        });

        return toastTrigger$;
    });

    const user = useObservable(() => state$.pipe(userFromState()), null);

    return [
        anchor,
        user,
        text$,
        isFocus,
        isFocus$,
        onSubmit,
        toastTrigger$,
    ] as [
            typeof anchor,
            User,
            BehaviorSubject<string>,
            boolean,
            BehaviorSubject<boolean>,
            typeof onSubmit,
            Observable<string>
        ]
};

export const commentInputQuoteController = () => {
    const { comments$, quoteId$ } = useContext(commentsContext);
    const quote$ = useMemo(() => quoteId$.pipe(
        withLatestFrom(comments$),
        map(([id, comments]) => comments ? comments.find(c => c.id === id) : null)
    ), []);
    const quote = useObservable(() => quote$, null);
    const quoteUser = useCommentAuthor(quote$);
    const [onQuoteCancel] = useEventHandler<React.MouseEvent<HTMLDivElement>>($ => $.pipe(
        mapTo(null)
    ).subscribe(quoteId$));
    const anchorBox = useRef(null as HTMLDivElement);
    const anchorContent = useRef(null as HTMLDivElement);
    const layout$ = useLayoutObservable();

    useDefinition((useSubject, deferCleanup) => {
        const quoteAnimation$$ = layout$.pipe(
            throttle(() => quote$),
            mapTo([anchorBox, anchorContent]),
            map(([box, content]) => [box.current, content.current])
        ).subscribe(([elBox, elContent]) => {
            if (elBox) {
                if (elContent) {
                    elBox.style.height = `${elContent.clientHeight + 10}px`;
                    elBox.style.opacity = '1';
                } else {
                    elBox.style.height = '0';
                    elBox.style.opacity = '0';
                }
            }
        });

        deferCleanup(() => {
            quoteAnimation$$.unsubscribe();
        });
    });

    return [
        quote,
        quoteUser,
        onQuoteCancel,
        anchorBox,
        anchorContent,
    ] as [Comment, User, typeof onQuoteCancel, typeof anchorBox, typeof anchorContent];
};

export interface CommentTextareaProps {
    text$: BehaviorSubject<string>,
    isFocus$: BehaviorSubject<boolean>,
}

export const commentTextareaController = ({ text$, isFocus$ }: CommentTextareaProps) => {
    const [onChange] = useEventHandler<React.ChangeEvent<HTMLTextAreaElement>>($ => $.pipe(
        pluck<React.ChangeEvent<HTMLTextAreaElement>, string>('target', 'value')
    ).subscribe(text$));

    const text = useObservable(() => text$, '');
    const [onFocus] = useEventHandler($ => $.pipe(mapTo(true)).subscribe(isFocus$));
    const [onBlur] = useEventHandler($ => $.pipe(mapTo(false)).subscribe(isFocus$));
    const { id$: blogid$ } = useContext(commentsContext);
    const { state$ } = useContext(Context);
    const isPosting = useObservable(() => combineLatest(
        blogid$,
        state$.pipe(loadStackFromState())
    ).pipe(
        map(([blogid, loadStack]) => loadStack.includes(KEYOF_POST_COMMENT(blogid)))
    ), true);
    const layout$ = useLayoutObservable();
    const anchor = useRef(null as HTMLTextAreaElement);

    useDefinition((useSubject, deferCleanup) => {
        const heightAdjustment$$ = layout$.pipe(
            throttle(() => text$),
            map(() => anchor.current),
            ).subscribe(el => {
            if (!el) {
                return;
            }
            el.style.height = 'auto';
            el.style.height = `${el.scrollHeight}px`;
        });

        deferCleanup(() => {
            heightAdjustment$$.unsubscribe();
        });
    });

    return [
        text,
        onChange,
        onFocus,
        onBlur,
        isPosting,
        anchor,
    ] as [
            string,
            typeof onChange,
            typeof onFocus,
            typeof onBlur,
            boolean,
            typeof anchor
        ]
};

export interface Toast {
    content: string,
    uniq: number,
};

export interface ToastViewProps {
    toastTrigger$: Observable<string>,
};

export const toastViewController = ({ toastTrigger$ }: ToastViewProps) => {
    const toasts$ = useBehaviorSubject([] as Toast[]);
    const toasts = useObservable(() => toasts$, []);
    const [onAnimationEnd] = useEventHandler<React.AnimationEvent<HTMLDivElement>>($ => $.pipe(
        withLatestFrom(toasts$),
        map(([event, toasts]) => toasts.slice(1))
    ).subscribe(toasts$));

    useDefinition((useSubject, deferCleanup) => {
        const addition$$ = toastTrigger$.pipe(
            map((content, uniq) => ({ content, uniq }) as Toast),
            withLatestFrom(toasts$),
            map(([value, arr]) => [...arr, value])
        ).subscribe(toasts$);

        deferCleanup(() => {
            addition$$.unsubscribe();
        });
    });

    return [toasts, onAnimationEnd] as [Toast[], typeof onAnimationEnd]
};