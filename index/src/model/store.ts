import { createContext } from 'react';
import { Observable } from 'rxjs';
import { State, BlogId, PageNumber, TagName, Blog, Comment } from './types';
import { SimpleMessage, ListResponse, CommentsResponse } from '../cgi';
import { AxiosError } from 'axios';

interface Actions {
    logout(): Promise<[any, [SimpleMessage, AxiosError]]>,
    fetchList(tagname: TagName, page: PageNumber): Promise<[[TagName, PageNumber, boolean], [ListResponse, AxiosError]]>,
    fetchComments(blogid: BlogId): Promise<[BlogId, [CommentsResponse, AxiosError]]>,
    fetchBlog(blogid: BlogId): Promise<[BlogId, [Blog, AxiosError]]>,
    postComment(blogid: BlogId, content: string, quote: string): Promise<[
        { blogid: BlogId, content: string, quote: string },
        [Comment, AxiosError]
    ]>
}

export interface Store {
    state$: Observable<State>,
    actions: Actions
}
export const Context = createContext(null as Store);

export default Context;