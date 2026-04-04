import React from 'react';
import './button.css'; // Assuming CSS file for styles

const Button = ({ label, onClick, variant = 'primary' }) => {
    const buttonClass = `button button--${variant}`;
    
    return (
        <button className={buttonClass} onClick={onClick}>
            {label}
        </button>
    );
};

export default Button;