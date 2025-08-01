import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as AddIcon } from '../../assets/folder-add.svg'
import { formatDate, formatStatus } from '../../utils/formatUtils';
import NameDisplay from '../layout/NameDisplay';

const ModalTabs = ({ index, activeTab, handleTabClick, type, tab }) => {
    const { t } = useTranslation();
    
    if (tab.deleted || (type === 'deleted' && tab.add) || (type === 'gifteds' && tab.add)) {
        return;
    } 

    const getTabLabel = (type, item) => {
        const today = new Date();
        let status = '';

        switch (type) {
            case 'authorizations':
                // Status must be calculated on frontend, changes based on date inputs
                if (item.active === true) {
                    status = t('status.active');
                } else if (item.start_date && new Date(item.start_date) > today) {
                    status = t('status.future');
                } else {
                    status = t('status.expired');
                }

                return { 
                    heading: item.mltc || t('members.unknown'),
                    subheading: status,
                    inactive: status === t('status.expired'),
                };
            case 'contacts':
                return { 
                    heading: item.name || t('members.unknown'),
                    subheading: t(`member.contacts.${item.contact_type}`, '')
                };
            case 'absences':
                // Status must be calculated on frontend, changes based on date inputs
                let inactive;
                if (item.absence_type === 'assessment') {
                    status = formatDate(item.start_date)
                } else {
                    status = formatStatus(item.start_date, item.end_date);
                    inactive = status === 'completed';
                    status = status ? t(`member.absences.${status}`) : '';
                }
                return {
                    heading: t(`member.absences.${item.absence_type}`, t('members.unknown')),
                    subheading: status,
                    inactive: inactive,
                };
            case 'files':
                return { 
                    heading: item.name || t('members.unknown'),
                    subheading: formatDate(item.date) || '',
                };
            case 'users':
                return { 
                    heading: item.name || t('members.unknown'),
                    subheading: item.is_org_admin ? t('settings.admin.users.admin') : t('settings.admin.users.staff'),
                    inactive: item.is_active === false,
                };
            case 'mltcs':
                return { 
                    heading: item.name || t('members.unknown'),
                    inactive: item.active === false,
                };
            case 'gifteds':
            case 'gifts':
                return { 
                    heading: item.name || t('members.unknown'),
                    subheading: formatDate(item.expires_at) || '',
                    inactive: (item.expires_at && new Date(item.expires_at) < today) || !!item.received,
                };
            case 'deleted':
                return {
                    heading: (
                        <NameDisplay
                            sadcId={item.sadc_member_id}
                            memberName={item.member_name}
                            altName={item.alt_name}
                        />
                    ),
                    subheading: t('settings.data.days_left', { days: item.days_until_30 }),
                }
            default:
                return { heading: t('members.unknown'), subheading: '' };
        }
    };

    const { heading, subheading, inactive } = getTabLabel(type, tab, index); 
    const isActive = activeTab === index;
    const isExpired = inactive;
    const isEdited = tab.edited === true;

    return (
        tab.add ? (
            <button className="tab-button sticky" onClick={handleTabClick}>
                <span className="add-icon">
                    <AddIcon />
                </span>
            </button>
        ) : (
            <button
                className={`tab-button${isActive ? ' active' : ''}${isEdited ? ' edited' : ''}${isExpired ? ' expired' : ''}`} 
                onClick={() => handleTabClick(index)}
            >
                <div>
                    <div className="tab-heading">{heading}</div>
                    <div className="tab-subheading">{subheading}</div>
                </div>
            </button>
        )
    );
};

export default memo(ModalTabs);
