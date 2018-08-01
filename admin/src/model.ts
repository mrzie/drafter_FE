
export interface Note {
    id: string,
    // idHolder?: string,  // 新建日志时使用
    title: string,
    content?: string,
    abstract: string,
    tags: string[],
    notebookid: string,
    createAt: number,
    editAt: number,
    alive: boolean,
    titleCache?: string,
    tagsCache?: string[],
    contentCache?: string,
}

export interface TempNote {
    tempId: string,
    notebookid: string,
    createAt: number,
    editAt: number,
    alive: true,
}

export interface Notebook {
    id: string,
    name: string,
    count: number,
    syncAt: number, // 上一次与服务器同步的时间，超过x分钟需要重新同步
    // notes: Note[]
    // 该笔记本预览的note的id，未找到或null会展示第一篇
    // preview?: string
}

export interface Blog {
    id: string,
    title: string,
    content?: string,
    tags: string[],
    createAt: number,
    editAt: number,
    noteid: string,
    alive: boolean,
}

export interface Tag {
    name: string,
    description: string,
    count: number,
    cache?: string,
}

export interface Interactions {
    loadings: string[],
    currentNotebook: string,
    currentNote: string,
    wasteBasketSyncAt: number, // 记录废纸篓是否加载
    blogsSyncAt: number,
    tagsSyncAt: number,
    modals: Modal[],
    warnings: Warning[],
    commentLoadMarks: { [name: string]: CommentLoadState },
}

export enum CommentLoadState {
    LOADING = 0,
    LOADED = 1,
    LOADFAIL = 2,
}

export interface State {
    notes: (Note | TempNote)[],
    notebooks: Notebook[],
    blogs: Blog[],
    tags: Tag[],
    authenticate?: boolean,
    preference: Preference,
    interactions: Interactions, // 作为变量记录页面上的交互数据。如呈现的notebook。我还没想好内容
    uploadQueue: UploadTask[],
    comments: Comment[],
    users: User[],
}

export interface Choice {
    text: string,
    then: () => (Promise<any> | boolean),
    disabled?: boolean,
}

export interface Modal {
    id: number,
    content: string,
    title: string,
    choices: Choice[],
    alive: boolean,
    range: number,
}

export interface Warning {
    id: number,
    content: string,
}

export interface Preference {
    siteName: string,
    domain: string,
    author: string,
    intro: string,
    pageSize?: number,
}

export interface UploadTask {
    id: string,
    state: number, // 0 - pending, 1 - success, 2 - fail
    value?: string,
}

export enum CommentState {
    REVIEWING = 0,
    PASS = 1,
    IMPLICATED = 2,
    BLOCK = 3,
}

export interface Comment {
    id: string,
    ref: string,
    blog: string,
    user: string,
    state: CommentState,
    alive: boolean,
    time: number,
    content: string,
}

export enum UserLevel {
    DOUBTED = 0,
    TRUSTED = 1,
    REVIEWING = 2,
    BLOCKED = 3,
}

export interface User {
    id: string,
    avatar: string,
    name: string,
    sina_profile: string,
    level: UserLevel,
}