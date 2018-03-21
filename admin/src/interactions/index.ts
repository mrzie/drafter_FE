import { store, Types } from '../store'
import { Choice } from '../model'

const { dispatch } = store

export const setCurrentNotebook = (id: string) => dispatch({
    type: Types._SET_CURRENT_NOTEBOOK,
    id
})

export const setCurrentNote = (id: string) => dispatch({
    type: Types._SET_CURRENT_NOTE,
    id
})

export const cacheNote = (id: string, titleCache: string, tagsCache: string[], contentCache: string) => dispatch({
    type: Types._CACHE_NOTE,
    id,
    titleCache,
    tagsCache,
    contentCache,
})

export const warn = (content: string) => {
    dispatch({ type: Types._ADD_WARNING, id: modalCounter(), content })
    console.warn(content)
}

export const removeWarning = (id: number) => dispatch({ type: Types._REMOVE_WARNING, id })

export const cacheTagDescription = (name: string, cache: string) => dispatch({ type: Types._CACHE_TAG_DESCRIPTION, name, cache })

// export const confirm = (content: string, onresolve: () => Promise<any>, onreject?: () => Promise<any>) => {
//     const choices: Choice[] = [{
//         text: '确认',
//         then: onresolve,
//     }]

//     if (onreject) {
//         choices.push({
//             text: '取消',
//             then: onreject
//         })
//     }

//     return modal(content, choices)
// }

const modalCounter = (() => {
    let id = 0
    return () => ++id
})()

const hideAndRemoveModal = (id: number) => {
    dispatch({
        type: Types._HIDE_MODAL,
        id
    })
    setTimeout(() => dispatch({
        type: Types._REMOVE_MODAL,
        ids: [id]
    }), 10000)
}

export const modal = (content: string, choices: Choice[], range: number = 0, title?: string) => {
    if (choices.length == 0) {
        return
    }

    const id = modalCounter()

    choices = choices.map(choice => ({
        ...choice,
        then: (() => {
            const result = choice.then()
            if (typeof result == 'boolean') {
                if (result) {
                    hideAndRemoveModal(id)
                }
                return result
            }
            return result.then(() => hideAndRemoveModal(id))
        }) as () => boolean | Promise<any>
    }))

    dispatch({ type: Types._ADD_MODAL, id, content, choices, range, title })

    return id
}

export const cleanModalUnderRange = (range: number) => {
    const ids = store.getState().interactions.modals.filter(m => m.range === range).map(m => m.id)
    if (ids.length) {
        dispatch({ type: Types._REMOVE_MODAL, ids })
    }
}

export const removeModal = (ids: number[]) => dispatch({ type: Types._REMOVE_MODAL, ids })

export const uploadCheck = (id: string) => dispatch({type: Types.UPLOAD_CHECK, id})