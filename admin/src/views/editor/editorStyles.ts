import { withStyles, StyleRulesCallback } from 'material-ui/styles'


const styles: StyleRulesCallback = theme => ({
    container: {
        position: 'relative',
        // left: '28%',
        // right: '0',
        // top: '0',
        // bottom: '0',
        // transiiton: 'transform .3s ease-in-out',
        padding: '0 10px',
        width: '80%',
        height: '100vh',
        boxSizing: 'border-box',
    },
    editor: {
        '& .CodeMirror': {
            height: 'calc(100vh - 85px)',
        }
    },
    editorContainer: {
        marginTop: '35px',
    },
    previewer: {
        padding: '10px',
        overflow: 'scroll',
        boxSizing: 'border-box',
        height: 'calc(100vh - 85px)',
    },
    grid: {

    },
    header: {
        height: '50px',
        display: 'flex',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: '1.4em',
        width: '100%',
        // font: 'inherit',
        border: '0',
        background: 'none',
        '&:focus': {
            outline: 'none',
        }
    },
    buttons: {
        flex: 'none',
        display: 'flex',
        alignItems: 'flex-end',
    },
    button: {

    },
})

export default withStyles(styles)