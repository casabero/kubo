import React from 'react';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, title, className = '' }) => {
    return (
        <div className={`bg-sti-bg border border-sti-border p-6 ${className}`}>
            {title && <h3 className="text-lg font-bold mb-4">{title}</h3>}
            {children}
        </div>
    );
};

export default Card;
