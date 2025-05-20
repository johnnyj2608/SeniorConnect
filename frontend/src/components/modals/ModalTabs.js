import React, { memo } from 'react';
import { ReactComponent as AddIcon } from '../../assets/folder-add.svg'
import { contact_types, absence_types } from '../../utils/mapUtils';
import { formatDate } from '../../utils/formatUtils';
import { formatAbsenceStatus } from '../../utils/statusUtils';

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
                status = formatAbsenceStatus(item.start_date, item.end_date)

                return { 
                    heading: absence_types[item.absence_type] || 'Unknown', 
                    subheading: status,
                };
            case 'files':
                return { 
                    heading: item.name || 'Unknown', 
                    subheading: formatDate(item.completion_date) || '',
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
                    <span className="add-icon">
                        <AddIcon />
                    </span>
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

export default memo(ModalTabs);
