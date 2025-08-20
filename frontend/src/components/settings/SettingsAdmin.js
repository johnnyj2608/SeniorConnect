import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { MltcContext } from '../../context/MltcContext';
import { GiftContext } from '../../context/GiftContext';
import { UserContext } from '../../context/UserContext';
import { SadcContext } from '../../context/SadcContext';
import SettingsItem from '../items/SettingsItem';

const SettingsAdmin = ({ onEdit }) => {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const { refreshMltc } = useContext(MltcContext);
    const { refreshGift } = useContext(GiftContext);
    const { refreshUser } = useContext(UserContext);
    const { refreshSadc } = useContext(SadcContext);
    
    const handleEdit = async (type) => {
        if (type === 'mltcs') {
            const freshMltcs = await refreshMltc();
            onEdit(type, freshMltcs);
        } else if (type === 'gifts') {
            const freshGifts = await refreshGift();
            onEdit(type, freshGifts);
        } else if (type === 'users') {
            const freshUsers = await refreshUser();
            onEdit(type, freshUsers);
        } else if (type === 'sadcs') {
            const freshSadcs = await refreshSadc();
            onEdit(type, freshSadcs);
        }
    };

    return (
        <div id="settings-admin">
            <h3 className="section-title">{t('settings.admin.label')}</h3>
            <div className="settings-main">
                <SettingsItem
                    label={t('settings.admin.sadc.label')}
                    onClick={() => handleEdit('sadcs')}
                />
                <SettingsItem
                    label={t('settings.admin.mltcs.label')}
                    onClick={() => handleEdit('mltcs')}
                />
                <SettingsItem
                    label={t('settings.admin.gifts.label')}
                    onClick={() => handleEdit('gifts')}
                />
                {user?.is_org_admin && (
                    <SettingsItem
                        label={t('settings.admin.users.label')}
                        onClick={() => handleEdit('users')}
                    />
                )}
            </div>
        </div>
    );
};

export default SettingsAdmin;