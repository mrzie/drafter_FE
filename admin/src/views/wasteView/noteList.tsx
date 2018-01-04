import * as React from 'react'
import { Note } from '../../model'
import { sort, timeFormat } from '../../utils'
import { CircularProgress, Card, CardContent, LinearProgress } from 'material-ui'
import { withStyles, StyleRulesCallback } from 'material-ui/styles'
import { notelistStyles } from '../../utils/styles'
import { InsertDriveFile } from 'material-ui-icons'

const styles: StyleRulesCallback = theme => ({
    ...notelistStyles,
})

interface NotelistProps {
    notes: Note[],
    current: string,
    className: string,
    isFetching: boolean,
    onSelectNote: (id: string) => void,
    loadings: string[],
    // classes: any,
}

type notelistProps = NotelistProps & { classes: any }

const Notelist = (props: notelistProps) => {
    const
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
            } = props.classes
    return <div className={props.className}>
        {
            props.isFetching
                ? <LinearProgress classes={{
                    root: topProgress,
                    primaryColor: itemProgressColor,
                    primaryColorBar: itemProgressBar,
                }} />
                : null
        }
        {
            props.notes.length
                ? props.notes.sort(sort.editDESC).map(note => {
                    const
                        rootClass = [listItem],
                        { id, title, editAt, abstract, content, } = note

                    if (note.id === props.current) {
                        rootClass.push(itemSelected)
                    }

                    return <Card classes={{ root: rootClass.join(' ') }} key={note.id} onClick={() => props.onSelectNote(note.id)}>
                        {
                            props.loadings.indexOf('RESTOREWASTENOTE.' + note.id) > -1
                                ? <LinearProgress classes={{
                                    root: itemProgress,
                                    primaryColor: itemProgressColor,
                                    primaryColorBar: itemProgressBar,
                                }} />
                                : null
                        }

                        <CardContent classes={{ root: itemContent }}>
                            <div className={itemTitle}>{title}</div>
                            <div className={itemAbstract}>
                                <div className={itemTime}>{timeFormat(new Date(editAt), 'yyyy-mm-dd hh:MM:ss')}</div>
                                {content || abstract}
                            </div>
                        </CardContent>
                    </Card>
                })
                : <InsertDriveFile className={props.classes.emptyIcon} />
        }
    </div>
}

export default withStyles(styles)(Notelist) as React.ComponentClass<NotelistProps>