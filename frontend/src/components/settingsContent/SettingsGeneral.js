import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import MemberDetail from '../layout/MemberDetail';
import { SadcContext } from '../../context/SadcContext';

const SettingsGeneral = () => {
  const { t } = useTranslation();
  const { sadc } = useContext(SadcContext); 

  return (
    <div id="settings-general">
      <h3 className="section-title">{t('settings.general.label')}</h3>
      <div className="section-main">
        <MemberDetail
          label={t('settings.general.sadc')}
          value={<input type="text" value={sadc?.name || ''} disabled={true} />}
        />
         <MemberDetail
          label={t('settings.general.email')}
          value={<input type="text" value={sadc?.email || ''} disabled={true} />}
        />
         <MemberDetail
          label={t('settings.general.phone')}
          value={<input type="text" value={sadc?.phone || ''} disabled={true} />}
        />
         <MemberDetail
          label={t('settings.general.address')}
          value={<input type="text" value={sadc?.address || ''} disabled={true} />}
        />
         <MemberDetail
          label={t('settings.general.npi')}
          value={<input type="text" value={sadc?.npi || ''} disabled={true} />}
        />
      </div>
    </div>
  );

};

export default SettingsGeneral;