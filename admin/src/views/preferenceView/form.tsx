import * as React from 'react'
import { Card, CardContent, CardActions, Grid, TextField, Button, CircularProgress } from 'material-ui'

interface Field<V> {
    /** if true, display as password */
    name: string,
    initValue: V,
    holder?: string,
    isPassword?: boolean,
    filter?: (next: string, prev: string) => string,
}

export type Fields<S> = {
    [k in keyof S]: Field<S[k]>
}

interface FormProps<S> {
    fields: Fields<S>,
    actions: {
        [key: string]: {
            processing?: boolean,
            valid?: (state: S) => boolean,
            onClick: (state: S) => void,
        },
    },
    onchange?: (value: { [key: string]: any }) => void,
    classes: { cardActions: string, form: string }
}

// type FieldItem<V> = (Field<V[keyof V]> & { key: string })

const itself: <T>(a: T) => T = a => a

export default class Form<V extends { [key: string]: string }> extends React.Component<FormProps<V>, V> {
    state = {} as V

    // fields: FieldItem<V>[] = []
    keys = [] as (keyof V)[]

    componentWillMount() {
        const value = {} as V
        this.keys = (Object.keys(this.props.fields) as (keyof V)[])
        this.keys.forEach(k => {
            this.handlers[k] = e => {
                const
                    filter = this.props.fields[k].filter || itself,
                    value = (e.target as HTMLInputElement).value
                if (filter(value, this.state[k]) != this.state[k]) {
                    this.setState({ [k]: value })
                }
            }
            value[k] = this.props.fields[k].initValue
        })

        Object.keys(this.props.actions).forEach(k => {
            this.clickHandlers[k] = () => this.props.actions[k].onClick(this.state)
        })

        this.setState(value)
    }

    handlers = {} as {[k in keyof V]: React.FormEventHandler<HTMLDivElement> }
    clickHandlers = {} as { [key: string]: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> }

    render() {

        const { fields, actions } = this.props
        return <Card classes={{ root: this.props.classes.form }}>
            <CardContent>
                {this.keys.map(k => <Grid container justify="space-around" key={k}>
                    <Grid item xs={3} md={3} container align="center">{fields[k].name}</Grid>
                    <Grid item xs={5} md={5}>
                        <TextField
                            placeholder={fields[k].holder}
                            value={this.state[k]}
                            type={fields[k].isPassword ? 'password' : 'text'}
                            onChange={this.handlers[k]}
                            fullWidth
                            margin="normal"
                        />
                    </Grid>
                </Grid>)}
            </CardContent>
            <CardActions classes={{ root: this.props.classes.cardActions }}>
                {Object.keys(this.props.actions).map(k => <Button
                    key={k}
                    raised
                    disabled={actions[k].processing || actions[k].valid && !actions[k].valid(this.state)}
                    onClick={this.clickHandlers[k]}
                >
                    {actions[k].processing ? <CircularProgress size={14} /> : k}
                </Button>)}
            </CardActions>
        </Card>
    }
}