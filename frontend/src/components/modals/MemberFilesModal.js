import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import FileUpload from '../inputs/FileUpload';
import useDragAndDrop from '../../hooks/useDragDrop';

const MemberFilesModal = ({ type, data, handleChange, activeTab, handleAdd, dragStatus }) => {
    const { t } = useTranslation();
    
    const current = type === 'import' ? data : data[activeTab] || {};
    const disabled = type === 'import' ? false : data.filter(tab => !tab.deleted).length <= 0;

    const onDropFile = (files) => {
        const today = new Date().toISOString().split('T')[0];

        if (type === 'import') {
            const file = files[0];
            if (!file) return;
    
            const fakeEvent = { target: { files: [file] } };
            handleChange('file')(fakeEvent);
            handleChange('name')({ target: { value: file?.name } });
            handleChange('date')({ target: { value: today } });
    
        } else {
            files.forEach((file, index) => {
                if (Object.keys(current).length === 0 || index !== 0) {
                    handleAdd();
                }
    
                const fakeEvent = { target: { files: [file] } };
                handleChange('file')(fakeEvent);
                handleChange('name')({ target: { value: file?.name } });
                handleChange('date')({ target: { value: today } });
            });
        }
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
                <h3>{t('general.edit')}{t('member.files.label')}</h3>
            </div>

            <div className="member-detail">
                <label>{t('member.files.name')} *</label>
                <input
                    type="text"
                    value={disabled ? '' : current.name || ''}
                    onChange={handleChange('name')}
                    placeholder="Required"
                    autoComplete="off"
                    disabled={disabled || type === 'import'}
                />
            </div>

            <div className="member-detail">
                <label>{t('member.files.date')} *</label>
                <input
                    type="date"
                    value={disabled ? '' : current.date || ''}
                    onChange={handleChange('date')}
                    disabled={disabled || type === 'import'}
                />
            </div>

            <FileUpload 
                current={current}
                handleChange={handleChange}
                disabled={disabled && type === 'files'}
                required={true}
                autoFill={true}
                fileTypes={type === 'import' ? '.csv' : undefined}
            />
        </div>
    );
};

export default MemberFilesModal;