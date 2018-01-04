import List, { ListItem } from 'material-ui/List'
import Menu, { MenuItem } from 'material-ui/Menu'
import { Divider, Button} from 'material-ui'
import * as React from 'react'
import { withStyles, StyleRulesCallback } from 'material-ui/styles';
import { Notebook } from '../../model'
import { withRouter, match as Match } from 'react-router-dom'
import { History, Location } from 'history'
import { State } from '../../model'
import { connect } from 'react-redux'

const mapStateToProps = (state: State) => ({
    notebooks: state.notebooks
})

const styles: StyleRulesCallback = theme => ({
    root: {
        textTransform: 'none'
    },
    empty: {
        '&:empty:before': {
            content: '"(无标题)"',
            fontSize: '.9em',
            color: '#666'
        }
    },
})

export class BookSelector extends React.Component<
    { notebooks: Notebook[], history?: History, match?: Match<{ nbid: string }>, classes: any },
    { open: boolean, anchorEl: HTMLElement }
    > {
    state = {
        anchorEl: null as HTMLElement,
        open: false,
    }

    handleClickListItem = (event: any) => this.setState({
        open: true,
        anchorEl: event.currentTarget as HTMLElement
    })

    onRequestClose = () => this.setState({ open: false })

    handleChoseBook(index: string) {
        if (this.props.match.params.nbid != index) {
            this.props.history.push(`/admin/notebook/${index}`)
        }
        this.setState({ open: false })
    }

    render() {
        const { notebooks, match, classes } = this.props;
        return <div>
            <Button onClick={this.handleClickListItem} classes={{ root: classes.root, label: classes.empty }}>{notebooks.find(book => book.id == match.params.nbid).name}</Button>
            <Menu
                id="book-selector"
                anchorEl={this.state.anchorEl}
                open={this.state.open}
                onRequestClose={this.onRequestClose}
            >
                {notebooks.map(book => <MenuItem
                    key={book.id}
                    selected={book.id == match.params.nbid}
                    onClick={() => this.handleChoseBook(book.id)}
                >
                    {book.name}
                </MenuItem>)}
            </Menu>
        </div>
    }
}

export default withStyles(styles)(withRouter(connect(mapStateToProps)(BookSelector)))