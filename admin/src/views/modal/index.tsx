import * as React from 'react'
import Dialog, {
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from 'material-ui/Dialog'
import Slide from 'material-ui/transitions/Slide'
import { Grid, Card, CardContent, Button, Snackbar } from 'material-ui'
import { connect } from 'react-redux'
import { State, Modal, Warning } from '../../model'
import * as interactions from '../../interactions'

const mapStateToProps = (state: State) => ({
    warnings: state.interactions.warnings,
    modals: state.interactions.modals,
})

interface ModalViewProps {
    warnings: Warning[],
    modals: Modal[],
}

interface ModalViewState {
    ranges: number[],
    showWarning: boolean,
}

const bigger = (a: number, b: number) => a > b ? a : b

const RangeHandler = (() => {
    const
        ranges = [0],
        Listener: ModalView[] = []

    const removeFrom: <T>(arr: T[], item: T) => boolean = (arr, item) => {
        const index = arr.indexOf(item)
        if (index == -1) {
            return false
        }
        arr.splice(index, 1)
        return true
    }

    const addRangeListener = (v: ModalView) => {
        v.setRange(ranges)
        Listener.push(v)
    }

    const removeRangeListener = (v: ModalView) => removeFrom(Listener, v)

    const addRange = (id: number) => {
        ranges.push(id)
        Listener.forEach(v => v.setRange(ranges))
    }

    const removeRange = (id: number) => {
        removeFrom(ranges, id)
        Listener.forEach(v => v.setRange(ranges))
    }

    return { addRangeListener, removeRangeListener, addRange, removeRange }
})()

class ModalView extends React.Component<ModalViewProps, ModalViewState> {
    state = { ranges: [0], showWarning: false }
    timer: number = null

    componentWillMount() {
        RangeHandler.addRangeListener(this)
        this.resetShowWarnig(this.props)
    }

    componentWillUnmount() {
        RangeHandler.removeRangeListener(this)

        clearTimeout(this.timer)
    }

    resetShowWarnig(props: ModalViewProps) {
        if (props.warnings.length && this.timer == null) {
            this.setState({ showWarning: true })
            this.timer = setTimeout(() => {
                this.setState({ showWarning: false })
                this.timer = null
            }, bigger(2000, props.warnings[0].content.length * 70))
        }
    }

    handleWarningClose = () => {
        this.setState({ showWarning: false })
        clearTimeout(this.timer)
        this.timer = null
    }

    componentWillReceiveProps(next: ModalViewProps) {
        this.resetShowWarnig(next)
    }

    setRange(ranges: number[]) {
        if (this.state.ranges.join(' ') === ranges.join(' ')) {
            return
        }
        this.setState({ ranges })
    }

    render() {
        // 找最大最小值还是冒泡好了
        // const modals = this.props.modals.filter(m => m.range == this.props.range),
        //     warningDisplay = (warnings.find(m => m.alive) || { id: undefined }).id

        const
            modals = this.props.modals.filter(m => this.state.ranges.indexOf(m.range) != -1),
            modalDisplay = (modals.find(m => m.alive) || { id: undefined }).id


        return <div>
            {
                modals.map(m => <Dialog
                    key={m.id}
                    open={m.id === modalDisplay}
                    transition={<Slide direction="up" />}
                >
                    {
                        m.title
                            ? <DialogTitle>{m.title}</DialogTitle>
                            : null
                    }
                    <DialogContent>
                        {m.content}
                    </DialogContent>
                    <DialogActions>
                        {m.choices.map((c, i) => <Button
                            key={i}
                            onClick={c.then}
                            disabled={c.disabled}
                        >
                            {c.text}
                        </Button>)}
                    </DialogActions>
                </Dialog>)
            }
            {
                this.props.warnings.map((w, i) => <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    open={this.state.showWarning && i == 0}
                    key={w.id}
                    message={<span>{w.content}</span>}
                    onExited={() => interactions.removeWarning(w.id)}
                    onClick={this.handleWarningClose}
                />)
            }
        </div>
    }
}

export const Modals = connect(mapStateToProps)(ModalView)

interface ModalRangeProps {
    id: number,
    keepModal?: boolean,
}

export class ModalRange extends React.Component<ModalRangeProps> {
    componentWillMount() {
        RangeHandler.addRange(this.props.id)
    }
    componentWillReceiveProps(next: ModalRangeProps) {
        if (this.props.id != next.id) {
            RangeHandler.removeRange(this.props.id)
            RangeHandler.addRange(next.id)
        }
    }
    componentWillUnmount() {
        RangeHandler.removeRange(this.props.id)
        if (!this.props.keepModal) {
            interactions.cleanModalUnderRange(this.props.id)
        }
    }

    render() {
        return <em/>
    }
}

export const getModalRangeId = (() => {
    let a = 1
    return () => a++
})()