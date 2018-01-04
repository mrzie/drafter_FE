import * as React from 'react'
import { Button } from 'material-ui'

interface ListStepperProps {
    total: number,
    current: number,
    onPageChange: (page: number) => void,
    classes: {
        box: string,
        input: string,
    },
}

interface ListStepperState {
    focus: boolean,
    input: string,
}

const NOOP: () => void = () => null

class Stepper extends React.Component<ListStepperProps, ListStepperState> {
    state = { focus: false, input: '' }
    handleInput: React.ChangeEventHandler<HTMLInputElement> = e => {
        this.setState({ input: e.target.value })
    }
    handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = e => {
        if (e.keyCode == 13) {
            e.preventDefault()
            this.props.onPageChange(+this.state.input)
            this.setState({ focus: false, input: '' })
        }
    }
    showInput = () => this.setState({ focus: true })
    hideInput = () => this.setState({ focus: false })
    onPrev = () => this.props.onPageChange(this.props.current - 1)
    onNext = () => this.props.onPageChange(this.props.current + 1)
    render() {
        const { current, total } = this.props

        return <div className={this.props.classes.box}>
            <Button disabled={current == 1} onClick={this.onPrev}>上一页</Button>

            {
                this.state.focus

                    ? <input
                        min={1}
                        step={1}
                        max={total}
                        ref="input"
                        type="number"
                        onBlur={this.hideInput}
                        onInput={this.handleInput}
                        onKeyDown={this.handleKeyDown}
                        value={this.state.input}
                        className={this.props.classes.input}
                        onChange={NOOP}
                    />
                    : <Button
                        onClick={() => this.setState({ focus: true })}
                    >
                        {current}/{total}
                    </Button>
            }
            <Button disabled={current == total} onClick={this.onNext}>下一页</Button>

        </div>
    }

    componentDidUpdate() {
        if (this.state.focus) {
            (this.refs.input as HTMLInputElement).focus()
        }
    }
}

export default Stepper