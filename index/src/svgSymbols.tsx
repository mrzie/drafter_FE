import * as  React from 'react'

export const SvgSymbolsDefinitions = () => <svg arial-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
    <defs>
        <symbol id="icon-cross" viewBox="0 0 20 20">
            <title>cross</title>
            <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path>
        </symbol>
        <symbol id="icon-reply" viewBox="0 0 20 20">
            <title>reply</title>
            <path d="M19 16.685c0 0-2.225-9.732-11-9.732v-3.984l-7 6.573 7 6.69v-4.357c4.763-0.001 8.516 0.421 11 4.81z"></path>
        </symbol>
        <symbol id="icon-sina-weibo" viewBox="0 0 20 20">
            <title>sina-weibo</title>
            <path d="M14.688 10.068c-0.274-0.084-0.463-0.142-0.319-0.508 0.311-0.797 0.344-1.484 0.007-1.975-0.633-0.92-2.364-0.871-4.348-0.025 0-0.002-0.623 0.277-0.464-0.227 0.306-0.997 0.259-1.833-0.216-2.315-1.076-1.098-3.937 0.041-6.392 2.539-1.839 1.871-2.906 3.853-2.906 5.568 0 3.281 4.132 5.475 8.175 5.475 5.299 0 8.825-3.334 8.825-5.822 0-1.505-1.244-2.358-2.362-2.71zM8.236 17.129c-3.225 0.32-6.011-1.147-6.22-3.275s2.236-4.115 5.462-4.438c3.226-0.32 6.011 1.146 6.22 3.275 0.209 2.131-2.236 4.118-5.462 4.438zM19.95 7.397c-0.001-3.312-2.686-5.996-6-5.996-0.387 0-0.699 0.312-0.699 0.699s0.312 0.699 0.699 0.699c2.541 0 4.601 2.061 4.601 4.602 0 0.387 0.313 0.699 0.7 0.699s0.699-0.313 0.699-0.7v-0.003zM17.169 7.295c-0.319-1.562-1.551-2.793-3.113-3.113-0.378-0.078-0.748 0.166-0.826 0.545-0.077 0.377 0.166 0.748 0.545 0.826 1.016 0.207 1.816 1.008 2.024 2.023 0.078 0.379 0.448 0.621 0.826 0.545 0.377-0.078 0.622-0.449 0.544-0.826zM6.582 11.502c-1.3 0.262-2.177 1.352-1.959 2.434 0.218 1.084 1.447 1.75 2.747 1.488s2.176-1.352 1.959-2.434c-0.218-1.082-1.449-1.75-2.747-1.488z"></path>
        </symbol>
    </defs>
</svg>


interface SvgIconProps {
    width?: string,
    height?: string,
    fill?: string,
}

const generateIcon = (href: string) => (props: SvgIconProps) => <svg
    width={props.width || '1em'}
    height={props.width || '1em'}
    fill={props.width || 'currentColor'}
>
    <use xlinkHref={href} />
</svg>

export const Reply = generateIcon('#icon-reply')
export const Cross = generateIcon('#icon-cross')
export const Sina = generateIcon('#icon-sina-weibo')