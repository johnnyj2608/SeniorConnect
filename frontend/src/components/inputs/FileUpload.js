import React from 'react';
import { useTranslation } from 'react-i18next';
import viewFile from '../../utils/viewFile';

const FileUpload = ({ current, disabled, handleChange, required=false, autoFill=false }) => {
    const { t } = useTranslation();

    return (
        <>
        <div className="member-box">
            <div className="member-box-label">
                {`${t('member.files.file')}${required ? ' *' : ''}`}
            </div>
            <div className="member-box-list">
                <div className="file-container">
                    <div className="file-container-buttons">
                        <button
                            className="action-button thin"
                            onClick={() => document.getElementById('hiddenFileInput').click()}
                            disabled={disabled}
                        >
                            {t('general.buttons.upload')}
                        </button>
                        <button
                            className="action-button thin"
                            onClick={() => viewFile(current.file)}
                            disabled={disabled || !current?.file}
                        >
                            {t('general.buttons.view')}
                        </button>
                        <button
                            className="action-button thin destructive"
                            onClick={() => handleChange('file')({ target: { value: '' } })}
                            disabled={disabled || !current?.file}
                        >
                            {t('general.buttons.clear')}
                        </button>
                    </div>
                    <p className="file-container-subtitle">
                        {t('member.files.drop_to_upload')}
                    </p>
                </div>
            </div>
        </div>
        <input
            id="hiddenFileInput"
            type="file"
            accept="*/*"
            onChange={(e) => {
                handleChange('file')(e);

                if (autoFill) {
                    const file = e.target.files[0];
                    const today = new Date().toISOString().split('T')[0];
                    
                    handleChange('name')({ target: { value: file.name } });
                    handleChange('date')({ target: { value: today } });
                }
                
            }}
            style={{ display: 'none' }}
        />
        </>
    );
};

export default FileUpload;