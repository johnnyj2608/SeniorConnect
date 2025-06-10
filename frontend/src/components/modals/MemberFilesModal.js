import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as Upload } from '../../assets/upload.svg';
import viewFile from '../../utils/viewFile';
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
        <div className={`file-drop${isDragging ? ' drag-over' : ''}`} {...dragProps}>
            <div className={`file-content${isDragging ? ' dimmed' : ''}`}>
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
                    <label>{t('member.files.date')} *</label>
                    <input
                        type="date"
                        value={disabled ? '' : current.date || ''}
                        onChange={handleChange('date')}
                        disabled={disabled}
                    />
                </div>

                <div className="member-box">
                    <div className="member-box-label">
                        {t('member.files.file')} *
                    </div>
                    <div className="member-box-list">
                        <div className="file-container">
                            <div className="file-container-buttons">
                                <button 
                                    className="action-button thin"
                                    onClick={() => document.getElementById('hiddenFileInput').click()}
                                    disabled={disabled}
                                >
                                    Upload
                                </button>
                                <button 
                                    className="action-button thin"
                                    onClick={() => viewFile(current.file)}
                                    disabled={disabled || !current?.file}
                                >
                                    View
                                </button>
                                <button 
                                    className="action-button thin destructive"
                                    onClick={() => handleChange('file')({ target: { files: [] } })}
                                    disabled={disabled || !current?.file}
                                >
                                    Clear
                                </button>
                            </div>
                            <p className="file-container-subtitle">
                                {t('member.files.drop_to_upload')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <input
                id="hiddenFileInput"
                type="file"
                accept="*/*"
                onChange={handleChange('file')}
                style={{ display: 'none' }}
            />

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