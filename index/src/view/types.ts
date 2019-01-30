import { Observable, Subject } from "rxjs";
import { Blog } from "../model/types";
import { History } from "history";

export interface BlogCompProps {
    id$: Observable<string>,
    blog$: Observable<Blog>,
    history$?: Observable<History< any>>,
}