
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
    referBoxFunc: (ref: HTMLDivElement) => void = ref => this.referBox = ref
    referContentFunc: (ref: HTMLDivElement) => void = ref => this.referContent = ref
    onFocus = () => this.setState({ isFocus: true })
    onBlur = () => this.setState({ isFocus: false })
    componentDidUpdate() {
        if (this.referBox) {
            if (this.referContent) {
                this.referBox.style.height = `${this.referContent.clientHeight}px`
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
                                        <div className="comment-ref-body">
                                            {quote.content}
                                        </div>
                                    </div>
                                    : null
                            }
                        </div>
                        <textarea
                            className="comment-editor-content"
                            placeholder={`欲言又止 => 畅所欲言`}
                            onChange={e => {
                                this.setState({ text: e.target.value })
                                e.target.style.height = 'auto'
                                e.target.style.height = `${e.target.scrollHeight}px`
                            }}
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


export const CommentLoginButton = () => <div className="flex-row-container">
    <div className="login-button" onClick={apis.OAuthLogin}>
        <Sina /> 登陆后发表评论
    </div>
</div>