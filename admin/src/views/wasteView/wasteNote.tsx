import * as React from 'react'
import { Note, State, Notebook } from '../../model'
import { withStyles, StyleRulesCallback } from 'material-ui/styles'
import {
    Paper,
    Grid,
    Chip,
    CircularProgress,
    IconButton,
    Tooltip,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    DialogActions,
    // TextField,
    Input,
    Button,
    Select, 
    MenuItem,
} from 'material-ui'
import Slide from 'material-ui/transitions/Slide'
import { parse as marked } from 'marked'
import { Restore } from 'material-ui-icons'
import * as api from '../../api'

const styles: StyleRulesCallback = theme => ({
    container: {
        width: '100%',
        overflow: 'hidden',
    },
    tagsWrapper: {
        display: 'flex',
        zoom: 0.7,
        marginBottom: '20px',
    },
    header: {
        height: '50px',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '.9rem',
    },
    note: {
        padding: '24px',
        height: 'calc(100vh - 106px)',
        overflow: 'auto',
    },
    intro: {
        width: '100%',
        lineHeight: '50px',
        color: '#aaa',
        textAlign: 'center',
    },
})

interface WasteNoteProps {
    note: Note,
    isRestoring: boolean,
    loadings: string[],
    notebooks: Notebook[],
    classes: any,
    theme?: any,
}

interface WasteNoteState {
    isViewSource: boolean,
    restoreDialogOpen: boolean,
    restoreDialogText: string,
    restoreTargetNotebook: string,
}

class WasteNote extends React.Component<WasteNoteProps, WasteNoteState> {
    state = {
        isViewSource: false,
        restoreDialogOpen: false,
        restoreDialogText: '',
        restoreTargetNotebook: '',
    }
    componentWillReceiveProps(next: WasteNoteProps) {
        const { isLoading } = this.computed(next)
        if (!!next.note && next.note.content === undefined && !isLoading) {
            api.getNote(next.note.id)
        }
    }
    computed(props: WasteNoteProps) {
        return {
            isLoading: !!props.note && this.props.loadings.indexOf('GETNOTE.' + props.note.id) !== -1
        }
    }
    onRequestRestore = () => {
        const
            originNotebook = this.props.notebooks.find(b => b.id === this.props.note.notebookid),
            text = originNotebook ? '恢复笔记到' : '原笔记本不复存在，请选择恢复到'

        this.setState({
            restoreDialogOpen: true,
            restoreDialogText: text,
            restoreTargetNotebook: originNotebook ? originNotebook.id : '',
        })
    }
    onConfirmRestore = () => {
        this.setState({ restoreDialogOpen: false })
        api.restoreNoteTo(this.props.note.id, this.state.restoreTargetNotebook)
    }
    render() {
        const
            note = this.props.note,
            { isLoading } = this.computed(this.props)


        return <div className={this.props.classes.container}>
            <div className={this.props.classes.header}>
                <div className={this.props.classes.intro}>废纸篓中的文章将在30天后自动删除。</div>
                <div className={this.props.classes.buttons}>
                    <Tooltip label="Restore" title="恢复到笔记本" placement="bottom" >
                        <IconButton disabled={!note} onClick={this.onRequestRestore}>
                            <Restore />
                        </IconButton>
                    </Tooltip>
                    {/* <Tooltip label="Delete" title="删除" placement="bottom">
                        <IconButton
                            disabled={readonly}
                            onClick={() => api.deleteNote(this.props.currentNote)}
                        >
                            <Delete />
                        </IconButton>
                    </Tooltip> */}
                </div>
            </div>
            <Grid container justify="center">
                <Grid item xs={10} sm={10} md={9} lg={9}>

                    {note
                        ? <Paper className={this.props.classes.note} >
                            <h1>{note.title}</h1>
                            <div className={this.props.classes.tagsWrapper}>{note.tags.map((tag, index) => <Chip
                                label={tag}
                                key={index}
                                classes={{ root: this.props.classes.chip }}
                            />)}</div>
                            {isLoading ? <CircularProgress /> : null}
                            <div dangerouslySetInnerHTML={{ __html: marked(note.content || '', { breaks: true }) }} className="markdown-body">
                            </div>
                        </Paper>
                        : null
                    }
                </Grid>
            </Grid>
            <Dialog open={this.state.restoreDialogOpen} transition={<Slide direction="up" />}>
                <DialogTitle>恢复笔记</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {this.state.restoreDialogText}
                    </DialogContentText>
                    <Select
                        value={this.state.restoreTargetNotebook}
                        onChange={e => this.setState({restoreTargetNotebook: e.target.value})}
                        input={<Input />}
                    >
                        {this.props.notebooks.map(notebook => <MenuItem key={notebook.id} value={notebook.id}>{notebook.name}</MenuItem>)}
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => this.setState({ restoreDialogOpen: false })}>
                        取消
                    </Button>
                    <Button
                        onClick={this.onConfirmRestore}
                        disabled={this.state.restoreTargetNotebook === ''}
                        color="primary"
                    >
                        确定
                    </Button>
                </DialogActions>
            </Dialog>
        </div >
    }
}

export default withStyles(styles)(WasteNote) as React.ComponentClass<{ note: Note, isRestoring: boolean, loadings: string[], notebooks: Notebook[] }>