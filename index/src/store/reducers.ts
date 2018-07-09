import { State, Comment, Blog, Tag, List, User, Basic } from '../models'
import { Reducer, combineReducers, AnyAction } from 'redux'

const generateAbstract = (b: Blog) => {
    const div = document.createElement('div')
    div.innerHTML = b.content
    let text = div.innerText,
        lines = text.split('\n'),
        overflow = lines.length > 12,
        abstract: string

    text = lines.slice(0, 12).join('\n')
    if (!overflow && text.length > 300) {
        overflow = true
    }

    div.innerText = text.slice(0, 300)
    abstract = div.innerHTML
    if (overflow) {
        abstract += '…'
    }
    return abstract
}

declare let __conf: State
declare let __basic: Basic
if (__conf) {
    const now = +new Date()
    __conf.lists && __conf.lists.forEach(l => l.syncAt = now)
    __conf.blogs && __conf.blogs.forEach(b => {
        b.syncAt = now
        b.abstract = generateAbstract(b)
    })
}

if (!__basic) {
    __basic = {
        sitename: `mrzie's blog`,
        domain: 'domain',
        intro: 'welcome to my website',
        author: '',
        ICP: '',
    }
}

export type Action =
    {
        type: "FETCH_LIST_START",
        tagname: string,
        pagenum: number,
    } | {
        type: "FETCH_LIST_FAIL",
        tagname: string,
        pagenum: number,
    } | {
        type: "FETCH_LIST_SUCCESS",
        showTag: boolean,
        tagname: string,
        tag: Tag,
        pagenum: number,
        blogs: Blog[],
        count: number,
    } | {
        type: "FETCH_BLOG_START",
        id: string,
    } | {
        type: "FETCH_BLOG_FAIL",
        id: string,
    } | {
        type: "FETCH_BLOG_SUCCESS",
        id: string,
        blog: Blog,
    } | {
        type: "FETCH_COMMENTS_START",
        blogid: string,
    } | {
        type: "FETCH_COMMENTS_FAIL",
        blogid: string,
    } | {
        type: "FETCH_COMMENTS_SUCCESS",
        blogid: string,
        users: User[],
        comments: Comment[],
    } | {
        type: "POST_COMMENT_START",
        blogid: string,
        uid: string,
    } | {
        type: "POST_COMMENT_FAIL",
        blogid: string,
        uid: string,
    } | {
        type: "POST_COMMENT_SUCCESS",
        blogid: string,
        uid: string,
        comment: Comment,
    } | {
        type: "OAUTH_LOGIN",
        user: User,
    }

const upsertItem: <T>(arr: T[], matcher: (item: T) => boolean, replace: (old?: T) => T) => T[] = (arr, matcher, replace) => {
    const index = arr.findIndex(matcher)
    if (index != -1) {
        arr = [...arr]
        arr[index] = replace(arr[index])
        return arr
    } else {
        return [...arr, replace(null)]
    }
}

const excludeFunc = <T>(arr: T[], matcher: (t: T) => boolean) => {
    const i = arr.findIndex(matcher)
    if (i > -1) {
        arr = [...arr]
        arr.splice(i, 1)
    }

    return arr
}

const tags: Reducer<Tag[]> = (state = __conf.tags, actions: Action) => {
    switch (actions.type) {
        case "FETCH_LIST_SUCCESS":

            if (actions.showTag) {
                return upsertItem(
                    state,
                    i => i.name == (actions.tagname),
                    () => actions.tag
                )
            }
        // case 
        default:
            return state
    }
}

const lists: Reducer<List[]> = (state = __conf.lists, actions: Action) => {
    switch (actions.type) {
        case "FETCH_LIST_SUCCESS":
            {
                const syncAt = +new Date(),
                    matchid = state.findIndex(l => l.query == actions.tagname)
                let list: List
                if (matchid > -1) {
                    state = [...state]
                    list = { ...state.splice(matchid, 1)[0], syncAt }
                    list.blogs = [...list.blogs]
                    list.blogs[actions.pagenum] = actions.blogs.map(b => b.id)
                    // if (list.count != result.count) {
                    // 这里有问题，可能是在翻页的同时，作者增删了新的内容。导致页面内容出错
                    // 而产生的问题，可能导致滑到最后一页的时候无限加载
                    // 后期应该给用户一个提示，目前暂时把最大页数改过来，避免崩掉
                    list.count = actions.count
                    // }
                } else {
                    if (actions.pagenum != 1) {
                        console.warn('出错')
                        return
                    }
                    list = {
                        query: actions.tagname,
                        blogs: [actions.blogs.map(b => b.id)],
                        syncAt,
                        count: actions.count
                    }
                }
                return [...state, list]
            }
        default:
            return state
    }
}


const blogs: Reducer<Blog[]> = (state = __conf.blogs, actions: Action) => {
    switch (actions.type) {
        case 'FETCH_LIST_SUCCESS':

            return [
                ...state.filter(blog => actions.blogs.findIndex(b => b.id == blog.id) == -1), // 不在actions.blogs里的博客
                ...actions.blogs.map(b => ({ ...b, abstract: generateAbstract(b), syncAt: +new Date() })), // 这里还有点小问题，会触发请求图片
            ]

        case 'FETCH_BLOG_SUCCESS':
            return upsertItem(
                state,
                b => b.id === actions.id,
                () => ({
                    ...actions.blog,
                    abstract: generateAbstract(actions.blog)
                })
            )
        default:
            return state
    }
}

const loadStack: Reducer<string[]> = (state = [], actions: Action) => {
    switch (actions.type) {
        case 'FETCH_LIST_START':
            return [...state, `list.${actions.tagname}.${actions.pagenum}`]
        case 'FETCH_LIST_FAIL':
        case 'FETCH_LIST_SUCCESS':
            return excludeFunc(state, i => i == `list.${actions.tagname}.${actions.pagenum}`)
        case 'FETCH_BLOG_START':
            return [...state, `blog.${actions.id}`]
        case 'FETCH_BLOG_FAIL':
        case 'FETCH_BLOG_SUCCESS':
            return excludeFunc(state, i => i == `blog.${actions.id}`)
        case 'FETCH_COMMENTS_START':
            return [...state, `comments.${actions.blogid}`]
        case 'FETCH_COMMENTS_FAIL':
        case 'FETCH_COMMENTS_SUCCESS':
            return excludeFunc(state, i => i == `comments.${actions.blogid}`)
        case 'POST_COMMENT_START':
            return [...state, `postComment.${actions.blogid}`]
        case 'POST_COMMENT_FAIL':
        case 'POST_COMMENT_SUCCESS':
            return excludeFunc(state, i => i == `postComment.${actions.blogid}`)
        default:
            return state
    }
}

const users: Reducer<User[]> = (state = [], actions: Action) => {
    switch (actions.type) {
        case 'FETCH_COMMENTS_SUCCESS':
            return [...state.filter(i => actions.users.indexOf(i) == -1), ...actions.users]
        default:
            return state
    }
}

const user: Reducer<User> = (state = __conf.user, actions: Action) => {
    switch (actions.type) {
        case 'OAUTH_LOGIN':
            return actions.user
        default:
            return state
    }
}

const comments: Reducer<Map<string, Comment[]>> = (state = new Map<string, Comment[]>(), actions: Action) => {
    switch (actions.type) {
        case 'FETCH_COMMENTS_SUCCESS':
            return new Map(state).set(actions.blogid, actions.comments)
        case 'POST_COMMENT_SUCCESS':
            return new Map(state).set(actions.blogid, [...state.get(actions.blogid), { ...actions.comment}]) // todo 
        default:
            return state
    }
}

export const reducer: Reducer<State> = combineReducers({
    tags,
    lists,
    blogs,
    loadStack,
    users,
    user,
    comments,
})

