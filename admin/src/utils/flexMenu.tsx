import * as React from 'react'
import Menu from 'material-ui/Menu'
import { findDOMNode } from 'react-dom'
// import Menu, { MenuListProps } from 'material-ui/Menu'
// import { StyledComponentProps } from 'material-ui'

interface FlexMenuProps {
    // flexible: boolean,
    x?: number,
    y?: number,
    anchorEl?: HTMLElement,
    // MenuListProps?: MenuListProps & StyledComponentProps<any>,
    onRequestClose?: React.EventHandler<any>,
    open?: boolean,
    transitionDuration?: number | 'auto',
    children: JSX.Element[] | JSX.Element,
}

interface FlexMenuState {
    anchor: Element
}

class FlexMenu extends React.Component<FlexMenuProps, FlexMenuState> {
    state = {
        anchor: undefined as HTMLElement,
    }
    menuAnchor: Element = null
    render() {
        const { onRequestClose, open, transitionDuration, children } = this.props
        return <Menu
            onContextMenu={e => e.preventDefault()}
            anchorEl={this.state.anchor}
            onRequestClose={onRequestClose}
            open={open}
            transitionDuration={transitionDuration}
        >
            <div ref="dirty"></div>
            {children}
        </Menu>
    }

    componentWillMount() {
        this.setState({ anchor: this.props.anchorEl || this.addMenuAnchor(this.props.x, this.props.y) })
    }

    componentWillReceiveProps(next: FlexMenuProps) {
        if (this.props.open && !next.open) {
            // 关闭menu
            if (this.menuAnchor) {
                this.menuAnchor.parentElement.removeChild(this.menuAnchor)
                this.menuAnchor = null
            }
        } else if (!this.props.open && next.open) {
            // 打开menu
            this.setState({ anchor: next.anchorEl || this.addMenuAnchor(next.x, next.y) })
        }
    }

    addMenuAnchor(x: number, y: number) {
        if (this.menuAnchor) {
            this.menuAnchor.parentElement.removeChild(this.menuAnchor)
            this.menuAnchor = null
        }
        const div = document.createElement('div')
        div.style.cssText = `position: fixed; width: 1px; height: 1px; top: ${y}px; left: ${x}px`
        document.body.appendChild(div)
        this.menuAnchor = div
        return div
    }

    // componentDidUpdate() {
    //     if (!this.props.anchorEl) {
    //         const menu = findDOMNode(this.refs.dirty).parentElement.parentElement
    //         menu.style.setProperty('top', this.props.y + 'px')
    //         menu.style.setProperty('left', this.props.x + 'px')
    //     }
    // }
}

// const FlexMenu = (props: FlexMenuProps) => <Menu
//     anchorEl={props.anchorEl}
//     // MenuListProps={props.MenuListProps}
//     onRequestClose={props.onRequestClose}
//     open={props.open}
//     transitionDuration={props.transitionDuration}
// >
//     <div ref={el => {
//         if (props.flexible) {
//             const menu = el.parentElement.parentElement
//             menu.style.setProperty('top', props.y + 'px')
//             menu.style.setProperty('left', props.x + 'px')
//         }
//     }}></div>
//     {props.children}
// </Menu>
export default FlexMenu