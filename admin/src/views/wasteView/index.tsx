import * as React from 'react'
import { Drawer } from 'material-ui'
import * as api from '../../api'
import { withStyles, StyleRulesCallback } from 'material-ui/styles'
import { State, Note, Notebook } from '../../model'
import { connect } from 'react-redux'
import WasteNoteView from './wasteNote'
import NoteList from './noteList'

const mapStateToProps = (state: State) => ({
    notes: (state.notes as Note[]).filter(n => n.hasOwnProperty("id") && n.alive === false),
    isFetching: state.interactions.loadings.indexOf('GETWASTENOTES') > -1,
    loadings: state.interactions.loadings,
    notebooks: state.notebooks,
    syncAt: state.interactions.wasteBasketSyncAt,
})

interface WasteViewProps {
    classes: any,
    theme?: any,
    notes: Note[],
    isFetching: boolean,
    loadings: string[],
    notebooks: Notebook[],
    syncAt: number,
}

interface WasteViewState {
    current: string, // the id of current 
}

const viewStyles: StyleRulesCallback = theme => ({
    flexRow: {
        display: 'flex',
    },
    noteListDocked: {
        width: '20%',
    },
    noteListPaper: {
        width: '100%',
        position: 'relative',
        background: '#f8f8f8',
        zIndex: 'auto',
        willChange: 'auto',
    },
    listHeader: {
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    listBody: {
        height: 'calc(100% - 50px)',
        position: 'relative',
        overflowY: 'auto',
        // willChange: 'auto',
    },
})

class WasteView extends React.Component<WasteViewProps, WasteViewState> {
    state = { current: '' }
    componentWillMount() {
        if (!this.props.syncAt || this.props.syncAt + 1000 * 60 * 15 <= +new Date()) {
            api.getWasteNotes()
        }

    }
    // componentWillReceiptProps(next: WasteViewProps) {

    //     if (this.state.current != '') {
    //         const note = next.notes.find(n => n.id === this.state.current)
    //         if (note && note.content === undefined && next.loadings.indexOf('GETNOTE.' + note.id) === -1) {
    //             api.getNote(note.id)
    //         }
    //     }
    // }
    render() {
        // if (this.state.current != '') {
        //     const note = this.props.notes.find(n => n.id === this.state.current)
        //     if (note && note.content === undefined && this.props.loadings.indexOf('GETNOTE.' + note.id) === -1) {
        //         api.getNote(note.id)
        //     }
        // }
        const
            { classes, notes, isFetching, loadings, notebooks } = this.props,
            { current } = this.state,
            isRestoring = current != '' && loadings.indexOf('RESTOREWASTENOTE.' + current) > -1,
            note = notes.find(n => n.id === current)
            // notebook = note == null ? null : notebooks.find(b => b.id === note.notebookid)

        return <div className={classes.flexRow}>
            <Drawer type="permanent" classes={{
                docked: classes.noteListDocked,
                paper: classes.noteListPaper
            }}>
                <div className={classes.listHeader}>废纸篓</div>
                <NoteList
                    className={classes.listBody}
                    notes={notes}
                    current={this.state.current}
                    isFetching={isFetching}
                    loadings={this.props.loadings}
                    onSelectNote={id => this.setState({ current: id })}
                />
            </Drawer>
            <WasteNoteView
                note={notes.find(n => n.id == current)}
                isRestoring={isRestoring}
                loadings={loadings}
                notebooks={notebooks}
            />
        </div>
    }
}

export default connect(mapStateToProps)(withStyles(viewStyles)(WasteView))
