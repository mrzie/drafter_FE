import * as React from 'react';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { __basic } from '../model/conf';

export const Header = memo(() => <header className="header">
    <div className="container">
        <Link to="/" className="header-title">{__basic.sitename}</Link>
        <div className="header-intro">{__basic.intro}</div>
    </div>
</header>)

export default Header;