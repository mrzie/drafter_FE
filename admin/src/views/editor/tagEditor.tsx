import * as React from 'react'
import { ChangeEventHandler, KeyboardEventHandler } from 'react'
import { Grid, Chip, Input } from 'material-ui'
import { withStyles, StyleRulesCallback } from 'material-ui/styles'

const styles: StyleRulesCallback = theme => ({
    tagsWrapper: {
        display: 'flex',
        zoom: 0.7,
        position: 'absolute',
        zIndex: 10,
    },
    tags: {
        display: 'flex',
        overflowX: 'auto',
        '&:hover': {
            flexWrap: 'wrap',
        }
    },
    tagInput: {
        flex: 'none',
        height: '32px',
        lineHeight: '32px',
        border: '0',
        fontSize: 'inherit',
        background: 'none',
        '&:focus': {
            outline: 'none',
        },
    },
    showAllTags: {
        flexWrap: 'wrap',
    },
    chip: {
        margin: '0 1px 1px 0',
    }
})

const trim = (s: string) => s.replace(/(^\s*)|(\s*$)/g, '');

class TagEditor extends React.Component<{
    tags: string[],
    onChange: (newTags: string[]) => void,
    classes: any,
    readonly: boolean,
}, { input: string, showAllTags: boolean }> {
    state = { input: '', showAllTags: false }
    handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (this.props.readonly) { 
            return 
        }
        const tags = this.props.tags
        if (e.keyCode == 13) {
            // 按下回车之后
            e.preventDefault()
            const value = trim(this.state.input)
            // 判断输入值不为空
            if (value == '') {
                return
            }
            // 判断重复tag
            if (tags.indexOf(this.state.input) == -1) {
                this.props.onChange([...tags, value])
                this.setState({ input: '' })
            }
        } else if (e.keyCode == 8 && this.state.input == '' && tags.length) {
            // 输入框空的情况下按回删Backspace
            e.preventDefault()
            this.props.onChange(tags.slice(0, tags.length - 1))
        }
    }
    handleInput: React.ChangeEventHandler<HTMLInputElement> = e => {
        const value = e.target.value
        if (value.indexOf(',') > -1) {
            const
                values = value.split(','),
                tags = this.props.tags

            this.setState({ input: values.pop() })

            const rest = values.filter(item => tags.indexOf(item) == -1)

            if (rest.length) {
                this.props.onChange([...this.props.tags, ...rest.map(trim)])
            }
        } else {
            this.setState({ input: value })
        }
    }
    handleDelete(index: number) {
        if (this.props.readonly) { 
            return 
        }
        return () => {
            const newTags = [... this.props.tags]
            newTags.splice(index, 1)
            this.props.onChange(newTags)
        }
    }
    render() {
        const { classes, tags } = this.props
        return <Grid container>
            <Grid item xs={12} lg={12} classes={{ typeItem: classes.tagsWrapper }}>
                <div className={this.state.showAllTags ? `${classes.tags} ${classes.showAllTags}` : classes.tags}>
                    {
                        tags.map((tag, index) => <Chip
                            label={tag}
                            key={index}
                            classes={{ root: classes.chip }}
                            onRequestDelete={this.handleDelete(index)} />)
                    }
                </div>
                <input
                    className={classes.tagInput}
                    value={this.state.input}
                    onKeyDown={this.handleKeyDown}
                    onInput={this.handleInput}
                    onFocus={() => this.setState({ showAllTags: true })}
                    onBlur={() => this.setState({ showAllTags: false })}
                    placeholder="点击输入标签"
                    disabled={this.props.readonly}
                />
            </Grid>
        </Grid>
    }
}

export default withStyles(styles)(TagEditor) as React.ComponentClass<{ tags: string[], onChange: (newTags: string[]) => void, readonly: boolean }>
