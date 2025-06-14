import React from 'react';
import { useTranslation } from 'react-i18next';
import MemberPhotoCard from '../memberCards/MemberPhotoCard';
import { formatDate } from '../../utils/formatUtils';

const SettingsDeletedModal = ({ data, activeTab }) => {
    const { t } = useTranslation();

    const current = data[activeTab] || {};
    const disabled = data.filter(tab => !tab.deleted).length <= 0;

    return (
        <div className="">
            <div className="modal-header">
                <h3>{t('settings.data.restore_deleted')}</h3>
            </div>
            {disabled ? (
                <h2 className="modal-content-subheading">{t('settings.data.no_deleted')}</h2>
            ) : (
                <>
                    <MemberPhotoCard data={current} small />
                    <h2 className="modal-content-subheading">{formatDate(current.birth_date)}</h2>
                </>
            )}
        </div>
    );
};

export default SettingsDeletedModal;