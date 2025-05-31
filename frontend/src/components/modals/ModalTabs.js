import React, { memo } from 'react';
import { ReactComponent as AddIcon } from '../../assets/folder-add.svg'
import { formatDate } from '../../utils/formatUtils';

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
                    inactive: status === 'Expired',
                };
            case 'contacts':
                return { 
                    heading: item.name || 'Unknown', 
                    subheading: item.contact_type,
                };
            case 'absences':
                const start = item.start_date ? new Date(item.start_date) : null;
                const end = item.end_date ? new Date(item.end_date) : null;

                if (!start) {
                    status = '';
                } else if (start > today) {
                    status = 'Upcoming';
                } else if (end && end < today) {
                    status = 'Completed';
                } else if (start <= today && (!end || end >= today)) {
                    status = 'Ongoing';
                }

                return {
                    heading: item.absence_type || 'Unknown',
                    subheading: status,
                    inactive: status === 'Completed',
                };
            case 'files':
                return { 
                    heading: item.name || 'Unknown', 
                    subheading: formatDate(item.completion_date) || '',
                };
            case 'users':
                return { 
                    heading: item.name || 'Unknown', 
                    subheading: item.is_org_admin ? 'Admin' : 'Staff',
                    inactive: item.is_active === false,
                };
            case 'mltcs':
                return { 
                    heading: item.name || 'Unknown', 
                    inactive: item.active === false,
                };
            default:
                return { heading: 'Unknown', subheading: '' };
        }
    };

    const { heading, subheading, inactive: inactive } = getTabLabel(type, tab, index); 
    const isActive = activeTab === index;
    const isExpired = inactive;
    const isEdited = tab.edited === true;

    return (
        tab.add ? (
            <button className="tab-button sticky" onClick={handleTabClick}>
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
