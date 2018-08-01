import axios, { AxiosPromise } from 'axios'
import { store, Types } from '../store'
import { Notebook, Note, Blog, Choice, Tag, Preference, Comment, User } from '../model'
import { marked } from '../utils'
import { History } from 'history'
import * as interactions from '../interactions'

const
    { dispatch } = store,
    { warn } = interactions

export interface Exception {
    code: number,
    msg: string,
    raw?: any,
    remark?: string,
}

export interface simpleMessage {
    code: number,
    msg: string,
}

type Expect<T> = [T, Exception]

const _handle = (pms: AxiosPromise) => pms.then(
    res => [res.data, null],
    err => [null, err.response.data]
) as Promise<Expect<any>>

const handle = async (pms: AxiosPromise) => {
    const result = await _handle(pms),
        err = result[1]
    if (err && err.code >= 400 && err.code < 500) {
        interactions.modal('身份认证异常，请重新登录', [{
            text: '确定',
            then: () => {
                location.reload()
                return false
            }
        }])
        throw 401
    }
    return result
}

axios.defaults.baseURL = '/v1/'
axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.defaults.headers.put['Content-Type'] = 'application/json'
axios.defaults.headers.patch['Content-Type'] = 'application/json'

const REJECTION = async (src: string | Object) => {
    if (typeof src == 'string') {
        return Promise.reject({ msg: src, _logical: true })
    } else if (src instanceof Promise) {
        return src
    } else {
        return Promise.reject({ ...src, _logical: false })
    }
}


export const login = async (password: string, exclusive: boolean) => {
    dispatch({ type: Types.LOGIN_START })

    const [res, err] = await _handle(axios.post('/login', { password, exclusive }))
    if (err != null) {
        dispatch({ type: Types.LOGIN_FAIL, err })
        warn("登录失败")
    } else if (res.code === 0) {
        dispatch({ type: Types.LOGIN_SUCCESS })
    }
}

export const newbook = async (name: string) => {
    dispatch({ type: Types.NEWBOOK_START })

    const [notebook, err]: Expect<Notebook> = await handle(axios.post('/admin/notebook', { name }))
    if (err != null) {
        dispatch({ type: Types.NEWBOOK_FAIL, err })
        warn(`创建笔记本失败：${err.msg}`)
    } else {
        dispatch({ type: Types.NEWBOOK_SUCCESS, notebook })
    }
}

export const renameNotebook = async (id: string, name: string) => {
    dispatch({ type: Types.RENAMENOTEBOOK_START, id, name })
    const [_, err]: Expect<simpleMessage> = await handle(axios.patch('/admin/notebook', { id, name }))
    if (err != null) {
        dispatch({ type: Types.RENAMENOTEBOOK_FAIL, id, err })
        warn(`重命名笔记本失败：${err.msg}`)
    } else {
        dispatch({ type: Types.RENAMENOTEBOOK_SUCCESS, id, name })
    }
}

export const deleteNotebook = async (id: string) => {
    dispatch({ type: Types.DELETENOTEBOOK_START, id })
    const [_, err]: Expect<simpleMessage> = await handle(axios.delete('/admin/notebook', { data: { id } }))
    if (err != null) {
        dispatch({ type: Types.DELETENOTEBOOK_FAIL, id, err })
        warn(`未能成功删除笔记本：${err.msg}`)
    } else {
        dispatch({ type: Types.DELETENOTEBOOK_SUCCESS, id })
    }
}

export const getNotebooks = async () => {
    dispatch({ type: Types.GETNOTEBOOKS_START })
    const [notebooks, err]: Expect<Notebook[]> = await handle(axios.get('/admin/notebooks'))
    if (err != null) {
        dispatch({ type: Types.GETNOTEBOOKS_FAIL, err })
        warn(`获取笔记本列表失败，请刷新重试：${err.msg}`)
    } else {
        dispatch({ type: Types.GETNOTEBOOKS_SUCCESS, notebooks })
    }
}

// 用以计算新建笔记产生的临时Id
let tempIdCounter = 0

export const newNote = async (notebookid: string, title = '', tags = [] as string[], content = '') => {
    const
        tempId = (tempIdCounter++).toString(),
        timeStamp = +new Date()

    dispatch({ type: Types.NEWNOTE_START, notebookid, tempId, timeStamp })

    const [note, err]: Expect<Note> = await handle(
        axios.post('/admin/note', { title, tags, content, notebookid })
    )
    if (err != null) {
        dispatch({ type: Types.NEWNOTE_FAIL, err, tempId })
        warn(`创建新笔记失败：${err.msg}`)
        return Promise.reject(err)
    } else {
        dispatch({ type: Types.NEWNOTE_SUCCESS, note, tempId })
    }

    return note
}

export const listNotes = async (notebookid: string) => {
    dispatch({ type: Types.LISTNOTES_START, notebookid })

    const [notes, err]: Expect<Note[]> = await handle(axios.get('/admin/notes', { params: { notebookid } }))
    if (err != null) {
        dispatch({ type: Types.LISTNOTES_FAIL, notebookid })
        warn(`获取笔记列表失败：${err.msg}`)
    } else {
        dispatch({ type: Types.LISTNOTES_SUCCESS, notebookid, notes })
    }
}

export const getNote: (id: string) => Promise<Note> = async (id: string) => {
    dispatch({ type: Types.GETNOTE_START, id })
    // 因为一开始的接口设计，搞得其实可以一次性获取多个note
    // 当然这里获取一条记录就好啦
    // 获取多条记录的id传法是ids.join(',')
    const [notes, err]: Expect<Note[]> = await handle(axios.get('/admin/note', { params: { id } }))
    if (err != null || notes.length === 0) {
        dispatch({ type: Types.GETNOTE_FAIL, id })
        warn(`获取笔记失败：${err.msg}`)
    } else {
        dispatch({ type: Types.GETNOTE_SUCCESS, id, note: notes[0] })
        return notes[0]
    }
}

export const saveNote = async (id: string) => {
    const
        state = store.getState(),
        note = (state.notes as Note[]).find(n => n.id == id),
        { titleCache: title, contentCache: content, tagsCache: tags } = note

    if (note.titleCache === undefined) {
        return
    }

    dispatch({ type: Types.EDITNOTE_START, id })
    const [_, err]: Expect<simpleMessage> = await handle(axios.patch(`/admin/note/${id}`, { title, content, tags }))
    if (err != null) {
        dispatch({ type: Types.EDITNOTE_FAIL, id })
        warn(`保存笔记失败：${err.msg}`)
    } else {
        dispatch({ type: Types.EDITNOTE_SUCCESS, id })
        return
    }
}

export const moveNote = async (id: string, notebookid: string) => {
    const
        state = store.getState(),
        note = (state.notes as Note[]).find(n => n.id == id)

    if (!note) {
        warn('笔记不存在')
        return
    }
    const notebook = state.notebooks.find(b => b.id === notebookid)

    if (!notebook) {
        // 目标笔记本不存在
        warn('目标笔记本不存在')
        return
    }
    dispatch({ type: Types.MOVENOTE_START, id, notebookid })
    const [_, err]: Expect<simpleMessage> = await handle(axios.patch(`admin/note/${id}`, { notebookid }))
    if (err != null) {
        dispatch({ type: Types.MOVENOTE_FAIL, id, notebookid })
        warn(`移动笔记失败：${err.msg}`)
    } else {
        dispatch({ type: Types.MOVENOTE_SUCCESS, id, notebookid })
    }
}


export const deleteNote = async (id: string) => {
    const
        state = store.getState(),
        notes = state.notes,
        note = (notes as Note[]).find(n => n.id === id) || await getNote(id)

    dispatch({ type: Types.DELETENOTE_START, id })
    const [_, err]: Expect<simpleMessage> = await handle(axios.delete(`/admin/note/${id}`))
    if (err != null) {
        dispatch({ type: Types.DELETENOTE_FAIL, id, err })
        warn(`删除笔记失败：${err.msg}`)
    } else {
        dispatch({ type: Types.DELETENOTE_SUCCESS, id, note })
    }
}

export const getWasteNotes = async () => {
    dispatch({ type: Types.GETWASTENOTES_START })
    const [notes, err]: Expect<Note[]> = await handle(axios.get('/admin/wastenote'))
    if (err != null) {
        dispatch({ type: Types.GETWASTENOTES_FAIL, err })
        warn(`获取笔记列表失败：${err.msg}`)
    } else {
        dispatch({ type: Types.GETWASTENOTES_SUCCESS, notes })
    }
}

export const restoreNoteTo = async (id: string, notebookid: string) => {
    dispatch({ type: Types.RESTOREWASTENOTE_START, id, notebookid })
    const [_, err]: Expect<simpleMessage> = await handle(axios.patch(`/admin/note/${id}`, { notebookid, alive: true }))
    if (err != null) {
        dispatch({ type: Types.RESTOREWASTENOTE_FAIL, id, err })
        warn(`未能成功还原笔记：${err.msg}`)
    } else {
        dispatch({ type: Types.RESTOREWASTENOTE_SUCCESS, id, notebookid })
    }
}

export const composeBlog = async (noteid: string) => {
    const state = store.getState(),
        note = (state.notes as Note[]).find(n => n.id === noteid) || await getNote(noteid)

    dispatch({ type: Types.NEWBLOG_START, noteid })

    const {
        title,
        content,
        tags,
    } = note

    const [blog, err]: Expect<Blog> = await handle(axios.post('/admin/blog', {
        title,
        content,
        tags,
        html: marked(content),
        noteid: note.id
    }))

    if (err != null) {
        dispatch({ type: Types.NEWBLOG_FAIL, noteid, err })
        warn(`发布失败：${err.msg}`)
    } else {
        dispatch({ type: Types.NEWBLOG_SUCCESS, noteid, blog })
    }
}

export const getBlogs = async () => {
    dispatch({ type: Types.GETBLOGS_START })
    const [blogs, err]: Expect<Blog[]> = await handle(axios.get('/admin/blogs'))
    if (err != null) {
        dispatch({ type: Types.GETBLOGS_FAIL, err })
        warn(`获取博客列表失败：${err.msg}`)
    } else {
        dispatch({ type: Types.GETBLOGS_SUCCESS, blogs })
    }
}

export const getBlogsIfNeed = async () => {
    const
        { interactions: { loadings, blogsSyncAt }, } = store.getState(),
        isLoading = loadings.indexOf('GETBLOGS') !== -1
    if (!isLoading && (!blogsSyncAt || blogsSyncAt + 1000 * 60 * 15 <= +new Date())) {
        return getBlogs()
    }
}

export const getBlog = async (ids: string[]) => {
    const loadings = store.getState().interactions.loadings
    // 这里会筛掉正在加载中的blog
    ids = ids.filter(id => loadings.indexOf(`GETBLOG.${id}`) === -1)
    if (ids.length === 0) {
        return
    }
    dispatch({ type: Types.GETBLOG_START, ids })
    const [blogs, err]: Expect<Blog> = await handle(axios.get(`/admin/blog?id=${ids.join(',')}`))
    if (err != null) {
        dispatch({ type: Types.GETBLOG_FAIL, ids, err })
        warn(`未能成功获取博客内容：${err.msg}`)
    } else {
        dispatch({ type: Types.GETBLOG_SUCCESS, blogs, ids })
    }
}

export const editBlog = async (id: string, noteid: string) => {
    const state = store.getState(),
        note = (state.notes as Note[]).find(n => n.id === noteid)

    if (!note) {
        warn('未找到笔记')
        return
    }

    if (note.content === undefined) {
        // 未加载的note
        warn('笔记状态不正确')
        return
    }

    dispatch({ type: Types.EDITBLOG_START, id, noteid })
    const edition = {
        title: note.title,
        content: note.content,
        html: marked(note.content),
        tags: note.tags,
        noteid,
        // alive   我想到了，但是不想让它自动改值。已经隐藏的文章要打开就手动打开        
    }
    const [_, err]: Expect<simpleMessage> = await handle(axios.put(`/admin/blog/${id}`, edition))

    if (err != null) {
        dispatch({ type: Types.EDITBLOG_FAIL, id, noteid })
        warn(`未能成功编辑博客：${err.msg}`)
    } else {
        dispatch({ type: Types.EDITBLOG_SUCCESS, id, noteid, edition })
    }
}

export const activateBlog = async (id: string, alive: boolean) => {
    dispatch({ type: Types.ACTIVATEBLOG_START, id, alive })
    const [_, err]: Expect<simpleMessage> = await handle(axios.put(`/admin/blog/${id}`, { alive }))
    if (err != null) {
        dispatch({ type: Types.ACTIVATEBLOG_FAIL, id, alive })
        warn(`未能成功编辑博客：${err.msg}`)
    } else {
        dispatch({ type: Types.ACTIVATEBLOG_SUCCESS, id, alive })
    }
}

export const removeBlog = async (id: string) => {
    dispatch({ type: Types.DELETEBLOG_START, id })

    const [_, err]: Expect<simpleMessage> = await handle(axios.delete(`/admin/blog/${id}`))
    if (err != null) {
        dispatch({ type: Types.DELETEBLOG_FAIL, id })
        return Promise.reject(err)
    } else {
        dispatch({ type: Types.DELETEBLOG_SUCCESS, id })
        return true
    }
}

export const getTags = async () => {
    dispatch({ type: Types.GETTAGS_START })
    const [tags, err]: Expect<Tag[]> = await handle(axios.get('/admin/tags'))
    if (err != null) {
        dispatch({ type: Types.GETTAGS_FAIL })
        warn(`获取tags失败：${err.msg}`)
    } else {
        dispatch({ type: Types.GETTAGS_SUCCESS, tags })
        return true
    }
}

export const deleteTag = async (name: string) => {
    dispatch({ type: Types.DELETETAG_START, name })
    const [_, err]: Expect<simpleMessage> = await handle(axios.delete(`/admin/tag/${name}`))
    if (err != null) {
        dispatch({ type: Types.DELETETAG_FAIL, name })
        warn(`编辑tag失败：${err.msg}`)
    } else {
        dispatch({ type: Types.DELETETAG_SUCCESS, name })
        return true
    }
}

export const editTag = async (name: string, description: string) => {
    dispatch({ type: Types.EDITTAG_START, name })
    const [_, err]: Expect<simpleMessage> = await handle(axios.put('/admin/describe-tag', { name, description }))
    if (err != null) {
        dispatch({ type: Types.EDITTAG_FAIL, name })
        warn(`编辑tag失败：${err.msg}`)
    } else {
        dispatch({ type: Types.EDITTAG_SUCCESS, name, description })
        return true
    }
}

export const setPreference = async (p: Preference) => {
    dispatch({ type: Types.SETPREFERENCE_START })
    const [_, err]: Expect<simpleMessage> = await handle(axios.put('/admin/user-preference', p))
    if (err != null) {
        dispatch({ type: Types.SETPREFERENCE_FAIL })
        warn(`配置失败：${err.msg}`)
    } else {
        dispatch({ type: Types.SETPREFERENCE_SUCCESS, preference: p })
        return true
    }
}

export const editPassword = async (oldPassword: string, newPassword: string) => {
    dispatch({ type: Types.EDITPASSWORD_START })
    const [_, err]: Expect<simpleMessage> = await handle(axios.post('/admin/editPassword', { oldPassword, newPassword }))
    if (err != null) {
        dispatch({ type: Types.EDITPASSWORD_FAIL })
        warn(`修改密码失败：${err.msg}`)
    } else {
        dispatch({ type: Types.EDITPASSWORD_SUCCESS })
        return true
    }
}

interface uploadImageResponse {
    url: string
}

// let uploadImageCounter = +new Date()
export const uploadImage = async (f: File, id: string) => {
    const
        form = new FormData(),
        config = { headers: { 'Content-type': 'multipart/formData' } }
    // id = (uploadImageCounter++).toString()
    form.append('file', f, f.name)
    dispatch({ type: Types.UPLOAD_START, id })

    const [result, err]: Expect<uploadImageResponse> = await handle(axios.post('/admin/uploadImage', form, config))
    if (err != null) {
        dispatch({ type: Types.UPLOAD_FAIL, id })
    } else {
        dispatch({ type: Types.UPLOAD_SUCCESS, id, value: result.url })
    }
}

const editInNewNote = async (blog: Blog, history: History, notebookSuggessed: string) => {
    // 这里其实Loading会显示的，但是其实是newNote的loading并不明显
    history.push(`/admin/notebook/${notebookSuggessed}`)
    newNote(
        notebookSuggessed,
        blog.title,
        blog.tags,
        blog.content,
    ).catch(err => {
        interactions.warn('网络异常：创建新笔记失败')
    })
    return true
}

export const handleEditBlog = async (blog: Blog, history: History, rangeId: number) => {
    const state = store.getState(),
        // blog = state.blogs.find(b => b.id === id),
        currentNoteId = state.interactions.currentNote,
        notebooks = state.notebooks,
        notebookSuggessed = notebooks.length
            ? currentNoteId
                ? (notebooks.find(n => n.id === currentNoteId) || notebooks[0]).id
                : notebooks[0].id
            : null
    if (!blog) {
        // 这里没有定位到blog，理论上不可能出现
        return false // TODO
    }

    let note = (state.notes as Note[]).find(n => n.id === blog.noteid) || await getNote(blog.noteid)

    const cancel: Choice = {
        text: '取消',
        then: () => true,
    }

    if (!note || !note.alive) {
        // 原笔记不存在
        if (notebookSuggessed) {
            const ensure: Choice = {
                text: '确定',
                then: () => editInNewNote(blog, history, notebookSuggessed)
            }
            interactions.modal(
                '原笔记不存在或已经被删除，即将在新建的笔记中暂存修改',
                [cancel, ensure],
                rangeId,
                '笔记发生了变化'
            )
        } else {
            // 真是大条了，居然连notebook都没有
            const ensure: Choice = {
                text: '确定',
                then: () => {
                    history.push('/admin/notebooks')
                    return true
                }
            }
            interactions.modal(
                '原笔记不存在或已经被删除，你需要先创建一个笔记本',
                [cancel, ensure],
                rangeId,
                '笔记发生了变化'
            )
        }

        // editBlogDialogContent = ''
    } else if (note.editAt > blog.editAt) {
        // note有了新的变化
        const choices: Choice[] = [
            cancel,
            {
                text: '继续修改',
                then: () => {
                    interactions.setCurrentNote(note.id)
                    history.push(`/admin/notebook/${note.notebookid}`)
                    return true
                }
            }, {
                text: '创建新的笔记',
                then: () => this.editInNewNote(blog)
            }]

        interactions.modal(
            '原笔记在发布后有了新的改动，是否从草稿开始继续修改？',
            choices,
            rangeId,
            '笔记发生了变化'
        )
    } else {
        // 直接修改
        interactions.setCurrentNote(note.id)
        history.push(`/admin/notebook/${note.notebookid}`)
    }
}

export const handleHideBlog = async (blog: Blog) => {
    // const { blogs } = store.getState(),
    //     blog = blogs.find(b => b.id === id)
    if (!blog || !blog.alive) {
        // 这里没有定位到blog，理论上不可能出现
        return false // TODO
    }
    await activateBlog(blog.id, false)
}

export const handleRestoreBlog = async (blog: Blog) => {
    if (!blog || blog.alive) {
        // 这里没有定位到blog，理论上不可能出现
        return false // TODO
    }
    await activateBlog(blog.id, true)
}

export const handleDeleteBlog = async (blog: Blog) => {
    if (!blog || blog.alive) {
        // 这里没有定位到blog，或blog存活，理论上不可能出现
        return false // TODO
    }
    interactions.modal(
        `确定要永久删除《${blog.title}》吗？（此操作无法撤销）`, [
            {
                text: '取消',
                then: () => true,
            },
            {
                text: '确认删除',
                then: () => {
                    removeBlog(blog.id)
                    return true
                }
            }
        ]
    )
}

interface FetchCommentsRequest {
    comments: Comment[],
    users: User[],
}

const fetchComments = async (key: string, params: any) => {
    dispatch({ type: Types.COMMENTS_START_LOADING, key })

    const
        [{ comments, users }, err]
            : Expect<FetchCommentsRequest>
            = await handle(axios.get('/admin/comments', { params }))
            
    if (err != null) {
        dispatch({ type: Types.COMMENTS_FAIL, key })
        return Promise.reject(err)
    } else {
        dispatch({ type: Types.COMMENTS_LOADED, comments, users,key })
        return true
    }
}

export const fetchCommentsByUsers = (user: string) => fetchComments(`user=${user}`, { user })

export const fetchCommentsByBlog = (blog: string) => fetchComments(`blog=${blog}`, { blog })

export const fetchDoubtedComments = () => fetchComments('doubted', { type: 'doubted' })

export const fetchReviewingComments = () => fetchComments('reviewing', { type: 'reviewing' })

export const fetchRemovedComments = () => fetchComments('removed', { type: 'removed' })

export const fetchBlockedComments = () => fetchComments('blocked', { type: 'blocked' })

export const fetchRecentComments = () => fetchComments('recent', { type: 'recent' })

interface DeleteCommentResponse {
    ok: boolean,
    isDoubted: boolean,
}

export const deleteComment = async (id: string) => {
    const { comments, users } = store.getState(),
        comment = comments.find(c => c.id === id)
    if (!comment) {
        warn('评论不存在')
        return Promise.reject('评论不存在')
    }
    const user = users.find(u => u.id === comment.user)
    if (!user) {
        warn('评论用户不存在')
        return Promise.reject('评论用户不存在')
    }
    dispatch({ type: Types.DELETECOMMENT_START, id })

    const [res, err]: Expect<DeleteCommentResponse> = await handle(axios.delete('/admin/comment', { params: { id } }))
    if (err != null) {
        warn('删除评论失败')
        dispatch({ type: Types.DELETECOMMENT_FAIL, id })
        return Promise.reject(err)
    }

    dispatch({
        type: Types.DELETECOMMENT_SUCCESS,
        id,
        uncertainUser: res.isDoubted ? user.id : undefined
    })
    return
}

export const revertComment = async (id: string) => {
    const
        { comments, users } = store.getState(),
        comment = comments.find(c => c.id === id)

    if (!comment) {
        warn('评论不存在')
        return Promise.reject('评论不存在')
    }

    dispatch({ type: Types.REVERTCOMMENT_START, id })
    const [_, err]: Expect<simpleMessage> = await handle(axios.patch('/admin/revertComment', null, { params: { id } }))
    if (err != null) {
        warn('未能成功恢复评论')
        dispatch({ type: Types.REVERTCOMMENT_FAIL, id })
        return Promise.reject('未能成功恢复评论')
    }
    dispatch({ type: Types.REVERTCOMMENT_SUCCESS, id })
    return
}

interface CensorUserResponse {
    sensitiveComment: Comment,
}
export const passComment = async (id: string) => {
    const
        { comments, users } = store.getState(),
        comment = comments.find(c => c.id === id)

    if (!comment) {
        warn('评论不存在')
        return Promise.reject('评论不存在')
    }
    const user = users.find(u => u.id === comment.user)
    if (!user) {
        warn('评论用户不存在')
        return Promise.reject('评论用户不存在')
    }

    dispatch({ type: Types.PASSCOMMENT_START, id })
    const [res, err]: Expect<CensorUserResponse> = await handle(axios.patch('/admin/passComment', null, { params: { id } }))
    if (err != null) {
        warn('未能成功置信评论')
        dispatch({ type: Types.PASSCOMMENT_FAIL, id })
        return Promise.reject('未能成功置信评论')
    }
    dispatch({
        type: Types.PASSCOMMENT_SUCCESS,
        id,
        uid: user.id,
        sensitiveComment: res.sensitiveComment,
    })
    return
}

export const censorUser = async (id: string) => {
    const
        { users } = store.getState(),
        user = users.find(u => u.id === id)

    if (!user) {
        warn('用户不存在')
        return Promise.reject('用户不存在')
    }
    dispatch({ type: Types.CENSORUSER_START, id })

    const [res, err]: Expect<CensorUserResponse> = await handle(axios.patch('/admin/censorUser', null, { params: { id } }))
    if (err != null) {
        dispatch({ type: Types.CENSORUSER_FAIL, id })
        return Promise.reject(null)
    }
    dispatch({
        type: Types.CENSORUSER_SUCCESS,
        id,
        sensitiveComment: res.sensitiveComment,
    })
    return
}

export const blockComment = async (id: string) => {
    const
        { comments, users } = store.getState(),
        comment = comments.find(c => c.id === id)

    if (!comment) {
        warn('评论不存在')
        return Promise.reject('评论不存在')
    }
    const user = users.find(u => u.id === comment.user)
    if (!user) {
        warn('评论用户不存在')
        return Promise.reject('评论用户不存在')
    }

    dispatch({ type: Types.BLOCKCOMMENT_START, id })
    const [_, err]: Expect<simpleMessage> = await handle(axios.patch('/admin/blockComment', null, { params: { id } }))
    if (err != null) {
        dispatch({
            type: Types.BLOCKCOMMENT_FAIL,
            id,
        })
        warn('屏蔽失败')
        return Promise.reject('屏蔽失败')
    }
    dispatch({
        type: Types.BLOCKCOMMENT_SUCCESS,
        id,
        uid: user.id,
    })
}