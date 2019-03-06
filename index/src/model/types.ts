export interface Tag {
    name: string,
    count: number,
    description?: string,
}

export interface List {
    /**
     * 表示列表的查询条件
     * [查询的tag名或Null, 页数]
     */
    // query: [string, number],
    syncAt: number,
    query: string,
    count: number,
    /** Map<页码,博客id> */
    blogs: string[][],
}

export interface Blog {
    id: string,
    title: string,
    content: string,
    tags: string[],
    createAt: number,
    editAt: number,
    abstract?: string,
}

export interface Comment {
    id: string,
    ref: string,
    user: string,
    time: number,
    content: string,
    state: number,
}

export interface Basic {
    sitename: string,
    domain: string,
    intro: string,
    author: string,
    ICP: string,
    sinaClientId: string,
}

export interface User {
    id: string,
    name: string,
    avatar: string,
    profile: string,
}

export interface State {
    tags: Tag[],
    lists: List[], // 最多缓存10页
    blogs: Blog[],
    loadStack: string[],
    users: User[],
    user: User,
    comments: Map<string, Comment[]>,
}
