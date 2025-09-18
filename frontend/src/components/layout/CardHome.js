import React from 'react';

const CardHome = ({ title, data = [], emptyMessage = "", children }) => {
    if (!data || data.length === 0) {
        return (
            <div className="card-full">
                <h2>{title}</h2>
                <div className="card-container">
                    {emptyMessage}
                </div>
            </div>
        );
    }

    return (
        <div className="card-full">
            <h2>{title}</h2>
            <div className="card-container">
                {children}
            </div>
        </div>
    );
};

export default CardHome;