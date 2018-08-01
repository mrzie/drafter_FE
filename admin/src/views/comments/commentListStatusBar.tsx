import * as React from 'react'
import { Refresh } from 'material-ui-icons'
import { IconButton } from 'material-ui'
import { withStyles, StyleRulesCallback } from 'material-ui/styles'
import { timeFormat } from '../../utils'

interface CommentListStatusBarOuterProps {
    onRefresh: () => Promise<boolean>,
    uniq: string,
    isLoading: boolean,
}

interface StylesProps {
    classes: any,
}

type CommentListStatusBarProps = CommentListStatusBarOuterProps & StylesProps

interface CommentListStatusBarState {
    updateAt: string,
}

class CommentListStatusBar extends React.Component<CommentListStatusBarProps, CommentListStatusBarState> {
    state = {
        updateAt: '',
    }

    componentWillReceiveProps(nextProps: CommentListStatusBarProps) {
        if (nextProps.uniq != this.props.uniq) {
            this.setState({ updateAt: '' })
        }
    }

    onClickRefresh = async () => {
        await this.props.onRefresh()
        this.setState({ updateAt: timeFormat(new Date(), 'hh:MM:ss') })
    }
    renderText() {
        const
            { classes, isLoading } = this.props,
            { updateAt } = this.state


        return isLoading
            ? <div className={classes.timerText}>加载中......</div>
            : updateAt && <div className={classes.timerText}>更新于 {updateAt}</div>

    }

    renderButton() {
        return <IconButton onClick={this.onClickRefresh}>
            <Refresh />
        </IconButton>
    }
    render() {
        const
            { classes, isLoading } = this.props,
            { updateAt } = this.state

        return <div className={classes.flexRow}>
            {this.renderButton()}
            {this.renderText()}
        </div>
    }
}


const styles: StyleRulesCallback = theme => {
    return {
        flexRow: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
        },
        buttons: {
            flex: 'none',
        },
        timerText: {
            padding: '10px',
            color: '#999',
            fontSize: '.85em',
        },
    }
}

export default withStyles(styles)(CommentListStatusBar) as React.ComponentClass<CommentListStatusBarOuterProps>
