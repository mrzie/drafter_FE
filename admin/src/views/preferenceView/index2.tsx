import * as React from 'react'
import { Card, TextField, CardContent, Grid, Button, CardActions, CircularProgress, CardHeader } from 'material-ui'
import { withStyles, StyleRulesCallback } from 'material-ui/styles'
import { connect } from 'react-redux'
import { State, Preference } from '../../model'
import * as api from '../../api'
import * as interactions from '../../interactions'

const mapStateToProps = (state: State) => ({
    preference: state.preference,
    isEditing: state.interactions.loadings.indexOf('SETPREFERENCE') > -1,
    isEditingPassword: state.interactions.loadings.indexOf('SETPASSWORD') > -1,
})

const styles: StyleRulesCallback = theme => ({
    container: {
        height: '100%',
    },
    cardActions: {
        justifyContent: 'center',
    },
    editPasswordCard: {
        marginBottom: '20px',
    },
})

interface PreferenceViewProps {
    preference: Preference,
    isEditing: boolean,
    isEditingPassword: boolean,
    classes: any,
}

interface PreferenceViewState {
    // pwd: {
    currentPwd: string,
    nextPwd: string,
    // },
    // preference: {
    siteName: string,
    domain: string,
    author: string,
    intro: string,
    pageSize: number | '',
    // },
}

// class EditPasswordView extends React.Component<{ classes: { [name: string]: string } }, { prevPwd: string, newPwd: string }> {
//     state = { prevPwd: '', newPwd: '' }
//     render() {
//         return <Card classes={{ classes: this.props.classes.root }}>
//             <CardHeader title="修改密码" />
//             <CardContent>
//                 <Grid container justify="space-around">
//                     <Grid item md={3} container align="center">
//                         旧密码
//                             </Grid>
//                     <Grid item md={5}>
//                         <TextField
//                             type="password"
//                             placeholder="输入旧密码"
//                             value={this.state.prevPwd}
//                             onChange={e => this.setState({ prevPwd: (e.target as HTMLInputElement).value })}
//                             fullWidth
//                             margin="normal"
//                         />
//                     </Grid>
//                 </Grid>
//                 <Grid container justify="space-around">
//                     <Grid item md={3} container align="center">
//                         新密码
//                             </Grid>
//                     <Grid item md={5}>
//                         <TextField
//                             type="password"
//                             placeholder="输入新密码"
//                             value={this.state.newPwd}
//                             onChange={e => this.setState({ newPwd: (e.target as HTMLInputElement).value })}
//                             fullWidth
//                             margin="normal"
//                         />
//                     </Grid>
//                 </Grid>

//             </CardContent>
//             <CardActions classes={{ root: this.props.classes.cardActions }}>
//                 <Button
//                     raised
//                     disabled={this.props.isEditing}
//                     onClick={() => {
//                         const p = { ...this.state }
//                         if (p.pageSize == '') {
//                             delete p.pageSize
//                         }
//                         api.setPreference(p as Preference).then(
//                             () => interactions.warn('修改设置成功'),
//                             () => interactions.warn('修改设置失败')
//                         )
//                     }}
//                 >
//                     {this.props.isEditing ? <CircularProgress size={14} /> : '保存'}
//                 </Button>
//             </CardActions>
//         </Card>
//     }
// }


class PreferenceView extends React.Component<PreferenceViewProps, PreferenceViewState> {
    state: PreferenceViewState = {
        currentPwd: '',
        nextPwd: '',
        siteName: '',
        domain: '',
        author: '',
        intro: '',
        pageSize: '',
    }

    componentWillMount() {
        // 初始化
        this.setState({
            ...this.state,
            ...this.props.preference,
        })
    }

    editCurrentPwd: React.FormEventHandler<HTMLDivElement> = e => this.setState({ ...this.state, currentPwd: (e.target as HTMLInputElement).value })
    handleSave = () => {
        const p = { ...this.state }
        if (p.pageSize == '') {
            delete p.pageSize
        }


        api.setPreference(p as Preference).then(
            () => interactions.warn('修改设置成功'),
            () => interactions.warn('修改设置失败')
        )
    }

    render() {
        const { classes } = this.props
        return <Grid container classes={{ typeContainer: classes.container }} justify="center" align="center">
            <Grid item xl={6} md={8} xs={10}>

                <Card>
                    <CardContent>
                        <Grid container justify="space-around">
                            <Grid item md={3} container align="center">
                                网站名
                            </Grid>
                            <Grid item md={5}>
                                <TextField
                                    id="siteName"
                                    // label="网站名"
                                    placeholder="一个响当当的名字"
                                    //   className={classes.textField}
                                    value={this.state.siteName}
                                    onChange={e => this.setState({ siteName: (e.target as HTMLInputElement).value })}
                                    fullWidth
                                    margin="normal"
                                />
                            </Grid>
                        </Grid>
                        <Grid container justify="space-around">
                            <Grid item md={3} container align="center">
                                域名
                            </Grid>
                            <Grid item md={5}>
                                <TextField
                                    id="domain"
                                    placeholder="一个酷炫的域名"
                                    value={this.state.domain}
                                    onChange={e => this.setState({ domain: (e.target as HTMLInputElement).value })}
                                    fullWidth
                                    margin="normal"
                                />
                            </Grid>
                        </Grid>
                        <Grid container justify="space-around">
                            <Grid item md={3} container align="center">
                                简介
                            </Grid>
                            <Grid item md={5}>
                                <TextField
                                    id="intro"
                                    multiline
                                    rowsMax={5}
                                    placeholder="也许会放在首页"
                                    value={this.state.intro}
                                    onChange={e => this.setState({ intro: (e.target as HTMLInputElement).value })}
                                    fullWidth
                                    margin="normal"
                                />
                            </Grid>
                        </Grid>
                        <Grid container justify="space-around">
                            <Grid item md={3} container align="center">
                                作者
                            </Grid>
                            <Grid item md={5}>
                                <TextField
                                    id="author"
                                    value={this.state.author}
                                    onChange={e => this.setState({ author: (e.target as HTMLInputElement).value })}
                                    margin="normal"
                                />
                            </Grid>
                        </Grid>
                        <Grid container justify="space-around">
                            <Grid item md={3} container align="center">
                                每页显示文章数
                            </Grid>
                            <Grid item md={5}>
                                <TextField
                                    id="pageSize"
                                    value={this.state.pageSize}
                                    type="number"
                                    onChange={e => {
                                        const value = (e.target as HTMLInputElement).value
                                        this.setState({ pageSize: value == '' ? value : +value })
                                    }}
                                    margin="normal"
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions classes={{ root: classes.cardActions }}>
                        <Button
                            raised
                            disabled={this.props.isEditing}
                            onClick={this.handleSave}
                        >
                            {this.props.isEditing ? <CircularProgress size={14} /> : '保存'}
                        </Button>
                    </CardActions>
                </Card>

            </Grid>
        </Grid>
    }
}


export default withStyles(styles)(connect(mapStateToProps)(PreferenceView))