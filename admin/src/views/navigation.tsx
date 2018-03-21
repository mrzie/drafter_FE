import * as React from 'react'
import List, { ListItem, ListItemIcon } from 'material-ui/List'
import { withStyles, StyleRulesCallback } from 'material-ui/styles'
import Collapse from 'material-ui/transitions/Collapse'
import { connect } from 'react-redux'
import { State, Notebook } from '../model'
import { Link } from 'react-router-dom'
import { Description, LibraryBooks, Delete, Tune, LocalOffer, Web } from 'material-ui-icons'
// import { Tooltip } from 'material-ui'

const styles: StyleRulesCallback = theme => ({
    list: {
        // background: blueGrey[800], 
        // background: '#37474F',
        // color: 'white',
        width: '100%'
    },
    item: {
        '&:hover': {
            background: 'rgba(255, 255, 255, 0.12)'
        },
        color: 'white',
        position: 'relative',
        zIndex: 1500,
        '&:hover:after': {
            content: 'attr(data-label)',
            display: 'block',
            position: 'absolute',
            color: '#fff',
            background: 'rgba(0, 0, 0, 0.56)',
            borderRadius: '2px',
            left: '100%',
            fontSize: '.8em',
            padding: '3px',
            marginLeft: '10px',
            whiteSpace: 'nowrap',
        },
    },
    notebookItem: {
        '&:hover': {
            background: 'rgba(255, 255, 255, 0.12)',
        },
        paddingLeft: '24px',
        fontSize: '.9em',
        color: 'rgba(255, 255, 255, .8)',
    },
    link: {
        textDecoration: 'none',
    },
    popper: {
        // zIndex: 'auto',
        whiteSpace: 'nowrap',
    },
    // popperClose: {
    //     display: 'none',
    // },
})

const mapStateToProps = (state: State) => ({
    notebooks: state.notebooks
})

class SideBar extends React.Component<{ classes: any, notebooks: Notebook[] }, {}> {
    state = {
        showNotebooks: false
    }
    render() {
        const { classes, notebooks } = this.props

        return <List className={classes.list}>
            {/* <Tooltip classes={{ popper: classes.popper }} title="笔记" placement="bottom"  label="notes"> */}
            <Link to="/admin/notebook/" className={classes.link}>
                <ListItem button className={classes.item} data-label="笔记">
                    <Description />
                </ListItem>
            </Link>
            {/* </Tooltip> */}
            {/* <Tooltip classes={{ popper: classes.popper }} title="笔记本" placement="bottom" label="books"> */}
            <Link to="/admin/notebooks" className={classes.link}>
                <ListItem button className={classes.item} data-label="笔记本">
                    <LibraryBooks />
                </ListItem>
            </Link>
            {/* </Tooltip> */}
            {/* <Tooltip classes={{ popper: classes.popper }} title="博客" placement="bottom" label="blogs"> */}
            <Link to="/admin/blogs" className={classes.link}>
                <ListItem button className={classes.item} data-label="博客">
                    <Web />
                </ListItem>
                {/* <ListItem button className={classes.item}>博客</ListItem> */}
            </Link>
            {/* </Tooltip> */}
            {/* <Tooltip classes={{ popper: classes.popper }} title="标签" placement="bottom" label="tags"> */}
            <Link to="/admin/tags" className={classes.link}>
                <ListItem button className={classes.item} data-label="标签">
                    <LocalOffer />
                </ListItem>
                {/* <ListItem button className={classes.item}>标签</ListItem> */}
            </Link>
            {/* </Tooltip> */}
            {/* <Tooltip classes={{ popper: classes.popper }} title="喜好" placement="bottom" label="preference"> */}
            <Link to="/admin/preference" className={classes.link}>
                <ListItem button className={classes.item} data-label="喜好">
                    <Tune />
                </ListItem>
                {/* <ListItem button className={classes.item}>喜好</ListItem> */}
            </Link>
            {/* </Tooltip> */}
            {/* <Tooltip classes={{ popper: classes.popper }} title="废纸篓" placement="bottom" label="waste"> */}
            <Link to="/admin/waste" className={classes.link}>
                <ListItem button className={classes.item} data-label="废纸篓">
                    <Delete />
                </ListItem>
            </Link>
            {/* </Tooltip> */}
        </List>
    }
}

export default withStyles(styles)(connect(mapStateToProps)(SideBar))
