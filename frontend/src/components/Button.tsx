import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'dashed';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "px-4 py-2 text-sm font-medium transition-all duration-200 outline-none";
    const variants = {
        primary: "bg-sti-text text-sti-bg",
        secondary: "bg-sti-bg text-sti-text border border-sti-border",
        dashed: "bg-transparent text-sti-text border border-dashed border-sti-text hover:bg-sti-border"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
