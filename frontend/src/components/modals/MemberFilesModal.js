import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as Upload } from '../../assets/upload.svg';
import viewFile from '../../utils/viewFile';
import useDragAndDrop from '../../hooks/useDragDrop';

const MemberFilesModal = ({ data, handleChange, activeTab }) => {
    const { t } = useTranslation();
    
    const current = data[activeTab] || {};
    const disabled = data.filter(tab => !tab.deleted).length <= 0;

    const onDropFile = (file) => {
        const fakeEvent = { target: { files: [file] } };
        handleChange('file')(fakeEvent);

        if (!current.name) {
            handleChange('name')({ target: { value: file.name } });
        }
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

                <div className="member-detail">
                    <label>{t('member.files.upload_file')} *</label>
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

                <div className="member-detail">
                    <label>{t('member.files.completed')}</label>
                    <input
                        type="date"
                        value={disabled ? '' : current.completion_date || ''}
                        onChange={handleChange('completion_date')}
                        disabled={disabled}
                    />
                </div>

                <div className="member-detail">
                    <label>{t('member.files.expiration')}</label>
                    <input
                        type="date"
                        value={disabled ? '' : current.expiration_date || ''}
                        onChange={handleChange('expiration_date')}
                        disabled={disabled}
                    />
                </div>

                <div className="file-footer">
                    <button
                        className="action-button thin"
                        onClick={() => viewFile(current.file)}
                        disabled={disabled || !current.file}
                    >
                        {t('general.buttons.view_file')}
                    </button>
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