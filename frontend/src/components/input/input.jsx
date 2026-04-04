import React from "react";
import './input.css';

const Input = ({ label, type = "text", placeholder = "", onChange, value }) => {
    return (
        <div className="input-group">
            {label && <label className="input-label">{label}</label>}
            <input
                className="input-field"
                type={type}
                placeholder={placeholder}
                onChange={onChange}
                value={value}
            />
        </div>
    );
};

export default Input;