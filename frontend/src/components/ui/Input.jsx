export default function Input({
    label,
    type = "text",
    name,
    value,
    onChange,
    placeholder,
    error,
}) {
    return (
        <div className="input-group">
            {label && <label className="input-label">{label}</label>}

            <input
                className={`input-field ${error ? "error" : ""}`}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />

            {error && <p className="input-error">{error}</p>}
        </div>
    );
}