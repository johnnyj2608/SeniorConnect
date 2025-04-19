import React from 'react';
import { ReactComponent as AddIcon } from '../assets/add.svg'
import { contact_types, absence_types } from '../utils/mapUtils';
import { formatDate } from '../utils/formatUtils';

const ModalTabs = ({ index, activeTab, handleTabClick, type, tab }) => {
    if (tab.deleted) {
        return;
    }
    
    const getTabLabel = (type, item) => {
        switch (type) {
            case 'authorizations':
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
            case 'contacts':
                return { 
                    heading: item.name || 'Unknown', 
                    subheading: contact_types[item.contact_type],
                };
            case 'absences':
                return { 
                    heading: absence_types[item.absence_type] || 'Unknown', 
                    subheading: `${formatDate(item.start_date, true)} - ${formatDate(item.end_date, true)}`
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
        tab.add ? (
            <button className="tab-button add-tab" onClick={handleTabClick}>
                <div className="tab-label">
                    <div className="tab-heading">
                        <AddIcon />
                    </div>
                </div>
            </button>
        ) : (
            <button
                className={`tab-button ${isActive ? 'active' : ''} ${isEdited ? 'edited' : ''} ${isExpired ? 'expired' : ''}`} 
                onClick={() => handleTabClick(index)}
            >
                <div className="tab-label">
                    <div className="tab-heading">{heading}</div>
                    <div className="tab-subheading">{subheading}</div>
                </div>
            </button>
        )
    );
};

export default ModalTabs;
