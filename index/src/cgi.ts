import axios, { AxiosPromise, AxiosError } from 'axios';
import { Tag, Blog, User, Comment } from './model/types';
const handle = (pms => pms.then(
    data => [data.data, null],
    err => [null, err as AxiosError]
)) as { <T>(pms: AxiosPromise<T>): Promise<[T, AxiosError]> };

axios.defaults.baseURL = '/v1/';
axios.defaults.headers.post['Content-Type'] = 'application/json';

export interface ListResponse {
    tag?: Tag,
    blogs: Blog[],
    count: number,
}

export interface CommentsResponse {
    ok: boolean,
    comments: Comment[],
    users: User[],
}

export interface SimpleMessage {
    code: number,
    msg: string,
}

export interface Exception {
    code: number,
    msg: string,
    raw?: any,
    remark?: string,
}

export const fetchList = (tag: string, p: number, showTag: boolean) => {
    return handle<ListResponse>(axios.get('/blogs', {
        params: {
            tag,
            p,
            showTag,
        }
    }));
};

export const fetchComments = (id: string) => {
    return handle<CommentsResponse>(axios.get('/comments', {
        params: { blog: id, },
    }));
};

export const fetchBlog = (id: string) => {
    return handle<Blog>(axios.get(`/blog/${id}`));
};

export const logout = () => {
    return handle<SimpleMessage>(axios.get('/logout'));
};

export const postComment = (blogid: string, content: string, quote: string) => {
    return handle<Comment>(axios.post('/compose', {
        content,
        blog: blogid,
        ref: quote,
    }));
};