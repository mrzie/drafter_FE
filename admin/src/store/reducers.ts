import {
    Note,
    Blog,
    Notebook,
    Tag,
    State,
    TempNote,
    Interactions,
    Modal,
    Warning,
    Preference,
    UploadTask
} from '../model'
import { Reducer, combineReducers, AnyAction } from 'redux'
import { tempIdPrefix } from '../utils'

declare var __conf: { authenticated: boolean, preference: Preference }

// 从数组移除某项一次
const exclude = <T>(arr: T[], item: T) => {
    const i = arr.indexOf(item)
    if (i > -1) {
        arr = [...arr]
        arr.splice(i, 1)
    }

    return arr
}

const excludeFunc = <T>(arr: T[], matcher: (t: T) => boolean) => {
    const i = arr.findIndex(matcher)
    if (i > -1) {
        arr = [...arr]
        arr.splice(i, 1)
    }

    return arr
}

const replaceItem = <T>(arr: T[], find: (t: T) => boolean, replace: (old: T) => T) => {
    const index = arr.findIndex(find)
    if (index > -1) {
        arr = [...arr]
        // arr.splice(index, 1, replace)
        arr[index] = replace(arr[index])
    }
    return arr
}

export enum Types {
    // 登录
    LOGIN_START,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    // 登出
    LOGOUT_START,
    LOGOUT_SUCCESS,
    LOGOUT_FAIL,
    // 修改密码
    EDITPASSWORD_START,
    EDITPASSWORD_SUCCESS,
    EDITPASSWORD_FAIL,
    // 新笔记本
    NEWBOOK_START,
    NEWBOOK_SUCCESS,
    NEWBOOK_FAIL,
    // 获取笔记本列表
    GETNOTEBOOKS_START,
    GETNOTEBOOKS_SUCCESS,
    GETNOTEBOOKS_FAIL,
    // 删除笔记本
    DELETENOTEBOOK_START,
    DELETENOTEBOOK_SUCCESS,
    DELETENOTEBOOK_FAIL,
    // 修改笔记本名
    RENAMENOTEBOOK_START,
    RENAMENOTEBOOK_SUCCESS,
    RENAMENOTEBOOK_FAIL,
    // 获取笔记列表
    LISTNOTES_START,
    LISTNOTES_SUCCESS,
    LISTNOTES_FAIL,
    // 获取废纸篓笔记列表
    GETWASTENOTES_START,
    GETWASTENOTES_SUCCESS,
    GETWASTENOTES_FAIL,
    // 还原一条废纸篓里的笔记
    RESTOREWASTENOTE_START,
    RESTOREWASTENOTE_SUCCESS,
    RESTOREWASTENOTE_FAIL,
    // 获取笔记
    GETNOTE_START,
    GETNOTE_SUCCESS,
    GETNOTE_FAIL,
    // 新建笔记
    NEWNOTE_START,
    NEWNOTE_SUCCESS,
    NEWNOTE_FAIL,
    // 修改笔记
    EDITNOTE_START,
    EDITNOTE_SUCCESS,
    EDITNOTE_FAIL,
    // 修改笔记所属的笔记本
    MOVENOTE_START,
    MOVENOTE_SUCCESS,
    MOVENOTE_FAIL,
    // 删除笔记
    DELETENOTE_START,
    DELETENOTE_SUCCESS,
    DELETENOTE_FAIL,
    // 获取博客
    GETBLOG_START,
    GETBLOG_SUCCESS,
    GETBLOG_FAIL,
    // 起草博客
    NEWBLOG_START,
    NEWBLOG_SUCCESS,
    NEWBLOG_FAIL,
    // 编辑博客
    EDITBLOG_START,
    EDITBLOG_SUCCESS,
    EDITBLOG_FAIL,
    // 获取博客列表
    GETBLOGS_START,
    GETBLOGS_SUCCESS,
    GETBLOGS_FAIL,
    // 隐藏博客
    // INACTIVATEBLOG_START,
    // INACTIVATEBLOG_SUCCESS,
    // INACTIVATEBLOG_FAIL,
    // 重新显示博客
    ACTIVATEBLOG_START,
    ACTIVATEBLOG_SUCCESS,
    ACTIVATEBLOG_FAIL,
    // 删除博客
    DELETEBLOG_START,
    DELETEBLOG_SUCCESS,
    DELETEBLOG_FAIL,
    // 获取管理员配置
    GETPREFERENCE_START,
    GETPREFERENCE_SUCCESS,
    GETPREFERENCE_FAIL,
    // 设置管理员配置
    SETPREFERENCE_START,
    SETPREFERENCE_SUCCESS,
    SETPREFERENCE_FAIL,
    // 修改tag描述
    EDITTAG_START,
    EDITTAG_SUCCESS,
    EDITTAG_FAIL,
    // 获取tag列表
    GETTAGS_START,
    GETTAGS_SUCCESS,
    GETTAGS_FAIL,
    // 删除某个Tag
    DELETETAG_START,
    DELETETAG_SUCCESS,
    DELETETAG_FAIL,


    // 修改当前主显笔记本
    _SET_CURRENT_NOTEBOOK,
    // 修改当前显示笔记
    _SET_CURRENT_NOTE,
    // 缓存当前笔记修改
    _CACHE_NOTE,
    // 添加一个模态框
    _ADD_MODAL,
    // 隐藏一个模态框
    _HIDE_MODAL,
    // 删除多个模态框
    _REMOVE_MODAL,
    // 添加一个提示
    _ADD_WARNING,
    // 删除一个提示
    _REMOVE_WARNING,
    // 缓存标签描述
    _CACHE_TAG_DESCRIPTION,
    // // 发布、修改博客后修改标签数量
    // _RECOUNT_TAGS,


    UPLOAD_START,
    UPLOAD_SUCCESS,
    UPLOAD_FAIL,
    UPLOAD_CHECK, // 上传图片结束并插入文档之后，清楚对应缓存
}

export interface Action extends AnyAction {
    type: Types
}

const tagsEqual: (a: string[], b: string[]) => boolean = (a, b) => {
    if (a.length != b.length) {
        return false
    }
    a = a.sort()
    b = b.sort()
    return a.findIndex((str, index) => str != b[index]) === -1
}

const notes: Reducer<(Note | TempNote)[]> = (state = [], actions: Action) => {
    switch (actions.type) {
        case Types.NEWNOTE_START:
            // 临时Note占位
            const temp: TempNote = {
                tempId: actions.tempId,
                notebookid: actions.notebookid,
                createAt: actions.timeStamp,
                editAt: actions.timeStamp,
                alive: true
            }
            return [temp, ...state]
        case Types.NEWNOTE_SUCCESS:
            return replaceItem(state, t => t.tempId === actions.tempId, () => actions.note)
        case Types.NEWNOTE_FAIL:
            return excludeFunc(state, t => (t as TempNote).tempId === actions.tempId)
        case Types.DELETENOTEBOOK_SUCCESS:
            return state.map(n => {
                if (n.notebookid == actions.id) {
                    return { ...n, alive: false }
                }
                return n
            })
        case Types.LISTNOTES_SUCCESS:
            // 由于blog edit或者waste restore等原因，可能导致listnote之前已经有一些文章内容被加载
            // 考虑到这一点，要保留现有note的内容
            return [
                ...state.filter(note => note.notebookid != actions.notebookid || note.alive === false),
                ...(actions.notes as Note[]).map(note => {
                    // 从远程更新文章信息时保留本地的缓存更改
                    // 重要的是，本地getNote获取的文章内容啊
                    let old = (state as Note[]).find(n => n.id === note.id)
                    if (old) {
                        const { titleCache, contentCache, tagsCache, content } = old
                        return { ...note, titleCache, contentCache, tagsCache, content }
                    } else {
                        return note
                    }
                })
            ]
        case Types._CACHE_NOTE:
            {
                let { titleCache, contentCache, tagsCache } = <{
                    titleCache: string,
                    contentCache: string,
                    tagsCache: string[],
                    type: Types
                }>actions
                return replaceItem(
                    state as Note[],
                    t => t.id === actions.id,
                    old => {
                        if (
                            old.title === titleCache &&
                            old.content === contentCache &&
                            tagsEqual(old.tags, tagsCache)
                        ) {
                            titleCache = contentCache = tagsCache = undefined
                        }
                        return {
                            ...old,
                            titleCache,
                            contentCache,
                            tagsCache
                        }
                    }
                )

            }
        case Types.EDITNOTE_SUCCESS:
            // 将cache设置为正式值，并清除cache
            return replaceItem(state as Note[], n => n.id === actions.id, old => ({
                ...old,
                title: old.titleCache,
                tags: old.tagsCache,
                content: old.contentCache,
                titleCache: undefined,
                tagsCache: undefined,
                contentCache: undefined,

            }))
        case Types.GETNOTE_SUCCESS:
            return replaceItem(state as Note[], n => n.id === actions.id, () => actions.note as Note)
        case Types.DELETENOTE_SUCCESS:
            return replaceItem(state as Note[], n => n.id === actions.id, old => ({ ...old, alive: false }))
        case Types.GETWASTENOTES_SUCCESS:
            // 合并，并且content以现有内容为准
            return (actions.notes as Note[]).reduce((result, note) => {
                let index = (result as Note[]).findIndex(n => n.id === note.id)
                if (index === -1) {
                    result.push(note)
                } else {
                    result[index] == { ...note, content: result[index].content }
                }
                return result
            }, [...state] as Note[])
        case Types.RESTOREWASTENOTE_SUCCESS:
            return replaceItem(
                state as Note[],
                n => n.id === actions.id,
                old => ({
                    ...old,
                    alive: true,
                    notebookid: actions.notebookid === undefined ? old.notebookid : actions.notebookid
                })
            )
        case Types.MOVENOTE_SUCCESS:
            return replaceItem(
                state as Note[],
                n => n.id === actions.id,
                old => ({
                    ...old,
                    notebookid: actions.notebookid,
                })
            )
        // TODO 
        default:
            return state
    }
}

const notebooks: Reducer<Notebook[]> = (state = [], actions: Action) => {
    switch (actions.type) {
        case Types.NEWBOOK_SUCCESS:
            return [...state, actions.notebook as Notebook]
        case Types.GETNOTEBOOKS_SUCCESS:
            return (actions.notebooks as Notebook[]) || []
        case Types.LISTNOTES_SUCCESS:
            // {
            //     // 更新notebook的syncAt
            //     const
            //         index = state.findIndex(notebook => notebook.id === actions.notebookid),
            //         notebook = { ...state[index], syncAt: +new Date() },
            //         result = [...state]

            //     result[index] = notebook
            //     return result
            // }
            return replaceItem(
                state,
                notebook => notebook.id === actions.notebookid,
                old => ({ ...old, syncAt: +new Date() })
            )
        case Types.NEWNOTE_SUCCESS:
            return replaceItem(
                state,
                book => book.id === actions.note.notebookid,
                old => ({ ...old, count: old.count + 1 })
            )
        case Types.DELETENOTE_SUCCESS:
            return replaceItem(
                state,
                book => book.id === actions.note.notebookid,
                old => ({ ...old, count: old.count - 1 })
            )
        case Types.RESTOREWASTENOTE_SUCCESS:
            return replaceItem(
                state,
                book => book.id === actions.notebookid,
                old => ({ ...old, count: old.count + 1 })
            )
        case Types.RENAMENOTEBOOK_SUCCESS:
            return replaceItem(
                state,
                book => book.id === actions.id,
                old => ({ ...old, name: actions.name })
            )
        case Types.DELETENOTEBOOK_SUCCESS:
            return excludeFunc(state, b => b.id === actions.id)
        // TODO
        default:
            return state
    }
}

const blogs: Reducer<Blog[]> = (state = [], actions: Action) => {
    switch (actions.type) {
        case Types.GETBLOGS_SUCCESS:
            return (actions.blogs as Blog[]).map(blog => {
                const match = state.find(b => b.id === blog.id)
                if (match && match.content) {
                    return { ...blog, content: match.content, editAt: match.editAt }
                }
                return blog
            })
        case Types.GETBLOG_SUCCESS:
            return (actions.blogs as Blog[]).reduce((state, b) => {
                const result = replaceItem(
                    state,
                    blog => blog.id === b.id,
                    old => b
                )
                // 这里可能直接进入博客预览页，还是要加一下
                if (result === state) {
                    return [...result, b]
                } else {
                    return result
                }
            }, state)
        case Types.NEWBLOG_SUCCESS:
            return [...state, actions.blog]
        case Types.EDITBLOG_SUCCESS:
            return replaceItem(
                state,
                blog => blog.id === actions.id,
                old => ({
                    ...old,
                    ...actions.edition,
                    editAt: +new Date(),
                })
            )
        case Types.ACTIVATEBLOG_SUCCESS:
            return replaceItem(
                state,
                blog => blog.id === actions.id,
                old => ({
                    ...old,
                    alive: actions.alive,
                })
            )
        case Types.DELETEBLOG_SUCCESS:
            return excludeFunc(state, b => b.id === actions.id)

        case Types.DELETETAG_SUCCESS:
            const tagName: string = actions.name
            return state.map(b => {
                if (b.tags.indexOf(tagName) > -1) {
                    return { ...b, tags: exclude(b.tags, tagName) }
                }
                return b
            })
        // TODO
        default:
            return state
    }
}

const tags: Reducer<Tag[]> = (state = [], actions: Action) => {
    switch (actions.type) {
        case Types.GETTAGS_SUCCESS:
            return (actions.tags as Tag[]).map(t => {
                const match = state.find(item => item.name == t.name)
                if (match && match.cache != undefined) {
                    return { ...t, cache: match.cache }
                } else {
                    return t
                }
            })
        case Types.EDITTAG_SUCCESS:
            return replaceItem(
                state,
                t => t.name == actions.name,
                t => ({ ...t, description: actions.description, cache: undefined })
            )
        case Types.DELETETAG_SUCCESS:
            return excludeFunc(state, t => t.name == actions.name)
        // case Types._RECOUNT_TAGS:
        //     {
        //         let result: Tag[] = [...state], t: string, index: number

        //         for (t of (actions.add as string[])) {
        //             index = result.findIndex(tag => tag.name == t)
        //             if (index > -1) {
        //                 result[index].count += 1
        //             } else {
        //                 result.push({ name: t, count: 1, description: '' })
        //             }
        //         }

        //         result.forEach(tag => {
        //             if ((actions.reduce as string[]).findIndex(t => t == tag.name) > -1) {
        //                 tag.count -= 1
        //             }
        //         })

        //         return result
        //     }
        case Types._CACHE_TAG_DESCRIPTION:
            return replaceItem(
                state,
                t => t.name == actions.name,
                t => ({ ...t, cache: actions.cache })
            )
        // TODO
        default:
            return state
    }
}

interface uploadQueueAction extends Action {
    id: string,
    // state?: number,
    value?: string,
}

const uploadQueue: Reducer<UploadTask[]> = (state = [], actions: uploadQueueAction) => {
    switch (actions.type) {
        case Types.UPLOAD_START:
            return [...state, { id: actions.id, state: 0 }]
        case Types.UPLOAD_SUCCESS:
            return replaceItem(state, t => t.id == actions.id, t => ({ ...t, state: 1, value: actions.value }))
        case Types.UPLOAD_FAIL:
            return replaceItem(state, t => t.id == actions.id, t => ({ ...t, state: 2 }))
        case Types.UPLOAD_CHECK:
            return excludeFunc(state, t => t.id == actions.id)
        default:
            return state
    }
}

const preferenceInit = __conf.preference || {
    siteName: '',
    domain: '',
    author: '',
    intro: '',
    pageSize: 0,
}

const preference: Reducer<Preference> = (state = preferenceInit, actions: Action) => {
    switch (actions.type) {
        case Types.SETPREFERENCE_SUCCESS:
            return actions.preference as Preference
        default:
            return state
    }
}

const authenticate: Reducer<boolean> = (state = __conf.authenticated || false, actions: Action) => {
    switch (actions.type) {
        case Types.LOGIN_SUCCESS:
            return true
        case Types.LOGOUT_SUCCESS:
            return false
        default:
            return state
    }
}


const interactions: Reducer<Interactions> = (() => {
    const loadings: Reducer<string[]> = (state = [], actions: Action) => {
        // const copy = new Set(state)
        switch (actions.type) {
            case Types.LOGIN_START:
                return [...state, 'LOGIN']
            case Types.LOGIN_SUCCESS:
            case Types.LOGIN_FAIL:
                return exclude(state, 'LOGIN')
            case Types.NEWBOOK_START:
                return [...state, 'NEWBOOK']
            case Types.NEWBOOK_SUCCESS:
            case Types.NEWBOOK_FAIL:
                return exclude(state, 'NEWBOOK')
            case Types.GETNOTEBOOKS_START:
                return [...state, 'GETNOTEBOOKS']
            case Types.GETNOTEBOOKS_SUCCESS:
            case Types.GETNOTEBOOKS_FAIL:
                return exclude(state, 'GETNOTEBOOKS')
            case Types.NEWNOTE_START:
                return [...state, 'NEWNOTE.' + actions.tempId]
            case Types.NEWNOTE_SUCCESS:
            case Types.NEWNOTE_FAIL:
                return exclude(state, 'NEWNOTE.' + actions.tempId)
            case Types.LISTNOTES_START:
                return [...state, 'LISTNOTES.' + actions.notebookid]
            case Types.LISTNOTES_SUCCESS:
            case Types.LISTNOTES_FAIL:
                return exclude(state, 'LISTNOTES.' + actions.notebookid)
            case Types.EDITNOTE_START:
                return [...state, 'EDITNOTE.' + actions.id]
            case Types.EDITNOTE_SUCCESS:
            case Types.EDITNOTE_FAIL:
                return exclude(state, 'EDITNOTE.' + actions.id)
            case Types.GETNOTE_START:
                return [...state, 'GETNOTE.' + actions.id]
            case Types.GETNOTE_SUCCESS:
            case Types.GETNOTE_FAIL:
                return exclude(state, 'GETNOTE.' + actions.id)
            case Types.DELETENOTE_START:
                return [...state, 'DELETENOTE.' + actions.id]
            case Types.DELETENOTE_SUCCESS:
            case Types.DELETENOTE_FAIL:
                return exclude(state, 'DELETENOTE.' + actions.id)
            case Types.GETWASTENOTES_START:
                return [...state, 'GETWASTENOTES']
            case Types.GETWASTENOTES_SUCCESS:
            case Types.GETWASTENOTES_FAIL:
                return exclude(state, 'GETWASTENOTES')
            case Types.RESTOREWASTENOTE_START:
                return [...state, 'RESTOREWASTENOTE.' + actions.id]
            case Types.RESTOREWASTENOTE_SUCCESS:
            case Types.RESTOREWASTENOTE_FAIL:
                return exclude(state, 'RESTOREWASTENOTE.' + actions.id)
            case Types.RENAMENOTEBOOK_START:
                return [...state, 'RENAMENOTEBOOK.' + actions.id]
            case Types.RENAMENOTEBOOK_SUCCESS:
            case Types.RENAMENOTEBOOK_FAIL:
                return exclude(state, 'RENAMENOTEBOOK.' + actions.id)
            case Types.DELETENOTEBOOK_START:
                return [...state, 'DELETENOTEBOOK.' + actions.id]
            case Types.DELETENOTEBOOK_SUCCESS:
            case Types.DELETENOTEBOOK_FAIL:
                return exclude(state, 'DELETENOTEBOOK.' + actions.id)
            case Types.MOVENOTE_START:
                return [...state, 'MOVENOTE.' + actions.id]
            case Types.MOVENOTE_SUCCESS:
            case Types.MOVENOTE_FAIL:
                return exclude(state, 'MOVENOTE.' + actions.id)
            case Types.GETBLOGS_START:
                return [...state, 'GETBLOGS']
            case Types.GETBLOGS_SUCCESS:
            case Types.GETBLOGS_FAIL:
                return exclude(state, 'GETBLOGS')
            case Types.GETBLOG_START:
                return [...state, ...(actions.ids as string[]).map(id => 'GETBLOG.' + id)]
            case Types.GETBLOG_SUCCESS:
            case Types.GETBLOG_FAIL:
                return (actions.ids as string[]).reduce((state, id) => exclude(state, 'GETBLOG.' + id), state)
            case Types.NEWBLOG_START:
                return [...state, 'NEWBLOG.' + actions.noteid]
            case Types.NEWBLOG_SUCCESS:
            case Types.NEWBLOG_FAIL:
                return exclude(state, 'NEWBLOG.' + actions.noteid)
            case Types.EDITBLOG_START:
                return [...state, 'EDITBLOG.' + actions.id]
            case Types.EDITBLOG_SUCCESS:
            case Types.EDITBLOG_FAIL:
                return exclude(state, 'EDITBLOG.' + actions.id)
            case Types.ACTIVATEBLOG_START:
                return [...state, 'ACTIVATEBLOG.' + actions.id]
            case Types.ACTIVATEBLOG_SUCCESS:
            case Types.ACTIVATEBLOG_FAIL:
                return exclude(state, 'ACTIVATEBLOG.' + actions.id)
            case Types.DELETEBLOG_START:
                return [...state, 'DELETEBLOG.' + actions.id]
            case Types.DELETEBLOG_SUCCESS:
            case Types.DELETEBLOG_FAIL:
                return exclude(state, 'DELETEBLOG.' + actions.id)
            case Types.GETTAGS_START:
                return [...state, 'GETTAGS']
            case Types.GETTAGS_SUCCESS:
            case Types.GETTAGS_FAIL:
                return exclude(state, 'GETTAGS')
            case Types.DELETETAG_START:
                return [...state, 'DELETETAG.' + actions.name]
            case Types.DELETETAG_SUCCESS:
            case Types.DELETETAG_FAIL:
                return exclude(state, 'DELETETAG.' + actions.name)
            case Types.EDITTAG_START:
                return [...state, 'EDITTAG.' + actions.name]
            case Types.EDITTAG_SUCCESS:
            case Types.EDITTAG_FAIL:
                return exclude(state, 'EDITTAG.' + actions.name)
            case Types.SETPREFERENCE_START:
                return [...state, 'SETPREFERENCE']
            case Types.SETPREFERENCE_SUCCESS:
            case Types.SETPREFERENCE_FAIL:
                return exclude(state, 'SETPREFERENCE')
            case Types.EDITPASSWORD_START:
                return [...state, 'EDITPASSWORD']
            case Types.EDITPASSWORD_SUCCESS:
            case Types.EDITPASSWORD_FAIL:
                return exclude(state, 'EDITPASSWORD')
            default:
                return state
        }
    }

    const currentNotebook: Reducer<string> = (state = '', actions: Action) => {
        switch (actions.type) {
            case Types._SET_CURRENT_NOTEBOOK:
                return actions.id

            default:
                return state
        }
    }

    const currentNote: Reducer<string> = (state = '', actions: Action) => {
        switch (actions.type) {
            case Types._SET_CURRENT_NOTE:
                return actions.id
            case Types.NEWNOTE_SUCCESS:
                if (state === tempIdPrefix(actions.tempId)) {
                    return (actions.note as Note).id
                }
            case Types.NEWNOTE_START:
                return tempIdPrefix(actions.tempId)
            case Types.DELETENOTE_SUCCESS:
                if (state === actions.id) {
                    return ''
                }
            default:
                return state

        }
    }

    const wasteBasketSyncAt: Reducer<number> = (state = 0, actions: Action) => {
        switch (actions.type) {
            case Types.GETWASTENOTES_SUCCESS:
                return +new Date()
            default:
                return state
        }
    }

    const blogsSyncAt: Reducer<number> = (state = 0, actions: Action) => {
        switch (actions.type) {
            case Types.GETBLOGS_SUCCESS:
                return +new Date()
            default:
                return state
        }
    }

    const modals: Reducer<Modal[]> = (state = [], actions: Action) => {
        switch (actions.type) {
            case Types._ADD_MODAL:
                return [...state, {
                    id: actions.id,
                    alive: true,
                    content: actions.content,
                    modalType: actions.modalType,
                    choices: actions.choices,
                    range: actions.range,
                    title: actions.title,
                }]
            case Types._HIDE_MODAL:
                return replaceItem(state, m => m.id === actions.id, m => ({ ...m, alive: false }))
            case Types._REMOVE_MODAL:
                return state.filter(m => (actions.ids as number[]).indexOf(m.id) == -1)
            default:
                return state
        }
    }

    const warnings: Reducer<Warning[]> = (state = [], actions: Action) => {
        switch (actions.type) {
            case Types._ADD_WARNING:
                return [...state, { id: actions.id, content: actions.content }]
            case Types._REMOVE_WARNING:
                return excludeFunc(state, w => w.id === actions.id)
            default:
                return state
        }
    }

    const tagsSyncAt: Reducer<number> = (state = 0, actions: Action) => {
        switch (actions.type) {
            case Types.GETTAGS_SUCCESS:
                return +new Date()
            case Types.ACTIVATEBLOG_SUCCESS:
            case Types.EDITBLOG_SUCCESS:
            case Types.NEWBLOG_SUCCESS:
                // 考虑到开销代价较低，将直接在每次博客修改时将tagsSyncAt设为0
                return 0
            default:
                return state
        }
    }
    return <Reducer<Interactions>>combineReducers({
        loadings,
        currentNotebook,
        currentNote,
        wasteBasketSyncAt,
        blogsSyncAt,
        modals,
        warnings,
        tagsSyncAt,
    })
})()

export const reducer: Reducer<State> = combineReducers({
    notes,
    notebooks,
    blogs,
    tags,
    authenticate,
    interactions,
    preference,
    uploadQueue,
})