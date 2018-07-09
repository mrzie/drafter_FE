import store, { Action } from './store'
import axios, { AxiosPromise } from 'axios'
import { Dispatch } from 'redux';
import { Tag, Blog, User, Comment } from './models'
import { EventEmitter } from 'events'
const { getState } = store
const dispatch: Dispatch<Action> = store.dispatch

const handle = (pms => pms.then(
    data => [data.data, null],
    err => [null, err]
)) as { <T>(pms: AxiosPromise<T>): Promise<[T, any]> }

axios.defaults.baseURL = '/v1/'
axios.defaults.headers.post['Content-Type'] = 'application/json'
interface ListResponse {
    tag?: Tag,
    blogs: Blog[],
    count: number,
}

interface CommentsResponse {
    ok: boolean,
    comments: Comment[],
    users: User[],
}

export const fetchList = async (tagname: string, pagenum: number) => {
    const { loadStack, tags } = getState()

    if (loadStack.indexOf(`list.${tagname}.${pagenum}`) > -1) {
        // never
        return Promise.reject(false)
    }

    const showTag = tagname && tags.findIndex(t => t.name == tagname) == -1 || false

    dispatch({
        type: 'FETCH_LIST_START',
        tagname,
        pagenum,
    })

    const [result, err] = await handle<ListResponse>(axios.get('/blogs', {
        params: {
            tag: tagname,
            p: pagenum,
            showTag,
        }
    }))

    if (err) {

        dispatch({
            type: 'FETCH_LIST_FAIL',
            tagname,
            pagenum,
        })

        return Promise.reject(err)
    } else {
        if (showTag && tagname != result.tag.name) {
            console.warn('请求的tag不存在')

            dispatch({
                type: 'FETCH_LIST_FAIL',
                tagname,
                pagenum,
            })

            return Promise.reject(1)
        }

        dispatch({
            type: 'FETCH_LIST_SUCCESS',
            showTag,
            tagname,
            pagenum,
            tag: result.tag,
            blogs: result.blogs,
            count: result.count,
        })
        return true
    }
}

export const fetchComments = async (id: string) => {
    const { blogs, loadStack } = getState()
    if (blogs.find(b => b.id == id) == null) {
        console.log('unknow blog')
        return Promise.reject(1)
    }

    if (loadStack.indexOf(`comments.${id}`) > -1) {
        console.log('出错')
        return Promise.reject(1)
    }

    dispatch({
        type: 'FETCH_COMMENTS_START',
        blogid: id,
    })

    const [result, err] = await handle<CommentsResponse>(axios.get('/comments', { params: { blog: id } }))

    if (!err && result.ok) {
        dispatch({
            type: 'FETCH_COMMENTS_SUCCESS',
            blogid: id,
            users: result.users,
            comments: result.comments,
        })
        return true
    } else {
        dispatch({
            type: 'FETCH_COMMENTS_FAIL',
            blogid: id,
        })
        return Promise.reject(err)
    }
}

export const fetchBlog = async (id: string) => {
    const { loadStack } = getState()
    if (loadStack.indexOf(`blog.${id}`) > -1) {
        console.warn('出错')
        return Promise.reject(1)
    }

    dispatch({
        type: 'FETCH_BLOG_START',
        id,
    })

    const [blog, err] = await handle<Blog>(axios.get(`/blog/${id}`))

    if (err) {
        dispatch({
            type: 'FETCH_BLOG_FAIL',
            id,
        })
        return Promise.reject(err)
    } else {
        dispatch({
            type: 'FETCH_BLOG_SUCCESS',
            blog,
            id,
        })
        return true
    }
}

interface Emitter extends EventEmitter {
    on(name: 'OAuthLogin', listener: (user: User) => void): this
    emit(name: 'OAuthLogin', user: User): boolean
}

const emitter: Emitter = new EventEmitter()

interface OAuthCallbackParam {
    Success: boolean,
    UserInfo: User,
}

Object.defineProperty(window, 'OAuthCallback', {
    get: () => ({ Success, UserInfo }: OAuthCallbackParam) => {
        if (Success) {
            emitter.emit('OAuthLogin', UserInfo)
        }
    }
})

emitter.on('OAuthLogin', user => {
    dispatch({
        type: 'OAUTH_LOGIN',
        user,
    })
})

export const OAuthLogin = () => {
    window.open(`https://api.weibo.com/oauth2/authorize?client_id=113188835&response_type=code&redirect_uri=${encodeURIComponent('http://www.mrzie.com:3723/v1/OAuthLogin')}`)
}


export const postComment = async (blogid: string, content: string, quote: string) => {
    const { user } = getState()
    if (!user) {
        console.log('fail')
        return Promise.reject(1)
    }

    dispatch({ type: 'POST_COMMENT_START', blogid, uid: user.id })
    const [result, err] = await handle<Comment>(axios.post('/compose', { content, blog: blogid, ref: quote }))

    if (!err) {

        dispatch({
            type: 'POST_COMMENT_SUCCESS',
            blogid,
            uid: user.id,
            comment: result,
        })
        return
    } else {
        dispatch({
            type: 'POST_COMMENT_FAIL', 
            blogid,
            uid: user.id,
        })
        return Promise.reject(err)
    }
}