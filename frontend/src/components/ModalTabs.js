import React from 'react';

const ModalTabs = ({ index, activeTab, setActiveTab, type, tab }) => {
    if (tab.deleted) {
        return;
    }

    const getTabLabel = (type, item, index) => {
        if (index === 0) {
            return { heading: 'New', subheading: '' };
        }

        switch (type) {
            case 'authorization':
                let status = '';
                const today = new Date();

                if (item.active === true) {
                    status = 'Active';
                } else if (item.start_date && new Date(item.start_date) > today) {
                    status = 'Future';
                } else {
                    status = 'Expired';
                }

                return { 
                    heading: item.mltc || 'Unknown', 
                    subheading: status,
                };
            default:
                return { heading: 'Unknown', subheading: '' };
        }
    };

    const { heading, subheading } = getTabLabel(type, tab, index); 
    const isActive = activeTab === index;
    const isExpired = subheading === 'Expired';
    const isEdited = tab.edited === true;

    return (
        <button
            className={`tab-button ${isActive ? 'active' : ''} ${isEdited ? 'edited' : ''} ${isExpired ? 'expired' : ''}`} 
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
