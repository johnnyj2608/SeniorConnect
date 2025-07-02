import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TextInput from '../inputs/TextInput';
import FileUpload from '../inputs/FileUpload';
import useDragAndDrop from '../../hooks/useDragDrop';

const MemberFilesModal = ({ 
    type, 
    data, 
    handleChange, 
    activeTab, 
    handleAdd, 
    dragStatus,
    handleLimit,
 }) => {
    const { t } = useTranslation();
    
    const current = type === 'import' ? data : data[activeTab] || {};
    const disabled = type === 'import' ? false : data.filter(tab => !tab.deleted).length <= 0;

    const onDropFile = (files) => {
        const today = new Date().toISOString().split('T')[0];

        if (type === 'import') {
            const file = files[0];
            if (!file) return;

            if (!data.some(entry => !entry.deleted)) {
                handleAdd();
            }
    
            const fakeEvent = { target: { files: [file] } };
            handleChange('file')(fakeEvent);
            handleChange('name')({ target: { value: file?.name } });
            handleChange('date')({ target: { value: today } });
    
        } else {
            files.forEach((file, index) => {
                if (!data.some(entry => !entry.deleted) || index !== 0) {
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

            <TextInput
                label={t('member.files.name')}
                value={current.name}
                onChange={handleChange('name')}
                onLimitExceeded={handleLimit('name', activeTab)}
                required
                disabled={disabled || type === 'import'}
            />

            <TextInput
                label={t('member.files.date')}
                type="date"
                value={current.date}
                onChange={handleChange('date')}
                onLimitExceeded={handleLimit('date', activeTab)}
                required
                disabled={disabled || type === 'import'}
            />

            <FileUpload 
                file={current.file}
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