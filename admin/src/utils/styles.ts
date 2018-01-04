import { StyleRules } from 'material-ui/styles'


export const notelistStyles: StyleRules = {
    emptyIcon: {
        transform: 'translate(-50%, -50%)',
        left: '50%',
        top: '40%',
        width: '60%',
        height: '60%',
        position: 'absolute',
        // zIndex: -1,
        opacity: 0.15,
    },
    listItem: {
        margin: '10px',
        fontWeight: 300 ,
        fontSize: '14px',
        cursor: 'pointer',
        position: 'relative',
    },
    itemContent: {
        // padding: '10px',
    },
    itemTitle: {
        fontSize: '16px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        fontWeight: 500 as 500,
        marginBottom: '10px',
        '&:empty:before': {
            content: '"（无标题）"',
            opacity: .5
        }
    },
    itemTime: {
        color: '#3b8adb',
        marginRight: '5px',
        display: 'inline-block',
    },
    itemAbstract: {
        lineHeight: '18px',
        height: '54px',
        overflow: 'hidden',
    },
    itemSelected: {
        outline: '2px solid #7bbef7',
    },
    topProgress: {
        position: 'absolute',
        top: '0',
        width: '100%',
    },
    itemProgress: {
        position: 'absolute',
        bottom: '0',
        width: '100%',
    },
    itemProgressColor: {
        backgroundColor: '#3b8adb',
    },
    itemProgressBar: {
        backgroundColor: '#fff',
    },
    itemProgressHolder: {
        position: 'absolute',
        bottom: '0',
        width: '100%',
        backgroundColor: '#ffe67a',
        height: '5px',
    },
    // itemCircleProgress: {
    //     margin: '5px auto',
    //     display: 'block',
    //     color: '#3b8adb',
    // },
}