import * as React from 'react'
import { Drawer, IconButton } from 'material-ui'
import { withStyles, StyleRulesCallback } from 'material-ui/styles'
import { connect, Dispatch } from 'react-redux'
import { State, Notebook } from '../../model'
import NoteList from './noteList'
import Editor from '../editor'
import Menu, { MenuItem } from 'material-ui/menu'
import BookSelector from './bookSelector'
import { Redirect, match as Match } from 'react-router-dom'
import { CircularProgress } from 'material-ui/Progress'
import * as interactions from '../../interactions'
import * as api from '../../api'
import { Add as AddIcon } from 'material-ui-icons'

const viewStyles: StyleRulesCallback = theme => ({
    flexRow: {
        display: 'flex',
    },
    noteListDocked: {
        width: '20%',
    },
    noteListPaper: {
        // width: '18%',
        width: '100%',
        position: 'relative',
        // left: '10%',
        background: '#f8f8f8',

        zIndex: 'auto',
        willChange: 'auto',
        // padding: '5px',
    },
    notelistHolder: {
        width: '18%',
        height: '100%',
        left: '10%',
        background: '#f8f8f8',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listHeader: {
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 5px',
    },
    listBody: {
        height: 'calc(100% - 50px)',
        position: 'relative',
        overflowY: 'auto',
        // willChange: 'auto',
    }
})

const mapStateToProps = (state: State) => ({
    notebooks: state.notebooks,
    isLoadingBooks: state.interactions.loadings.indexOf('GETNOTEBOOKS') > -1,
    currentNotebook: state.interactions.currentNotebook
})

interface noteViewProps {
    classes: any,
    match: Match<{ nbid: string }>,
    notebooks: Notebook[],
    isLoadingBooks: boolean,
    currentNotebook: string,
    history: History
}

interface noteViewState {
    open: boolean
}

class NoteView extends React.Component<noteViewProps, noteViewState>{
    state = { open: false }
    redirect = false
    handleClose() {
        this.setState({ open: false })
    }

    componentWillUnmount() {
        const { match, notebooks, currentNotebook, isLoadingBooks } = this.props

        if (match.path != '/admin/notebook/'
            && notebooks.find(notebook => notebook.id == match.params.nbid)
            && match.params.nbid != currentNotebook) {
            // 合法操作切换笔记本时，记录currentNotebook
            interactions.setCurrentNotebook(match.params.nbid)
        }

        if (notebooks.length == 0 && !isLoadingBooks) {
            interactions.warn("需要先创建笔记本")
        }
    }

    render() {
        const
            { classes, match, notebooks, isLoadingBooks, currentNotebook } = this.props,
            exact = match.path != '/admin/notebook/'

        if (exact && notebooks.find(notebook => notebook.id == match.params.nbid)) {

            return <div className={classes.flexRow}>
                <Drawer type="permanent" classes={{
                    docked: classes.noteListDocked,
                    paper: classes.noteListPaper
                }}>
                    <div className={classes.listHeader}>
                        <BookSelector />
                        <div>
                            <IconButton onClick={() => api.newNote(match.params.nbid)}>
                                <AddIcon />
                            </IconButton>
                        </div>
                    </div>
                    <NoteList
                        className={classes.listBody}
                        nbid={match.params.nbid}
                        isLoadingBooks={isLoadingBooks}
                    />

                </Drawer>
                <Editor />
            </div>
        } else if (isLoadingBooks) {
            /**
             * 1. 点击了边栏“笔记”需要跳转，但内容正在加载
             * 2. 跳转的笔记本当前不存在，需做进一步判断，展示加载交互
             */
            return <div className={classes.flexRow}>
                <Drawer type="permanent" classes={{
                    docked: classes.noteListDocked,
                    paper: classes.notelistHolder
                }}>
                    <CircularProgress />
                </Drawer>
                <Editor />
            </div>
        } else {
            // if (exact) {
            //     interactions.warn(`笔记本未找到：${match.params.nbid}`)
            // }
            if (notebooks.length == 0) {
                return <Redirect to="/admin/notebooks" />
            } else if (!exact) {
                // 点击侧边栏“笔记”到达
                return <Redirect to={`/admin/notebook/${currentNotebook || notebooks[0].id}`} />
            } else {
                return <Redirect to={`/admin/notebook/${notebooks[0].id}`} />
            }
        }
    }

    componentWillReceiveProps(props: noteViewProps) {
        const { match, notebooks } = props
        if (match.path != '/admin/notebook/' && !notebooks.find(notebook => notebook.id == match.params.nbid)) {
            interactions.warn(`笔记本未找到：${match.params.nbid}`)
        }
    }
}

export default connect(mapStateToProps)(withStyles(viewStyles)(NoteView))