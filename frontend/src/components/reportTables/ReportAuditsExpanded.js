import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { formatObjectDisplay } from '../../utils/formatUtils';

const ReportAuditsExpanded = ({ entry }) => {
    const { t } = useTranslation();
  
    const baseKey = entry.model_name === 'member'
        ? 'info'
        : entry.model_name !== 'authorization'
        ? `${entry.model_name}s`
        : 'authorization';
  
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
        
                        return (
                            <Fragment key={i}>
                                — {label}: {translateBool(old)} → {translateBool(newVal)}
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