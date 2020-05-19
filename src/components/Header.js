import React from 'react';
import Logo from '../Logo.png'
import './layout.css';

function Header() {
    return (
        <div className="header">
            <div className="logo">
                <img width={70} height={38} src={Logo} alt='logo' />
            </div>
            <h4>COVID-19 Trend Visualization</h4>
        </div>
    );
}

export default Header;