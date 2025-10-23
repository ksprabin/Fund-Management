
import React, { ReactNode } from 'react';

interface CardProps {
    title?: string;
    children: ReactNode;
    className?: string;
    actions?: ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children, className = '', actions }) => {
    return (
        <div className={`bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden ${className}`}>
            {title && (
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                    {actions && <div className="flex-shrink-0">{actions}</div>}
                </div>
            )}
            <div className="p-4 sm:p-6">
                {children}
            </div>
        </div>
    );
};

export default Card;
