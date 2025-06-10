import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as Upload } from '../../assets/upload.svg';
import useDragAndDrop from '../../hooks/useDragDrop';

const MemberFilesModal = ({ data, handleChange, activeTab, handleAdd }) => {
    const { t } = useTranslation();
    
    const current = data[activeTab] || {};
    const disabled = data.filter(tab => !tab.deleted).length <= 0;

    const onDropFile = (files) => {
        const today = new Date().toISOString().split('T')[0];

        files.forEach((file, index) => {
            if (Object.keys(current).length === 0 || index !== 0) {
                handleAdd();
            }
            const fakeEvent = { target: { files: [file] } };
            handleChange('file')(fakeEvent);
            handleChange('name')({ target: { value: file.name } });
            handleChange('date')({ target: { value: today } });
        });
    };

    const { isDragging, dragProps } = useDragAndDrop(onDropFile);

    return (
        <div className={`file-drop ${isDragging ? 'drag-over' : ''}`} {...dragProps}>
            <div className={`file-content ${isDragging ? 'dimmed' : ''}`}>
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
                        disabled={disabled}
                    />
                </div>
            </div>

            <div className="member-detail">
                <label>{t('member.files.date')} *</label>
                <input
                    type="date"
                    value={disabled ? '' : current.date || ''}
                    onChange={handleChange('date')}
                    disabled={disabled}
                />
            </div>

            <div className="member-detail">
                    <label>{t('member.files.file')} *</label>
                    <div className="file-container">
                        <button
                            className="action-button thin"
                            onClick={() => document.getElementById('hiddenFileInput').click()}
                            disabled={disabled}
                        >
                            {t('general.buttons.choose_file')}
                        </button>
                        {!disabled && (
                            <span className={`uploaded-file-name ${!current.file ? 'file-expired' : ''}`}>
                                {current.file ? t('member.files.file_chosen') : t('member.files.no_file_chosen')}
                            </span>
                        )}
                        <input
                            id="hiddenFileInput"
                            type="file"
                            accept="*/*"
                            onChange={handleChange('file')}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>

            {isDragging && (
                <div className="upload-overlay">
                    <Upload className="upload-icon pulse" />
                    <p>{t('member.files.drop_to_upload')}</p>
                </div>
            )}
        </div>
    );
};

export default MemberFilesModal;