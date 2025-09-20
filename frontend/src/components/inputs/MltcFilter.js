import React, { useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { MltcContext } from '../../context/MltcContext';

const MltcFilter = ({ value, onChange }) => {
    const { t } = useTranslation();
    const { mltcs, refreshMltc } = useContext(MltcContext);

    useEffect(() => {
        refreshMltc();
    }, [refreshMltc]);

    return (
        <select
            required
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="">{t('members.all_mltcs')}</option>
            {mltcs.map((option) => (
                <option key={option.name} value={option.name}>
                    {option.name}
                </option>
            ))}
            <option value="unknown">{t('members.no_mltc')}</option>
            <option value="inactive">{t('members.inactive')}</option>
        </select>
    );
};

export default MltcFilter;
