import { createContext } from "react";
import { Observable } from "rxjs";
import { Blog } from "../../model/types";

interface BlogContextValue {
    id$: Observable<string>,
    blog$: Observable<Blog>,
    isLoading$: Observable<boolean>,
}

export default createContext(null as BlogContextValue);