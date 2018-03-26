import * as React from 'react'
// import { connect } from 'react-redux'
import { Grid, TextField, Switch, Button, Paper } from 'material-ui'
import { withStyles, StyleRulesCallback } from 'material-ui/styles'
import { FormControlLabel } from 'material-ui/Form'
import { login as loginRequest } from '../api'
const styles: StyleRulesCallback = theme => ({
    paper: {
        padding: '30px',
        margin: '20px 0'
    }
})
class Login extends React.Component<{ classes: { paper: any } }, { password: string, exclusive: boolean }> {
    state = { password: '', exclusive: false }
    render() {
        const { paper } = this.props.classes
        return (
            <Grid container justify="center" align="center">
                <Grid item lg={3} md={5} sm={6} xs={10}>
                    <Paper className={paper}>
                        <Grid container direction="column">
                            <TextField
                                label="口令"
                                type="password"
                                placeholder="小心别被看见"
                                onChange={event => this.setState({
                                    password: (event.target as HTMLInputElement).value
                                })}
                            />
                            <FormControlLabel
                                control={<Switch onChange={(event, checked) => this.setState({ exclusive: checked })} />}
                                label={this.state.exclusive ? '其他设备下线' : '低调地登录'}
                            />
                            <Button raised onClick={() => loginRequest(this.state.password, this.state.exclusive)}>登录</Button>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        )
    }
    login() {
        loginRequest(this.state.password, this.state.exclusive)
    }
}

export default withStyles(styles)(Login)