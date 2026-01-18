import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
    return (
        <div className="flex flex-col gap-2">
            {label && <label className="text-xs font-bold uppercase tracking-wider text-sti-text opacity-60">{label}</label>}
            <input
                className={`bg-sti-bg border border-sti-border px-3 py-2 text-sm outline-none focus:border-sti-text transition-colors ${className}`}
                {...props}
            />
        </div>
    );
};

export default Input;
