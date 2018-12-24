import * as React from 'react'

interface ToastViewState {
    toasts: Toast[],
}

interface Toast {
    content: string,
    uniq: number,
}

export default class ToastView extends React.Component<null, ToastViewState> {
    uniq = 0
    state: ToastViewState = {
        toasts: [],
    }
    show(content: string) {
        this.setState({ toasts: [...this.state.toasts, { content, uniq: this.uniq++ }] })
    }
    onAnimationEnd = () => {
        if (this.state && this.state.toasts) {
            this.setState({ toasts: this.state.toasts.slice(1) })
        }
    }
    render() {
        return <div className="toast-view-container">
            {this.state.toasts.map(t => (
                <div className="toast-box" key={t.uniq} onAnimationEnd={this.onAnimationEnd}>
                    {t.content}
                </div>
            ))}
        </div>
    }
}