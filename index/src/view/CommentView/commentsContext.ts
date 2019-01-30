import { createContext } from "react";
import { Comment, BlogId, Blog } from '../../model/types';
import { Observable, BehaviorSubject } from "rxjs";

export interface CommentsContextValue {
    quoteId$: BehaviorSubject<string>,
    comments$: Observable<Comment[]>,
    isLoading$: Observable<boolean>,
    id$: Observable<BlogId>,
    blog$ : Observable<Blog>,
}

export default createContext(null as CommentsContextValue);