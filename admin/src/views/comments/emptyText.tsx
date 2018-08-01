import * as React from 'react'
import { withStyles, StyleRulesCallback } from 'material-ui/styles'

const emptyText = ({ classes }: { classes: any }) => <div className={classes.emptyText} >暂无相关评论</div>

const styles: StyleRulesCallback = theme => ({
    emptyText: {
        padding: '30px',
        color: '#999',
        fontSize: '.8em',
        textAlign: 'center',
    },
})

export default withStyles(styles)(emptyText)