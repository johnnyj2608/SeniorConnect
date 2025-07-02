import React, { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../../context/UserContext';
import FileUpload from '../inputs/FileUpload';
import TextInput from '../inputs/TextInput';
import useDragAndDrop from '../../hooks/useDragDrop';

const absenceTypes = [
    'vacation', 
    'hospital', 
    'personal', 
    'assessment',
    'other'
];

const MemberAbsencesModal = ({ data, handleChange, activeTab, handleAdd, dragStatus, handleLimit }) => {
    const { t } = useTranslation();
    const { users, refreshUser } = useContext(UserContext);

    const current = data[activeTab] || {};
    const disabled = data.filter(tab => !tab.deleted).length <= 0;

    const isAssessment = current.absence_type === 'assessment';

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const onDropFile = (files) => {
        const file = files[0];
        if (!file) return;

        if (!data.some(entry => !entry.deleted)) {
            handleAdd();
        }

        const fakeEvent = { target: { files: [file] } };
        handleChange('file')(fakeEvent);
    };

    const { isDragging, dragProps } = useDragAndDrop(onDropFile);

    useEffect(() => {
        if (dragStatus) dragStatus(isDragging);
        return () => {
            if (dragStatus) dragStatus(false);
        };
    }, [isDragging, dragStatus]);

    return (
        <div {...dragProps}>
            <div className="modal-header">
                <h3>{t('general.edit')}{t('member.absences.label')}</h3>
                {!isAssessment && (
                <label>
                    <input
                    type="checkbox"
                    checked={disabled ? false : current.called === true}
                    onChange={(e) =>
                        handleChange('called')({ target: { value: e.target.checked } })
                    }
                    disabled={disabled}
                    />
                    {t('member.absences.called')}
                </label>
                )}
            </div>

            <div className="member-detail">
                <label>{t('member.absences.label')}</label>
                <select
                    value={disabled ? '' : current.absence_type || ''}
                    onChange={handleChange('absence_type')}
                    disabled={disabled}
                    required
                >
                    <option value="">{t('general.select_an_option')}</option>
                    {absenceTypes.map((type) => (
                        <option key={type} value={type}>
                            {t(`member.absences.${type}`)}
                        </option>
                    ))}
                </select>
            </div>

            <TextInput
                label={isAssessment ? t('member.absences.date') : t('member.absences.start_date')}
                type="date"
                value={current.start_date}
                onChange={handleChange('start_date')}
                disabled={disabled}
                required
            />

            {!isAssessment && (
                <TextInput
                    label={t('member.absences.end_date')}
                    type="date"
                    value={current.end_date}
                    onChange={handleChange('end_date')}
                    disabled={disabled}
                />
            )}

            {isAssessment && (
                <>
                    <TextInput
                        label={t('member.absences.time')}
                        type="time"
                        value={current.time}
                        onChange={handleChange('time')}
                        disabled={disabled}
                        required
                    />

                <div className="member-detail">
                    <label>{t('member.absences.user')} *</label>
                    <select
                        required
                        value={disabled ? '' : current.user || ''}
                        onChange={handleChange('user')}
                        disabled={disabled}
                    >
                        <option value="">{t('general.select_an_option')}</option>
                        {users.map((option) => (
                            <option key={option.name} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div>
                </>
            )}

            <TextInput
                label={t('general.note')}
                value={current.note}
                onChange={handleChange('note')}
                onLimitExceeded={(exceeded) => handleLimit('note', activeTab)(exceeded)}
                disabled={disabled}
                maxLength={220}
            />

            <FileUpload 
                file={current.file}
                handleChange={handleChange}
                disabled={disabled}
            />
        </div>
    );
};
    
export default MemberAbsencesModal;