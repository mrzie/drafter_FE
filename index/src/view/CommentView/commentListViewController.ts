import { combineLatest } from "rxjs";
import { Comment, User } from "../../model/types";
import { useContext, useMemo } from "react";
import commentsContext from "./commentsContext";
import Context from "../../model/store";
import { map } from "rxjs/operators";
import { useEventHandler, useObservable, useObservableFrom } from "../../precast/magic";
import { useCommentAuthor } from "./hook";
import { userFromState } from "../../precast/operators";

export const commentListViewController = () => {
    const { comments$, quoteId$, isLoading$, blog$ } = useContext(commentsContext);

    const comments = useObservable(() => comments$, null);
    const isLoading = useObservable(() => combineLatest(isLoading$, blog$).pipe(
        map(([isLoading, blog]) => isLoading || !blog)
    ), false);
    const [onQuote] = useEventHandler<React.MouseEvent<HTMLDivElement>>($ => $.pipe(
        map(event => event.currentTarget.getAttribute('data-id'))
    ).subscribe(quoteId$));

    return [
        comments,
        isLoading,
        onQuote
    ] as [typeof comments, boolean, typeof onQuote];
};

export interface CommentItemProps {
    comment: Comment,
    onQuote: React.MouseEventHandler<HTMLDivElement>
}

export const commentItemController = ({ comment }: CommentItemProps) => {
    const { state$ } = useContext(Context);
    const comment$ = useObservableFrom(comment);
    const author = useCommentAuthor(comment$);
    const user = useObservable(() => state$.pipe(userFromState()), null);

    return [author, user];
}

export interface CommentItemQuoteProps {
    id: string,
}

export const commentItemQuoteController = ({ id }: CommentItemQuoteProps) => {
    const id$ = useObservableFrom(id);
    const { comments$ } = useContext(commentsContext);
    const quote$ = useMemo(() => combineLatest(id$, comments$).pipe(
        map(([id, comments]) => comments ? comments.find(c => c.id === id) : null)
    ), []);
    const quote = useObservable(() => quote$, null);
    const author = useCommentAuthor(quote$);

    return [quote, author] as [Comment, User];
}