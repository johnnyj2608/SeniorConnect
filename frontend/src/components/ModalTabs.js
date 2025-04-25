import React from 'react';
import { ReactComponent as AddIcon } from '../assets/add.svg'
import { contact_types, absence_types } from '../utils/mapUtils';

const ModalTabs = ({ index, activeTab, handleTabClick, type, tab }) => {
    if (tab.deleted) {
        return;
    }

    const getTabLabel = (type, item) => {
        const today = new Date();
        let status = '';

        switch (type) {
            case 'authorizations':
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
                const start = item.start_date ? new Date(item.start_date) : null;
                const end = item.end_date ? new Date(item.end_date) : null;

                if (start === null) {
                    status = '';
                } else if (start > today) {
                    status = 'Upcoming';
                } else if (end && end < today) {
                    status = 'Expired';
                } else if (start <= today && (end === null || end >= today)) {
                    status = 'Ongoing';
                } else {
                    status = '';
                }

                return { 
                    heading: absence_types[item.absence_type] || 'Unknown', 
                    subheading: status,
                };
            case 'files':
                return { 
                    heading: item.name || 'Unknown', 
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
