import * as React from 'react'
import { Card, TextField, CardContent, Grid, Button, CardActions, CircularProgress, CardHeader } from 'material-ui'
import { withStyles, StyleRulesCallback } from 'material-ui/styles'
import { connect } from 'react-redux'
import { State, Preference } from '../../model'
import * as api from '../../api'
import * as interactions from '../../interactions'
import Form, { Fields } from './form'

const mapStateToProps = (state: State) => ({
    preference: state.preference,
    isEditing: state.interactions.loadings.indexOf('SETPREFERENCE') > -1,
    isEditingPassword: state.interactions.loadings.indexOf('EDITPASSWORD') > -1,
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
    form: {
        marginBottom: '15px',
    },
})

interface PreferenceViewProps {
    preference: Preference,
    isEditing: boolean,
    isEditingPassword: boolean,
    classes: any,
}

interface PreferenceViewState {
    pwd: EditPasswordInput,
    preference: PreferenceInput,
}

interface PreferenceInput {
    siteName: string,
    domain: string,
    author: string,
    intro: string,
    pageSize: string,
}

interface EditPasswordInput {
    current: string,
    next: string,
}

class PreferenceView extends React.Component<PreferenceViewProps, PreferenceViewState> {
    state: PreferenceViewState = {
        pwd: {
            current: '',
            next: '',
        },
        preference: {
            siteName: '',
            domain: '',
            author: '',
            intro: '',
            pageSize: '',
        }
    }

    componentWillMount() {
        // 初始化
        this.setState({ preference: { ...this.props.preference, pageSize: this.props.preference.pageSize.toString() } })
    }

    // editCurrentPwd: React.FormEventHandler<HTMLDivElement> = e => this.setState({ ...this.state, currentPwd: (e.target as HTMLInputElement).value })
    handleSave = (s: PreferenceInput) => {
        const p: any = { ...s }
        if (p.pageSize == '') {
            delete p.pageSize
        } else {
            p.pageSize = +p.pageSize
        }

        api.setPreference(p as Preference).then(
            () => interactions.warn('修改设置成功'),
            () => interactions.warn('修改设置失败')
        )
    }

    handleEditPassword = (s: EditPasswordInput) => {
        api.editPassword(s.current, s.next).then(
            () => interactions.warn('修改密码成功'),
            () => interactions.warn('修改密码失败')
        )
    }

    render() {
        const { classes } = this.props,
            { preference } = this.state
        return <Grid container classes={{ typeContainer: classes.container }} justify="center" align="center">
            <Grid item xl={6} md={8} xs={10}>
                <Form
                    fields={{
                        current: {
                            name: '旧密码',
                            initValue: '',
                            isPassword: true,
                            holder: '输入当前密码',
                        },
                        next: {
                            name: '新密码',
                            initValue: '',
                            isPassword: true,
                            holder: '输入新密码',
                        },
                    }}

                    actions={{
                        修改密码: {
                            processing: this.props.isEditingPassword,
                            onClick: this.handleEditPassword
                        },
                    }}

                    classes={{ cardActions: classes.cardActions, form: classes.form }}
                />

                <Form
                    fields={{
                        siteName: {
                            name: '网站名',
                            initValue: preference.siteName,
                            holder: '一个响当当的名字',
                        },
                        domain: {
                            name: '域名',
                            initValue: preference.domain,
                            holder: '一个酷炫的域名',
                        },
                        intro: {
                            name: '简介',
                            initValue: preference.intro,
                            holder: '也许会显示在首页',
                        },
                        author: {
                            name: '作者',
                            initValue: preference.author,
                        },
                        pageSize: {
                            name: '每页显示文章数',
                            initValue: preference.pageSize,
                        },
                    } as Fields<PreferenceInput>}

                    actions={{
                        保存: {
                            processing: this.props.isEditing,
                            onClick: this.handleSave
                        },
                    }}

                    classes={{ cardActions: classes.cardActions, form: classes.form }}
                />

            </Grid>
        </Grid>
    }
}


export default withStyles(styles)(connect(mapStateToProps)(PreferenceView))