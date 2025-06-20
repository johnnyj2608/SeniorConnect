import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { SadcContext } from '../../context/SadcContext';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import SettingsItem from '../items/SettingsItem';

const attendanceTemplateOptions = [
  { value: 1 },
  // { value: 2 },
];

const SettingsAdmin = ({ onEdit }) => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { sadc, setSadc } = useContext(SadcContext);

  const handleEdit = async (url, type) => {
    try {
      const response = await fetchWithRefresh(url);
      if (!response.ok) throw new Error();

      const data = await response.json();
      onEdit(type, data);
    } catch (error) {
      console.error(error);
    }
  };

  const updateAttendanceTemplate = async (newValue) => {
    try {
      const response = await fetchWithRefresh(`/core/sadc/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance_template: newValue }),
      });
      if (!response.ok) return;
      setSadc(prev => ({ ...prev, attendance_template: parseInt(newValue, 10) }));
    } catch (error) {
      console.error(error);
    }
  };

  if (!user?.is_org_admin) return null;

  return (
    <div id="settings-admin">
      <h3 className="section-title">{t('settings.admin.label')}</h3>
      <div className="section-main">
        <SettingsItem
          label={t('model.mltc')}
          onClick={() => handleEdit('/core/mltcs/', 'mltcs')}
        />
        <SettingsItem
          label={t('settings.admin.language.label')}
          onClick={() => handleEdit('/core/languages/', 'languages')}
        />
        <SettingsItem
          label={t('settings.admin.users.label')}
          onClick={() => handleEdit('/user/users/', 'users')}
        />
        <SettingsItem
          label={t('settings.admin.attendance')}
          component={
            <select
              value={sadc.attendance_template}
              onChange={e => updateAttendanceTemplate(e.target.value)}
            >
              {attendanceTemplateOptions.map(({ value }) => (
                <option key={value} value={value}>
                  {t('settings.admin.template')} #{value}
                </option>
              ))}
            </select>
          }
        />
      </div>
    </div>
  );
};

export default SettingsAdmin;