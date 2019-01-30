export const KEYOF_LOGOUT=() => 'logout';
export const KEYOF_FETCH_LIST = (tagname: string, page: number) => `list.${tagname}.${page}`;
export const KEYOF_FETCH_COMMENTS = (blogid: string) => `comments.${blogid}`;
export const KEYOF_FETCH_BLOG = (id: string) => `blog.${id}`;
export const KEYOF_POST_COMMENT = (blogid: string) => `postComment.${blogid}`;