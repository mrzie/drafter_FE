import * as React from 'react'
import Card, { CardContent, CardHeader } from 'material-ui/Card'
import { withStyles, StyleRulesCallback } from 'material-ui/styles'
import {
    MenuItem,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    Select,
    DialogContentText,
    Input
} from 'material-ui'
import Button from 'material-ui/Button'
import { connect } from 'react-redux'
import { State, Notebook, Note, TempNote } from '../../model'
import { Redirect } from 'react-router'
import { CircularProgress, LinearProgress } from 'material-ui/Progress'
import { InsertDriveFile } from 'material-ui-icons'
import * as api from '../../api'
import * as interactions from '../../interactions'
import { timeFormat, tempIdPrefix, sort } from '../../utils'
import FlexMenu from '../../utils/flexMenu'
import { notelistStyles } from '../../utils/styles'
import Slide from 'material-ui/transitions/Slide'

const mapStateToProps = (state: State, ownProps: { nbid: string, isLoadingBooks: boolean, classes?: any }) => ({
    notebook: state.notebooks.find(item => item.id === ownProps.nbid),
    notes: state.notes,
    getNotesLoading: state.interactions.loadings.indexOf('LISTNOTES.' + ownProps.nbid) > -1,
    currentNote: state.interactions.currentNote,
    loadings: state.interactions.loadings,
    notebooks: state.notebooks,
    // ...ownProps
})

const styles: StyleRulesCallback = theme => ({
    newNote: {
        // background: '#eee',
        color: '#999',
        padding: '10px',
        margin: '5px',
        fontSize: '.7em',
        textAlign: 'center',
        width: 'calc(100% - 8px)',
    },
    note: {
        margin: '5px',
    },
    loadingLayer: {
        display: 'block',
        margin: '5px auto',
    },
    ...notelistStyles,
})

interface NotelistProps {
    nbid: string,
    classes: any,
    className: string,
    theme?: any,
    notebook: Notebook,
    notes: (Note | TempNote)[],
    newNoteLoading: boolean,
    getNotesLoading: boolean,
    isLoadingBooks: boolean,
    currentNote: string,
    loadings: string[],
    notebooks: Notebook[],
}

interface NotelistState {
    menuX: number,
    menuY: number,
    menuOpen: boolean,
    menuTarget: string,
    moveNoteDialogOpen: boolean,
    moveNoteTo: string,
    moveNoteFrom: string,
}

const notelistShouldRefetch = (props: NotelistProps) => {
    if (!props.notebook || props.getNotesLoading) {
        return false
    }
    if (!props.notebook.syncAt || props.notebook.syncAt + 1000 * 60 * 15 <= +new Date()) {
        return true
    }
    return false
}
let refetchNotelist = (props: NotelistProps) => {
    if (!props.currentNote) {
        // 未选中currentNote
        const notes = props.notes.filter(n => n.notebookid == props.nbid && n.alive)
        if (notes.length) {
            // 选中第一篇笔记

            const
                isTempNote = (n => n.hasOwnProperty('tempId')) as (n: TempNote | Note) => n is TempNote,
                n = notes[0],
                key = isTempNote(n) ? tempIdPrefix(n.tempId) : n.id

            interactions.setCurrentNote(key)
            refetchNotelist = fetchNoteListIfNeeded
        }
    }

    fetchNoteListIfNeeded(props)
}

const fetchNoteListIfNeeded = (props: NotelistProps) => {
    if (notelistShouldRefetch(props)) {
        api.listNotes(props.notebook.id)
    }
}

const menuNOOP = (e: React.MouseEvent<any>) => e.preventDefault()

class List extends React.Component<NotelistProps, NotelistState> {
    state = {
        menuX: 0,
        menuY: 0,
        menuOpen: false,
        menuTarget: '',
        moveNoteDialogOpen: false,
        moveNoteTo: '',
        moveNoteFrom: '',
    }

    componentWillMount() {
        refetchNotelist(this.props)
    }

    componentWillReceiveProps(nextProps: NotelistProps) {
        refetchNotelist(nextProps)

        const current = (nextProps.notes as Note[]).find(n => n.id == nextProps.currentNote)
        if (current && current.content === undefined && nextProps.loadings.indexOf('GETNOTE.' + current.id) === -1) {
            api.getNote(current.id)
        }
    }

    handleContextMenu(id: string) {
        return (e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault()
            e.stopPropagation()
            this.setState({
                menuX: e.clientX,
                menuY: e.clientY,
                menuOpen: true,
                menuTarget: id,
            })
        }
    }

    onContextMenuClose = () => {
        this.setState({
            menuOpen: false,
            menuTarget: null,
        })
    }

    handleDeleteNote = () => {
        if (this.state.menuTarget) {
            api.deleteNote(this.state.menuTarget)
        }
        this.setState({
            menuOpen: false,
            menuTarget: null,
        })
    }

    handleMoveNote = () => {
        this.setState({
            menuOpen: false,
            moveNoteDialogOpen: true,
            moveNoteTo: '',
            moveNoteFrom: (this.props.notes as Note[]).find(n => n.id === this.state.menuTarget).notebookid,
        })
    }

    handleMoveNoteConfirm = () => {
        if (this.state.menuTarget && this.state.moveNoteTo) {
            api.moveNote(this.state.menuTarget, this.state.moveNoteTo)
            this.moveNoteDialogClose()
        }
    }

    moveNoteDialogClose = () => {
        this.setState({
            menuTarget: '',
            moveNoteTo: '',
            moveNoteFrom: '',
            moveNoteDialogOpen: false,
        })
    }

    render() {
        if (this.props.notebook === undefined) {
            // 无效的notebookId
            return <Redirect to="/admin/" />
        }

        const notes = this.props.notes.filter(n => n.notebookid == this.props.nbid && n.alive).sort(sort.createDESC),
            {
                listItem,
                itemSelected,
                itemProgressHolder,
                topProgress,
                itemProgress,
                itemProgressColor,
                itemProgressBar,
                itemContent,
                itemTitle,
                itemAbstract,
                itemTime
            } = this.props.classes

        return <div className={this.props.className}>
            {
                this.props.getNotesLoading || this.props.isLoadingBooks
                    ? <LinearProgress classes={{
                        root: topProgress,
                        primaryColor: itemProgressColor,
                        primaryColorBar: itemProgressBar,
                    }} />
                    : null
            }
            {
                notes.length
                    ? notes.map(note => {
                        const
                            rootClass = [listItem]


                        if (note.hasOwnProperty('id')) {
                            const { id, title, editAt, abstract, content, titleCache, contentCache } = note as Note

                            if (this.props.currentNote == id) {
                                rootClass.push(itemSelected)
                            }

                            const isNoteBusy = !!['EDITNOTE.', 'GETNOTE.', 'DELETENOTE.', 'MOVENOTE.'].find(pre => this.props.loadings.indexOf(pre + id) > -1)//this.props.loadings.indexOf('EDITNOTE.' + id) > -1 || this.props.loadings.indexOf('GETNOTE.' + id) > -1
                            return <Card
                                classes={{ root: rootClass.join(' ') }}
                                key={id}
                                onClick={() => interactions.setCurrentNote(id)}
                                onContextMenu={isNoteBusy ? menuNOOP : this.handleContextMenu(id)}
                            >
                                {
                                    isNoteBusy
                                        ? <LinearProgress classes={{
                                            root: itemProgress,
                                            primaryColor: itemProgressColor,
                                            primaryColorBar: itemProgressBar,
                                        }} />
                                        : titleCache !== undefined
                                            ? <div className={itemProgressHolder}></div>
                                            : null
                                }

                                <CardContent classes={{ root: itemContent }}>
                                    <div className={itemTitle}>{titleCache || title}</div>
                                    <div className={itemAbstract}>
                                        <div className={itemTime}>{timeFormat(new Date(editAt), 'yyyy-mm-dd hh:MM:ss')}</div>
                                        {contentCache || content || abstract}
                                    </div>
                                </CardContent>
                            </Card>
                        } else {
                            const
                                { tempId, editAt } = note as TempNote,
                                key = tempIdPrefix(tempId)

                            if (this.props.currentNote == key) {
                                rootClass.push(itemSelected)
                            }
                            return <Card
                                classes={{ root: rootClass.join(' ') }}
                                key={key}
                                onClick={() => interactions.setCurrentNote(key)}
                                onContextMenu={menuNOOP}
                            >
                                <LinearProgress classes={{
                                    root: itemProgress,
                                    primaryColor: itemProgressColor,
                                    primaryColorBar: itemProgressBar,
                                }} />
                                <CardContent classes={{ root: itemContent }}>
                                    <div className={itemTitle}></div>
                                    <div className={itemAbstract}>
                                        <div className={itemTime}>{timeFormat(new Date(editAt), 'yyyy-mm-dd hh:MM:ss')}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        }
                    })
                    : <InsertDriveFile className={this.props.classes.emptyIcon} />
            }
            <FlexMenu
                x={this.state.menuX}
                y={this.state.menuY}
                open={this.state.menuOpen}
                onRequestClose={this.onContextMenuClose}
            >
                <MenuItem
                    selected={false}
                    onClick={this.handleMoveNote}
                >
                    移动到...
                </MenuItem>
                <MenuItem
                    selected={false}
                    onClick={this.handleDeleteNote}
                >
                    删除笔记
                </MenuItem>

            </FlexMenu>
            <Dialog open={this.state.moveNoteDialogOpen} transition={<Slide direction="up" />}>
                <DialogTitle>移动至...</DialogTitle>
                <DialogContent>
                    <DialogContentText>

                    </DialogContentText>
                    <Select
                        value={this.state.moveNoteTo}
                        onChange={e => this.setState({ moveNoteTo: e.target.value })}
                        input={<Input />}
                    >
                        {this.props.notebooks.map(notebook => <MenuItem
                            key={notebook.id}
                            value={notebook.id}
                            disabled={notebook.id === this.state.moveNoteFrom}
                        >
                            {notebook.name}
                        </MenuItem>)}
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.moveNoteDialogClose}>
                        取消
                    </Button>
                    <Button
                        onClick={this.handleMoveNoteConfirm}
                        disabled={this.state.moveNoteTo === ''}
                        color="primary"
                    >
                        确定
                    </Button>
                </DialogActions>
            </Dialog>
        </div >
    }
}

export default withStyles(styles)(connect(mapStateToProps)(List)) as React.ComponentClass<{ nbid: string, className?: string, isLoadingBooks: boolean }>