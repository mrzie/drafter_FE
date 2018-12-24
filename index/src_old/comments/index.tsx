import * as React from 'react';
import { CommentTextArea, CommentLoginButton } from './TextArea';
// import CommentLoginButton from './LoginButton';
import { connect, MapStateToProps } from 'react-redux';
import * as apis from '../apis';
import { User, Comment, State } from '../models'
import CommentList from './CommentList'

interface CommentsViewPropsWithContext {
    id: string,
    comments: Comment[],
    isLoading: boolean,
    user: User,
    users: User[],
}

interface CommentsViewProps {
    id: string,
}

interface CommentViewState {
    quote: string,

}

class CommentsView extends React.Component<CommentsViewPropsWithContext, CommentViewState> {
    state: CommentViewState = {
        quote: null,
    }
    main: HTMLDivElement
    mainRef = (ref: HTMLDivElement) => this.main = ref
    fetchCommentsIfNeed = () => {
        if (this.props.isLoading || this.props.comments !== undefined) {
            return;
        }
        if (!this.main) {
            return;
        }
        if (window.pageYOffset + window.innerHeight > this.main.offsetTop) {
            apis.fetchComments(this.props.id);
        }
    }
    scrollEventHandler: EventListener = e => {
        this.fetchCommentsIfNeed()
    }
    textArea: HTMLDivElement
    textAreaRef = (ref: HTMLDivElement) => this.textArea = ref
    onQuoteComment: React.MouseEventHandler<HTMLDivElement> = e => {
        this.setState({ quote: e.currentTarget.getAttribute('data-id') })
        requestAnimationFrame(() => {
            if (this.textArea) {
                window.scrollTo({ top: this.textArea.offsetTop, behavior: 'smooth' })
            }
        })
    }
    onQuoteCancel = () => this.setState({ quote: null })
    componentDidMount() {
        document.addEventListener('scroll', this.scrollEventHandler)
        this.fetchCommentsIfNeed()
    }

    componentWillUnmount() {
        document.removeEventListener('scroll', this.scrollEventHandler)
    }

    render() {
        const
            { comments = [], isLoading, user, users } = this.props,
            quote = this.state.quote && this.props.comments
                ? comments.find(c => c.id === this.state.quote)
                : null,
            quoteUser = quote ? users.find(u => u.id == quote.user) : null


        return <div ref={this.mainRef}>
            <div className="comments-title">留言（{comments.length}）</div>
            {isLoading && <div className="load-more">loading....</div>}
            <CommentList isLoading={isLoading} comments={this.props.comments} user={user} users={users} onQuoteComment={this.onQuoteComment} />
            {
                user
                    ? <CommentTextArea
                        blogid={this.props.id}
                        user={user}
                        quote={quote}
                        quoteUser={quoteUser}
                        rootRef={this.textAreaRef}
                        onQuoteCancel={this.onQuoteCancel}
                    />
                    : <CommentLoginButton />
            }
        </div>

    }
}

const mapStateToProps: MapStateToProps<CommentsViewPropsWithContext, CommentsViewProps, State> = (state, ownProps) => {
    const { id } = ownProps
    return {
        id,
        comments: state.comments.get(id),
        user: state.user,
        users: state.users,
        isLoading: state.loadStack.indexOf(`comments.${id}`) > -1,
    }
}

export default connect(mapStateToProps)(CommentsView)