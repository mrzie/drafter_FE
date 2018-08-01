
import * as React from 'react'
import { Comment, User } from '../models'
import { Cross } from '../svgSymbols'
import { timeFormat } from '../utils'
import { Sina } from '../svgSymbols';
import * as apis from '../apis'
import ToastView from './toast'
interface CommentTextAreaProps {
    blogid: string,
    user: User,
    quoteUser: User,
    quote: Comment,
    onQuoteCancel: () => void,
    rootRef: (el: HTMLDivElement) => void,
}

interface CommentTextAreaState {
    text: string,
    isFocus: boolean,
    readonly: boolean,
}

const handle = (p: Promise<any>) => p.then(
    any => [any, null],
    any => [null, any]
) as Promise<[any, any]>

export class CommentTextArea extends React.Component<CommentTextAreaProps, CommentTextAreaState> {
    state = {
        text: '',
        isFocus: false,
        readonly: false,
    }
    lastCommitAt: number
    toastView: ToastView
    referBox: HTMLDivElement
    referContent: HTMLDivElement
    textarea: HTMLTextAreaElement
    referBoxFunc: (ref: HTMLDivElement) => void = ref => this.referBox = ref
    referContentFunc: (ref: HTMLDivElement) => void = ref => this.referContent = ref
    onFocus = () => this.setState({ isFocus: true })
    onBlur = () => this.setState({ isFocus: false })
    componentDidUpdate() {
        if (this.referBox) {
            if (this.referContent) {
                this.referBox.style.height = `${this.referContent.clientHeight + 10}px`
                this.referBox.style.opacity = '1'
            } else {
                this.referBox.style.height = '0'
                this.referBox.style.opacity = '0'
            }
        }
    }
    commitComment = async () => {
        if (!this.state.text) {
            return
        }
        const now = +new Date(), lastCommitAt = this.lastCommitAt
        this.lastCommitAt = now

        if (now - lastCommitAt < 30000) {
            this.toastView.show('慢点说，不着急')
            return
        }

        this.setState({ readonly: true })
        const [_, err] = await handle(apis.postComment(this.props.blogid, this.state.text, this.props.quote ? this.props.quote.id : undefined))
        this.setState({ readonly: false })

        if (err) {
            if (!err || !err.response || !err.response.data) {
                this.toastView.show('未知错误')
                return
            }
            const code: number = err.response.data.code
            if (code == 109) {
                this.toastView.show('系统繁忙请稍后再试')
            } else if (code == 110) {
                this.toastView.show('系统错误')
            } else {
                this.toastView.show('未知错误')
            }
        } else {
            this.props.onQuoteCancel()
            this.setState({ text: '' })
            this.textarea.style.height = 'auto'
            this.textarea.style.height = `${this.textarea.scrollHeight}px`
        }
    }
    render() {
        const { quote, quoteUser, user, onQuoteCancel } = this.props
        return (
            <div
                className={this.state.isFocus ? "comment-editor comment-editor-focus" : "comment-editor"}
                ref={this.props.rootRef}
            >
                <div className="comment-editor-body">
                    <div className="comment-editor-user">
                        <div className="comment-editor-avatar" style={{ backgroundImage: `url(${this.props.user.avatar})` }}></div>
                        <div className="comment-editor-username">{this.props.user.name}</div>
                    </div>
                    <div className="comment-editor-content-wrapper">
                        <div ref={this.referBoxFunc} className="comment-ref-box">
                            {
                                quote
                                    ? <div className="comment-ref" ref={this.referContentFunc}>
                                        <div className="comment-ref-head">
                                            <div className="comment-head-left">
                                                <div className="comment-author">{quoteUser.name}</div>
                                                <div className="comment-time">{timeFormat(new Date(quote.time), 'y年m月d日')}</div>
                                            </div>
                                            <div className="comment-head-right">
                                                <div className="comment-ref-cancle" onClick={onQuoteCancel}><Cross /></div>
                                            </div>
                                        </div>
                                        {/* <QuoteContent content={quote.content} /> */}
                                        <div className="comment-ref-body">
                                            {quote.content}
                                        </div>
                                    </div>
                                    : null
                            }
                        </div>
                        <textarea
                            className="comment-editor-content"
                            placeholder={`真热啊今天`}
                            onChange={e => {
                                this.setState({ text: e.target.value })
                                e.target.style.height = 'auto'
                                e.target.style.height = `${e.target.scrollHeight}px`
                            }}
                            ref={r => this.textarea = r}
                            value={this.state.text}
                            onFocus={this.onFocus}
                            onBlur={this.onBlur}
                            readOnly={this.state.readonly}
                        />
                    </div>
                </div>
                <div className="comment-submit-button" onClick={this.commitComment}>评论</div>
                <ToastView ref={ref => this.toastView = ref} />
            </div >
        )
    }
}

interface QuoteContentProps {
    content: string,
}

interface QuoteContentState {
    collapsable: boolean,
    collapsed: boolean,
}

export class QuoteContent extends React.Component<QuoteContentProps, QuoteContentState> {
    state = {
        collapsable: false,
        collapsed: true,
    }
    static cut(content: string) {
        // 不超过4段且不超过200字
        return content.slice(0, 200).split('\n').slice(0, 4).join('\n')
    }
    short: string = ''
    componentWillMount() {
        this.updateCollapsable(this.props.content)
    }
    componentWillReceiveProps(next: QuoteContentProps) {
        this.updateCollapsable(next.content)
    }
    updateCollapsable(content: string) {
        this.short = QuoteContent.cut(content)
        this.setState({ collapsed: true, collapsable: content !== this.short })
    }
    toggleCollapsed = () => {
        this.setState({ collapsed: !this.state.collapsed })
    }
    render() {
        const text = this.state.collapsed ? this.short : this.props.content
        return <div className="comment-ref-body">
            {text}
            {
                this.state.collapsable && <span
                    className="comment-ref-collapse"
                    onClick={this.toggleCollapsed}
                >
                    {this.state.collapsed ? '展开' : '收起'}
                </span>
            }
        </div>
    }
}


export const CommentLoginButton = () => <div className="flex-row-container">
    <div className="login-button" onClick={apis.OAuthLogin}>
        <Sina /> 登陆后发表评论
    </div>
    <div className="exclusive-login-button" onClick={apis.OAuthExclusiveLogin} >
        强势登陆
    </div>
</div>