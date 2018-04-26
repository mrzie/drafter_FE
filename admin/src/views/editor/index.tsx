import { withRouter } from 'react-router'
import * as React from 'react'
import { Grid, Paper, TextField, Chip, Button, Tooltip, IconButton, Menu, MenuItem, Divider } from 'material-ui'
import CodeMirror from '../codemirror.config'
import TagEditor from './tagEditor'
import withEditorStyles from './editorStyles'
import { connect } from 'react-redux'
import * as ReactDOM from 'react-dom'
import { State, Note, TempNote, Notebook, Blog, UploadTask } from '../../model'
import * as interactions from '../../interactions'
import { Delete, Save, Publish, /* did you fix publish?*/ } from 'material-ui-icons'
import * as api from '../../api'
import { marked, isTempIdPrefixed } from '../../utils'
import uploadCounter from './uploadCounter'
import PublishMenu from './publishMenu'

const mapStateToProps = (state: State, ownProps: { classes: any, theme?: any }) => {
    const blank = {
        title: '',
        content: '',
        tags: [] as string[],
        createAt: 0,
        editAt: 0,
        // notebookName: '',
        empty: false,
        isFetching: false,
        isComposing: false,
        isSaving: false,
        isDeleting: false,
        currentNote: '',
        blogs: state.blogs,
        loadings: null as string[],
        uploadQueue: state.uploadQueue,
    }
    const { currentNote } = state.interactions
    if (currentNote === '') {
        return { ...blank, empty: true }
    } else if (isTempIdPrefixed(currentNote)) {
        // tempnote
        const note = (state.notes as TempNote[]).find(n => n.tempId === currentNote)
        if (!note) {
            return { ...blank, empty: true }
        }

        const
            // notebook = state.notebooks.find(book => book.id === note.notebookid),
            // notebookName = notebook ? notebook.name : '',
            { createAt, editAt } = note

        return { ...blank, createAt, editAt, isFetching: true, currentNote }
        // return { ...blank, notebookName, createAt, editAt, isFetching: true, currentNote }
    } else {
        const note = (state.notes as Note[]).find(n => n.id === currentNote)
        if (!note) {
            return { ...blank, empty: true }
        }

        const
            // notebook = state.notebooks.find(book => book.id === note.notebookid),
            // notebookName = notebook ? notebook.name : '',
            loadings = state.interactions.loadings,
            isSaving = loadings.indexOf('EDITNOTE.' + currentNote) > -1,
            isFetching = loadings.indexOf('GETNOTE.' + currentNote) > -1,
            isDeleting = loadings.indexOf('DELETENOTE.' + currentNote) > -1,
            isComposing = loadings.indexOf('NEWBLOG.' + currentNote) > -1

        let { title, content, tags, createAt, editAt } = note
        if (note.titleCache != undefined) {
            title = note.titleCache
            content = note.contentCache
            tags = note.tagsCache
        }

        return { ...blank, title, content, tags, createAt, editAt, isSaving, isFetching, isDeleting, currentNote, loadings, isComposing }
        // return { ...blank, title, content, tags, createAt, editAt, notebookName, isSaving, isFetching, isDeleting, currentNote, loadings, isComposing }
    }
}

interface EditorProps {
    classes: any,
    // match: any,
    title: string,
    content: string,
    tags: string[],
    createAt: number,
    editAt: number,
    // notebookName: string,
    empty: boolean,
    isFetching: boolean,
    isComposing: boolean,
    loadings: string[],
    isSaving: boolean,
    isDeleting: boolean,
    currentNote: string,
    blogs: Blog[],
    uploadQueue: UploadTask[],
}

interface EditorState {
    title: string,
    text: string,
    tags: string[],
    publishMenuOpen: boolean,
    isDragOver: boolean,
}

interface Replacement {
    id: string,
    match: string,
    altText: string,
    url: string,
}

const propsReadonly = (p: EditorProps) => p.empty || p.isFetching || p.isSaving || p.isDeleting

interface CMInstance extends CodeMirror.Doc, CodeMirror.Editor { }
class Editor extends React.Component<EditorProps, EditorState> {
    state = {
        title: this.props.title,
        text: this.props.content,
        tags: this.props.tags,
        publishMenuOpen: false,
        isDragOver: false,
    }
    doc: CMInstance = null
    publishEl: HTMLElement = null
    constructor(...args: any[]) {
        super(...args)
        // this.initInputAreas(this.props)
    }
    initInputAreas(props: EditorProps) {
        // state 根据外部数据变化而变化（切换笔记等
        this.setState({
            title: props.title,
            text: props.content || '',
            tags: props.tags,
        })
    }
    componentWillReceiveProps(next: EditorProps) {
        const
            currentNoteChanged = this.props.currentNote != next.currentNote,
            worthCache = currentNoteChanged && !propsReadonly(this.props),
            worthReInit = currentNoteChanged || (propsReadonly(this.props) && !propsReadonly(next))

        if (worthCache) {
            this.cacheNote()
        }
        if (worthReInit) {
            this.initInputAreas(next)
        }

        this.replaceImageHolder(next.uploadQueue)
    }
    componentWillUnmount() {
        if (!propsReadonly(this.props)) {
            this.cacheNote()
        }
    }
    cacheNote() {
        interactions.cacheNote(this.props.currentNote, this.state.title, this.state.tags, this.state.text)
    }
    saveNote = () => {
        this.cacheNote()
        return api.saveNote(this.props.currentNote)
    }
    openPublishMenu = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        this.setState({ publishMenuOpen: true })
        this.publishEl = e.target as HTMLElement
    }
    closePublishMenu = () => {
        this.setState({ publishMenuOpen: false })
    }
    onKeySave: React.EventHandler<React.KeyboardEvent<HTMLDivElement>> = (e) => {
        const focused = this.doc.hasFocus()
        if (e.keyCode == 83 && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            this.saveNote().then(() => {
                if (focused && this.doc) {
                    this.doc.focus()
                }
            })
        }
    }
    syncScroll(data: CodeMirror.ScrollInfo) {
        if (data.height <= data.clientHeight) {
            return
        }

        const previewer = ReactDOM.findDOMNode(this.refs.previewer)

        previewer.scrollTo(
            0,
            Math.round(data.top / (data.height - data.clientHeight) * (previewer.scrollHeight - previewer.clientHeight))
        )
    }
    publishNewBlog = async () => {
        if (propsReadonly(this.props)) {
            return
        }
        const noteid = this.props.currentNote
        this.closePublishMenu()

        await api.saveNote(noteid)
        api.composeBlog(noteid)
    }
    handleEditToBlog = async (id: string, noteid: string) => {
        if (propsReadonly(this.props)) {
            return
        }

        this.closePublishMenu()

        await api.saveNote(noteid)
        api.editBlog(id, noteid)

    }
    handleDrop: React.DragEventHandler<HTMLDivElement> = e => {
        e.preventDefault()
        e.stopPropagation()

        if (propsReadonly(this.props)) {
            // 对于无法编辑的文章不触发拖拽上传（不是，传完了图放哪儿啊
            return
        }

        this.setState({ isDragOver: false })
        const
            files = e.dataTransfer.files,
            images: File[] = Array.prototype.filter.call(files, (f: File) => f.type.indexOf('image/') == 0),
            holders = images.map(f => {
                // with side effect
                const id = uploadCounter()
                api.uploadImage(f, id)
                return id
            })
        this.insertImageHolder(holders)

    }
    handleDragEnter: React.DragEventHandler<HTMLDivElement> = e => {
        if (this.state.isDragOver) {
            return
        }
        e.preventDefault()
        e.stopPropagation()
        if (propsReadonly(this.props)) {
            // 对于无法编辑的文章不触发拖拽上传
            return
        }
        this.setState({ isDragOver: true })
    }
    handleDragLeave: React.DragEventHandler<HTMLDivElement> = e => {
        e.preventDefault()
        e.stopPropagation()
        this.setState({ isDragOver: false })
    }
    insertImageHolder(holders: string[]) {
        const
            isAnchor = this.doc.getSelection().length === 0,
            cursor = this.doc.getCursor(),
            line = this.doc.getLine(cursor.line),
            emptyLine = line.length === 0,
            isLastLine = this.state.text.split('\n').length - 1 == cursor.line,
            brBefore = emptyLine || !isLastLine ? '' : '\n',
            brAfter = isLastLine ? '' : '\n'

        if (!emptyLine) {
            this.doc.setCursor({ line: cursor.line + 1, ch: 0 })
        }
        this.doc.replaceSelection(brBefore + holders.map(holder => `![](${holder})`).join('\n') + brAfter)
        requestAnimationFrame(() => {
            if (!isLastLine) {
                this.doc.setCursor(this.doc.posFromIndex(this.doc.indexFromPos(this.doc.getCursor()) - 1))
            }
        })
    }
    replaceImageHolder(tasks: UploadTask[]) {
        for (let task of tasks) {
            if (task.state === 0) {
                // 还在上传的就接着传吧别瞎掺和了
                // 这里是准备把已经确定上传成功或者失败的拎出来
                continue
            }
            const match = this.state.text.match(new RegExp(`\\\!\\\[(.*)\\\]\\\(${task.id}\\\)`))
            if (!match) {
                continue
            }

            interactions.uploadCheck(task.id)
            const
                pos = this.doc.posFromIndex(this.state.text.indexOf(match[0])),
                url = task.state === 1 ? task.value : 'fail'

            this.doc.replaceRange(`![${match[1]}](${url})`, pos, { ...pos, ch: pos.ch + match[0].length })
        }
    }
    render() {
        const
            { classes } = this.props,
            readonly = propsReadonly(this.props),
            coverClass = this.state.isDragOver ? classes.uploadCover : classes.hidden

        return <div
            className={classes.container}
            onKeyDown={this.onKeySave}
            onDragEnter={this.handleDragEnter}
            ref="root"
        >
            <header className={classes.header}>
                <input
                    className={classes.title}
                    placeholder="标题"
                    disabled={readonly}
                    value={this.state.title}
                    onInput={e => this.setState({ title: (e.target as HTMLInputElement).value })}
                    onChange={() => null}
                />
                <div className={classes.buttons}>
                    <Tooltip label="Save" title="保存" placement="bottom" >
                        <IconButton
                            disabled={readonly}
                            onClick={this.saveNote}
                        >
                            <Save />
                        </IconButton>
                    </Tooltip>
                    <Tooltip label="Delete" title="删除" placement="bottom">
                        <IconButton
                            disabled={readonly}
                            onClick={() => api.deleteNote(this.props.currentNote)}
                        >
                            <Delete />
                        </IconButton>
                    </Tooltip>
                    <Tooltip label="Publish" title="发布" placement="bottom">
                        <IconButton
                            disabled={readonly}
                            onClick={this.openPublishMenu}
                        >
                            <Publish />
                        </IconButton>
                    </Tooltip>
                    <PublishMenu
                        open={!readonly && this.state.publishMenuOpen}
                        onRequestClose={this.closePublishMenu}
                        anchorEl={this.publishEl}
                        isComposing={this.props.isComposing}
                        noteid={this.props.currentNote}
                        onPublish={this.publishNewBlog}
                        onEditToBlog={this.handleEditToBlog}
                    />
                </div>
            </header>
            <TagEditor tags={this.state.tags} onChange={tags => this.setState({ tags })} readonly={readonly} />
            <Grid container classes={{ typeContainer: classes.editorContainer }}>
                <Grid item xs={6} lg={6}>
                    <Paper>
                        <CodeMirror
                            ref={"codeMirror"}
                            editorDidMount={e => {
                                this.doc = e
                                // this.doc.focus()
                            }}
                            // autoFocus={true}
                            className={classes.editor}
                            value={this.state.text}
                            onBeforeChange={(editor, metadata, change) => this.setState({ text: change })}
                            onChange={() => null}
                            onScroll={(editor, data) => this.syncScroll(data)}
                            options={{
                                lineNumbers: false,
                                mode: 'markdown',
                                readOnly: readonly ? 'nocursor' : false,
                                lineWrapping: true,
                                theme: "solarized dark",
                                autoCloseBrackets: true,
                                matchBrackets: true,
                                keyMap: 'sublime',
                                styleActiveLine: true,
                                extraKeys: { Enter: "newlineAndIndentContinueMarkdownList" },
                                foldGutter: true,
                                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                                // }}
                            } as CodeMirror.EditorConfiguration}

                        />
                    </Paper>
                </Grid>
                <Grid item xs={6} lg={6}>
                    <Paper classes={{ root: classes.previewer + ' markdown-body' }} ref="previewer" >
                        <div dangerouslySetInnerHTML={{ __html: marked(this.state.text || '') }} ></div>
                        &nbsp;
                    </Paper>
                </Grid>
            </Grid>
            <div
                className={coverClass}
                onDragLeave={this.handleDragLeave}
                onDragOver={e => e.preventDefault()}
                onDrop={this.handleDrop}
            ></div>
        </div>
    }
}

const styled = withEditorStyles(connect(mapStateToProps)(Editor))

export default withRouter(styled)