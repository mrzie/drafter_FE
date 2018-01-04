import * as React from 'react'
import { Notebook, State } from '../../model'
import { withStyles, StyleRulesCallback } from 'material-ui/styles'
import { Grid, Card, Button, TextField, IconButton, Menu, MenuItem, CircularProgress } from 'material-ui'
import List, { ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction } from 'material-ui/List'
import { connect } from 'react-redux'
import * as ReactDOM from 'react-dom'
import { MoreVert, Book } from 'material-ui-icons'
import Dialog, {
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from 'material-ui/Dialog'
import * as api from '../../api'
import Slide from 'material-ui/transitions/Slide'
import FlexMenu from '../../utils/flexMenu'

const styles: StyleRulesCallback = theme => ({
    container: {
        width: '100%',
        maxHeight: '100vh',
    },
    header: {
        height: '50px',
    },
    button: {
        // float: 'right',
        margin: '10px 0',
    },
    empty: {
        '&:empty:before': {
            content: '"(无标题)"',
            fontSize: '.9em',
            color: '#666'
        }
    },
    count: {
        padding: '0 10px',
        display: 'inline-block',
        color: '#aaa',
        fontSize: '.8em',
    },
    circularProgress: {
        display: 'block',
        color: '#3b8adb',
    },
    listWrapper: {
        maxHeight: 'calc(100vh - 114px)',
        overflowY: 'auto',
    },
})

const isBookBusy = (loadings: string[], id: string) => loadings.indexOf('RENAMENOTEBOOK.' + id) > -1 || loadings.indexOf('DELETENOTEBOOK.' + id) > -1

const mapStateToProps = (state: State) => ({
    notebooks: state.notebooks,
    loadings: state.interactions.loadings,
})

interface NotebooksViewProps {
    notebooks: Notebook[],
    classes: any,
    loadings: string[],
}

interface NotebooksViewState {
    newBookInputing: boolean,
    newBookName: string,
    contextMenuOpen: boolean,
    contextMenuAnchor: HTMLElement,
    contextMenuTarget: string,
    // dialogs: dialog[]
    renameDialogTarget: boolean | string,
    renameDialogInput: string,
    deleteDialogTarget: boolean | string,
    menuAnchorX: number,
    menuAnchorY: number,
}

// interface dialog {
//     title: string,
//     content: string,
//     resolve?: string,
//     reject?: string,
//     onResolve: () => void,
//     onReject: () => void,
// }

class NotebooksView extends React.Component<NotebooksViewProps, NotebooksViewState> {
    state = {
        newBookInputing: false,
        newBookName: '',
        contextMenuOpen: false,
        contextMenuAnchor: undefined as HTMLElement,
        contextMenuTarget: '',
        // dialogs: [] as dialog[],
        renameDialogTarget: false as boolean | string,
        renameDialogInput: '',
        deleteDialogTarget: false as boolean | string,
        menuAnchorX: 0,
        menuAnchorY: 0,
    }

    // menuAnchor: Element = null

    handleNewBookCancel = () => {
        this.setState({ newBookInputing: false, newBookName: '' })
    }

    handleNewBookConfirm = () => {
        api.newbook(this.state.newBookName)
        this.setState({ newBookInputing: false, newBookName: '' })
    }

    handleContextMenu(id: string, followCursor = false) {
        return (e: React.MouseEvent<(HTMLLIElement | HTMLButtonElement | HTMLAnchorElement)>) => {
            e.preventDefault()

            if (followCursor) {

                this.setState({
                    contextMenuOpen: true,
                    contextMenuTarget: id,
                    contextMenuAnchor: undefined,
                    menuAnchorX: e.clientX,
                    menuAnchorY: e.clientY,
                    // contextMenuAnchor: this.addMenuAnchor(e.clientX, e.clientY),
                })
            } else {
                this.setState({
                    contextMenuOpen: true,
                    contextMenuTarget: id,
                    contextMenuAnchor: e.target as HTMLElement,
                })
            }
        }
    }


    onContextMenuClose = () => {
        this.setState({ contextMenuOpen: false })
    }

    handleDeleteNotebook = () => {
        this.setState({
            deleteDialogTarget: this.state.contextMenuTarget,
            contextMenuOpen: false,
        })
    }

    handleRenameNotebook = () => {
        this.setState({
            renameDialogTarget: this.state.contextMenuTarget,
            renameDialogInput: '',
            contextMenuOpen: false,
        })
    }

    handleRenameNotebookConfirm = () => {
        if (typeof this.state.renameDialogTarget === 'string') {
            api.renameNotebook(this.state.renameDialogTarget, this.state.renameDialogInput)
            this.setState({
                renameDialogTarget: false,
            })
        }
    }

    handleDeleteNotebookConfirm = () => {
        if (typeof this.state.deleteDialogTarget === 'string') {
            api.deleteNotebook(this.state.deleteDialogTarget)
            this.setState({
                deleteDialogTarget: false,
            })
        }
    }

    render() {
        const { classes, notebooks, loadings } = this.props

        return <div className={classes.container}>
            <div className={classes.header}></div>
            <Grid container justify="center">
                <Grid item xs={10} xl={6} md={6}>
                    <Button
                        raised
                        className={classes.button}
                        onClick={() => this.setState({ newBookInputing: true })}
                    >
                        新笔记本
                    </Button>
                    {notebooks.length > 0
                        ? <Card classes={{ root: classes.listWrapper }}>
                            <List>
                                {notebooks.map(nb => <ListItem
                                    key={nb.id}
                                    button
                                    onContextMenu={this.handleContextMenu(nb.id, true)}
                                >
                                    <ListItemIcon>

                                        {
                                            isBookBusy(loadings, nb.id)
                                                ? <CircularProgress className={classes.circularProgress} size={24} />
                                                : <Book />
                                        }
                                    </ListItemIcon>
                                    <span className={classes.empty}>{nb.name}</span>
                                    <span className={classes.count}>{nb.count}</span>
                                    <ListItemSecondaryAction >
                                        <IconButton
                                            onClick={this.handleContextMenu(nb.id)}
                                            onContextMenu={this.handleContextMenu(nb.id)}
                                        >
                                            <MoreVert />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>)}
                                <FlexMenu
                                    x={this.state.menuAnchorX}
                                    y={this.state.menuAnchorY}
                                    anchorEl={this.state.contextMenuAnchor}
                                    open={this.state.contextMenuOpen}
                                    onRequestClose={this.onContextMenuClose}
                                >
                                    <MenuItem
                                        selected={false}
                                        onClick={this.handleRenameNotebook}
                                        disabled={isBookBusy(loadings, this.state.contextMenuTarget)}
                                    >
                                        重命名
                                    </MenuItem>
                                    <MenuItem
                                        selected={false}
                                        onClick={this.handleDeleteNotebook}
                                        disabled={isBookBusy(loadings, this.state.contextMenuTarget)}
                                    >
                                        删除笔记本
                                    </MenuItem>
                                </FlexMenu>
                            </List>
                        </Card>
                        : null
                    }
                </Grid>
            </Grid>
            <Dialog open={this.state.newBookInputing} transition={<Slide direction="up" />}>
                <DialogTitle>新笔记本</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        fullWidth
                        label="笔记本名"
                        onChange={event => this.setState({ newBookName: (event.target as HTMLInputElement).value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleNewBookCancel}>
                        取消
                    </Button>
                    <Button onClick={this.handleNewBookConfirm} color="primary">
                        确定
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={this.state.renameDialogTarget !== false} transition={<Slide direction="up" />}>
                <DialogTitle>重命名</DialogTitle>
                <DialogContent>
                    笔记本{(notebook => notebook ? notebook.name : '')(notebooks.find(b => b.id === this.state.renameDialogTarget))}将被重命名为
                    <TextField
                        autoFocus
                        margin="dense"
                        fullWidth
                        value={this.state.renameDialogInput}
                        label="新名字"
                        onInput={event => this.setState({ renameDialogInput: (event.target as HTMLInputElement).value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => this.setState({ renameDialogTarget: false })}>
                        取消
                    </Button>
                    <Button onClick={this.handleRenameNotebookConfirm} color="primary">
                        确定
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={this.state.deleteDialogTarget !== false} transition={<Slide direction="up" />}>
                <DialogTitle>删除笔记本</DialogTitle>
                <DialogContent>
                    确认删除笔记本 {(notebook => notebook ? notebook.name : '')(notebooks.find(b => b.id === this.state.deleteDialogTarget))} 吗？
                    <span style={{ color: '#f00' }}>这个操作将不能撤销</span>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => this.setState({ deleteDialogTarget: false })}>
                        取消
                    </Button>
                    <Button onClick={this.handleDeleteNotebookConfirm} >
                        确定
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    }
}

export default withStyles(styles)(connect(mapStateToProps)(NotebooksView))