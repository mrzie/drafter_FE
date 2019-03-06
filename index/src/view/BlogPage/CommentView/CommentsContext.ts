import { createContext } from "react";
import { BehaviorSubject, Observable } from "rxjs";
import { Comment } from "../../../model/types";

interface CommentsContextValue {
    quoteId$: BehaviorSubject<string>,
    comments$: Observable<Comment[]>,
    isLoading$: Observable<boolean>,
}

export default createContext(null as CommentsContextValue);