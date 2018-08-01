import * as React from 'react'
import { Grid } from 'material-ui'
import { withStyles, StyleRulesCallback } from 'material-ui/styles'
import { connect } from 'react-redux'
import { State, Blog, Note } from '../../model'
import * as api from '../../api'
import { match as Match } from 'react-router-dom'
import BlogsList from './blogsList'
import { History } from 'history'
import Dialog, {
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from 'material-ui/Dialog'

const mapStateToProps = (state: State) => {
    const currentNoteId = state.interactions.currentNote,
        notebooks = state.notebooks,
        notebookSuggess = notebooks.length
            ? currentNoteId
                ? notebooks.find(n => n.id === currentNoteId) || notebooks[0]
                : notebooks[0]
            : null

    return {
        blogs: state.blogs,
        syncAt: state.interactions.blogsSyncAt,
        loadings: state.interactions.loadings,
        notes: state.notes,
        notebookSuggessed: notebookSuggess && notebookSuggess.id,
    }
}

const styles: StyleRulesCallback = theme => ({
    container: {
        width: '100%',
        maxHeight: '100vh',
        overflowX: 'hidden',
        overflowY: 'auto',
    },
    header: {
        height: '50px',
    },
})

interface BlogsViewProps {
    blogs: Blog[],
    classes: any,
    syncAt: number,
    match: Match<{ pid: string }>,
    history: History,
    loadings: string[],
    notes: Note[],
    notebookSuggessed: string,
}

class BlogsView extends React.Component<BlogsViewProps, null> {

    componentWillMount() {
        api.getBlogsIfNeed()

    }

    render() {
        const { classes, match, loadings } = this.props

        return <div className={classes.container}>
            <div className={classes.header}></div>
            <Grid container justify="center">
                <Grid item xs={10} xl={6} md={6}>
                    <BlogsList
                        blogs={this.props.blogs}
                        loadings={this.props.loadings}
                        filter={(a: any) => a}
                        history={this.props.history}
                    />
                </Grid>
            </Grid>

        </div >
    }
}

export default withStyles(styles)(connect(mapStateToProps)(BlogsView))