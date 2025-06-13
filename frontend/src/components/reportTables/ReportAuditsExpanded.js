import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { formatObjectDisplay, formatDate, formatTime } from '../../utils/formatUtils';

const ReportAuditsExpanded = ({ entry }) => {
    const { t } = useTranslation();
  
    const baseKey = entry.model_name === 'member'
        ? 'info'
        : `${entry.model_name}s`;
  
    const translateBool = (val) => {
        if (val === true) return t('general.yes');
        if (val === false) return t('general.no');
        return val ?? '';
    };
  
    return (
        <tr>
            <td colSpan={5}>
                <span className="modal-main">
                    ↪&nbsp;<p>
                        {formatObjectDisplay(entry, t)}
                        {Object.entries(entry.changes).map(([field, { old, new: newVal }], i) => {
                            const label = t(`member.${baseKey}.${field}`);
            
                            const formatChange = (val) => {
                                if (!val) return '—';
                            
                                const isTimeString = (v) => /^\d{2}:\d{2}:\d{2}$/.test(v);
                                const date = new Date(val);

                                if (!isNaN(date) && val.length === 10) return formatDate(date);
                                if (isTimeString(val)) return formatTime(val); 
                                return translateBool(val);
                            };
                                
                            return (
                                <Fragment key={i}>
                                    — {label}: {formatChange(old)} → {formatChange(newVal)}
                                    <br />
                                </Fragment>
                            );
                        })}
                    </p>
                </span>
            </td>
        </tr>
    );
};
  
export default ReportAuditsExpanded;