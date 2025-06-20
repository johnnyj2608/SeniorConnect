import React from 'react'
import { useTranslation } from 'react-i18next'
import { ReactComponent as Attendance } from '../../assets/attendance.svg';

const AttendanceButton = ({ onClick, disabled }) => {
  const { t } = useTranslation()

  return (
    <button onClick={onClick} className="icon-button" disabled={disabled}>
      <span>{t('general.buttons.attendance_sheets')} <Attendance /></span>
    </button>
  );
};

export default AttendanceButton;
