import * as React from 'react'
import { Drawer, Chip, IconButton, Tooltip } from 'material-ui'
import { Delete, Save, Restore } from 'material-ui-icons'
import CodeMirror from '../codemirror.config'
import { withStyles, StyleRulesCallback } from 'material-ui/styles'
import { connect } from 'react-redux'
import { State, Tag } from '../../model'
import * as api from '../../api'
import * as interactions from '../../interactions'
import { getModalRangeId, ModalRange } from '../modal'

const mapStateToProps = (state: State, ownProps: { classes: any }) => {
    const { interactions } = state
    return {
        tags: state.tags,
        syncAt: interactions.tagsSyncAt,
        isLoading: interactions.loadings.indexOf('GETTAGS') > -1,
        loadings: interactions.loadings,
    }
}

const styles: StyleRulesCallback = theme => ({
    container: {
        overflow: 'hidden',
        display: 'flex',
        height: '100%',
    },
    tagEditDocker: {
        width: '100%',
        flex: '1 1 auto',
    },
    tagEditPaper: {
        width: '100%',
        position: 'relative',
        background: '#f8f8f8',
    },
    tagListContainer: {
        height: '100vh',
        width: '100%',
        // overflowY: 'auto',
    },
    header: {
        height: '50px',
        flex: 'none',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '.9rem',
    },
    tagList: {
        boxSizing: 'border-box',
        height: 'calc(100% - 50px)',
        overflowY: 'auto',
        padding: '10px 20px',
        '&:after': {
            content: '"编辑标签描述，在博客展示你定义的关键词"',
            display: 'block',
            fontSize: '.85em',
            padding: '70px 20px 30px',
            textAlign: 'center',
            color: '#999',
        },
    },

    sortTitle: {
        margin: '20px 0 10px',
    },
    tagItem: {
        // display: 'inline-block',
        margin: '5px',
    },
    tagItemSelected: {
        margin: '5px',
        background: '#0aa69e91',
        color: '#eee',
        '&:active': {
            background: '#0aa69e91',
        },
        '&:hover': {
            background: '#0aa69e91',
        },
        '&:focus': {
            background: '#0aa69e91',
        },
    },
    tagsRow: {
        display: 'flex',
    },
    editor: {
        '& .CodeMirror': {
            height: 'calc(100vh - 100px)',
        },
    },
    editorWrapper: {
        padding: '35px 10px 15px',
        boxSizing: 'border-box',
        height: 'calc(100% - 50px)',
    },
    tagName: {
        fontSize: '1.2em',
        lineHeight: '50px',
        padding: '0 20px',
        textOverflow: '',
        '&:empty:before': {
            content: '"选择标签以编辑描述"',
            color: '#999',
        }
    },
    buttons: {
        flex: 'none',
    },
})

interface TagsViewProps {
    classes: any,
    syncAt: number,
    isLoading: boolean,
    loadings: string[],
    tags: Tag[],
}

interface TagsViewState {
    current: Tag,
    editorText: string,
}

const symbolPattern = /[\u0000-\u00bf\u2000-\u2bff\u3000-\u303F\u4DC0-\u4dff\uFE10-\uFFFF]/

class TagsView extends React.Component<TagsViewProps, TagsViewState> {
    state: TagsViewState = {
        current: null,
        editorText: '',
    }

    modalRangeId: number = getModalRangeId()

    componentWillMount() {
        if (!this.props.syncAt || this.props.syncAt + 1000 * 60 * 15 <= +new Date() && !this.props.isLoading) {
            api.getTags()
        }
    }

    componentWillReceiveProps(next: TagsViewProps) {
        if (this.state.current) {
            const match = next.tags.find(t => t.name == this.state.current.name)
            if (!match) {
                // 当前选中的tag被删掉了诶。。
                this.setState({
                    current: null,
                    editorText: '',
                })
            }
        }
    }

    handleChipClick: React.MouseEventHandler<HTMLDivElement> = e => {
        this.cacheNoteIfNeed()

        const
            name = e.currentTarget.getAttribute('data-name'),
            match = this.props.tags.find(t => t.name == name)

        if (match) {
            this.setState({
                current: match,
                editorText: match.cache == undefined ? match.description : match.cache
            })
        } else {
            this.setState({
                current: null,
                editorText: ''
            })
        }
    }

    isBusy() {
        const
            { current } = this.state,
            { loadings } = this.props
        if (!current) {
            return false
        }
        return !!['DELETETAG.', 'EDITTAG.'].find(pre => loadings.indexOf(pre + current.name) > -1)
    }

    handleDeleteClick = () => {
        if (this.isBusy()) {
            return
        }
        const { current } = this.state
        if (current) {
            interactions.modal(`确定要删除标签 ${current.name} 吗？（此操作将无法撤销）`, [
                {
                    text: '取消',
                    then: () => true,
                },
                {
                    text: '确定',
                    then: () => {
                        api.deleteTag(current.name)
                        return true
                    }
                }
            ], this.modalRangeId, '删除标签')
        }
    }

    handleSaveClick = () => {
        if (this.isBusy()) {
            return
        }
        const { current, editorText } = this.state
        if (current && editorText != current.description) {
            api.editTag(current.name, editorText)
        }
    }

    handleRestoreClick = () => {
        if (this.isBusy()) {
            return
        }
        const { current } = this.state
        if (current) {
            this.setState({ editorText: current.description })
            interactions.cacheTagDescription(current.name, undefined)
        }
    }

    cacheNoteIfNeed() {
        const { current, editorText } = this.state

        if (!current) return

        if (current.cache == undefined) {
            if (current.description != editorText) {
                // 第一次改
                interactions.cacheTagDescription(current.name, editorText)
            }
        } else if (current.cache != undefined) {
            if (current.description == editorText) {
                // 又改回来了。。
                interactions.cacheTagDescription(current.name, undefined)
            } else if (current.cache != editorText) {
                // 又改了别的
                interactions.cacheTagDescription(current.name, editorText)
            }
        }
    }

    handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = e => {
        if (e.keyCode == 83 && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            this.handleSaveClick()
        }
    }

    renderList() {
        if (this.props.tags) {
            /**
             * 来来来，先讲一下分类的规则
             * 根据首字符分类
             * 其中，数字开头放在一起
             * 并且和字符放在一起 # 开头
             */
            const sorted: Map<string, Tag[]> = this.props.tags.reduce((state, t) => {
                const head = t.name[0].toUpperCase(),
                    sortedBy = !/[A-Z]/.test(head) && symbolPattern.test(head) ? '#' : head
                let arr: Tag[]
                if (arr = state.get(sortedBy)) {
                    arr.push(t)
                } else {
                    state.set(sortedBy, [t])
                }
                return state
            }, new Map<string, Tag[]>())

            const chars = [...sorted.entries()].sort((a, b) => a[0] > b[0] ? 1 : -1)

            return chars.map(([key, tags]) => <div key={key}>
                <div className={this.props.classes.sortTitle}>{key}</div>
                <div className={this.props.classes.tagsRow}>
                    {tags.map(t => <Chip
                        label={t.name + (t.cache == undefined ? '' : '*')}
                        key={t.name}
                        data-name={t.name}
                        onClick={this.handleChipClick}
                        classes={{
                            root: this.state.current && (t.name == this.state.current.name)
                                ? this.props.classes.tagItemSelected
                                : this.props.classes.tagItem
                        }}
                    />)}
                </div>
            </div>)
        } else {
            return <div>loading...</div>
        }
    }

    render() {
        const
            { classes } = this.props,
            { current, editorText } = this.state,
            isBusy = this.isBusy()
        // current = this.props.tags.find(t => t.name == this.state.current)
        return <div className={classes.container} onKeyDown={this.handleKeyDown}>
            <div className={classes.tagListContainer}>
                <header className={classes.header}>

                </header>
                <div className={classes.tagList}>
                    {this.renderList()}
                </div>
            </div>
            <Drawer type="permanent" classes={{
                docked: classes.tagEditDocker,
                paper: classes.tagEditPaper,
            }}>
                <header className={classes.header}>
                    <div className={classes.tagName}>{current ? this.state.current.name : null}</div>
                    <div className={classes.buttons}>
                        <Tooltip label="Restore" title="重置修改" placement="bottom">
                            <IconButton
                                disabled={!current || isBusy}
                                onClick={this.handleRestoreClick}
                            >
                                <Restore />
                            </IconButton>
                        </Tooltip>
                        <Tooltip label="Save" title="保存" placement="bottom" >
                            <IconButton
                                disabled={!current || isBusy}
                                onClick={this.handleSaveClick}
                            >
                                <Save />
                            </IconButton>
                        </Tooltip>
                        <Tooltip label="Delete" title="删除" placement="bottom">
                            <IconButton
                                disabled={!current || isBusy}
                                onClick={this.handleDeleteClick}
                            >
                                <Delete />
                            </IconButton>
                        </Tooltip>

                    </div>
                </header>
                <div className={classes.editorWrapper}>
                    <CodeMirror
                        className={classes.editor}
                        value={editorText}
                        onBeforeChange={(editor, metadata, change) => this.setState({ editorText: change })}
                        onChange={() => null}
                        // onScroll={(editor, data) => this.syncScroll(data)}
                        options={{
                            lineNumbers: false,
                            mode: 'markdown',
                            readOnly: this.state.current == null ? 'nocursor' : false,
                            lineWrapping: true,
                            theme: "solarized light",
                            autoCloseBrackets: true,
                            matchBrackets: true,
                            keyMap: 'sublime',
                            styleActiveLine: true,
                            extraKeys: { Enter: "newlineAndIndentContinueMarkdownList" },
                            foldGutter: true,
                            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                            // }}
                        } as CodeMirror.EditorConfiguration}
                    />
                </div>
                <ModalRange id={this.modalRangeId} />
            </Drawer>
        </div>
    }

    componentWillUnmount() {
        this.cacheNoteIfNeed()
    }
}

export default withStyles(styles)(connect(mapStateToProps)(TagsView))