import React from 'react';

const ModalTabs = ({ index, activeTab, setActiveTab, heading, subheading, isEdited }) => {
    return (
        <button
            className={`tab-button ${activeTab === index ? 'active' : ''} ${isEdited ? 'edited' : ''}`} 
            onClick={() => setActiveTab(index)}
        >
            <div className="tab-label">
                <div className="tab-heading">{heading}</div>
                <div className="tab-subheading">{subheading}</div>
            </div>
        </button>
    );
};

export default ModalTabs;
