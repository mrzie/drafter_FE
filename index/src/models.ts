
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
    // 博客的id
    /** Map<页码,博客id> */
    blogs: string[][],
}

// export type Lists = Map<string, List>
/**
 * 这里要想办法解决一个问题，用户打开一篇blog，其实它的权重是比较高的。用户非常可能反复看。（返回操作
 * 但是List保存的博客用户可能只是扫一眼
 * 其实，缓存只有两个场景有用
 * 1. 打开了一个重复的列表
 * 2. 打开过列表或者打开过blog，重新打开了博客
 */
export interface Blog {
    id: string,
    title: string,
    content: string,
    tags: string[],
    createAt: number,
    editAt: number,
    abstract?: string,
    syncAt?: number,
    // comments?: Comment[],
}

export interface Comment {
    id: string,
    ref: string,
    user: string,
    time: number,
    content: string,
    state: number,
}

export interface TagCloud {
    [name: string]: number
}

export interface Basic {
    sitename: string,
    domain: string,
    intro: string,
    author: string,
    ICP: string,
}

export interface User {
    id: string,
    name: string,
    avatar: string,
    profile: string,
}

export interface State {
    tags: Tag[],
    // tagCloud: TagCloud,
    lists: List[], // 最多缓存10页
    blogs: Blog[],
    // tagsSyncAt: number,
    // listLoadStack: string[],
    // blogLoadStack: string[],
    // commentLoadStack: string[],
    loadStack: string[],
    users: User[],
    user: User,
    comments: Map<string, Comment[]>,
}