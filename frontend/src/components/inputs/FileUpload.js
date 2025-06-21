import React from 'react';
import { useTranslation } from 'react-i18next';
import viewFile from '../../utils/viewFile';

const FileUpload = ({
    current,
    disabled,
    handleChange,
    required = false,
    autoFill = false,
    fileTypes = '*/*'
}) => {
    const { t } = useTranslation();

    const VIEWABLE_MIME_TYPES = new Set([
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'image/bmp',
    ]);

    const VIEWABLE_EXTENSIONS = new Set([
        'pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'
    ]);

    const isFileViewable = (file) => {
        if (!file) return false;

        if (file.type) {
            return VIEWABLE_MIME_TYPES.has(file.type);
        }

        const extension = file.name?.split('.').pop().toLowerCase() || '';
        return VIEWABLE_EXTENSIONS.has(extension);
    };

    const showViewButton = isFileViewable(current.file);

    const getSubtitle = () => {
        if (!fileTypes || fileTypes === '*/*') {
            return t('member.files.drop_to_upload');
        }

        const types = fileTypes
            .split(',')
            .map(type => type.trim().replace('.', '').toUpperCase())
            .join(', ');

        return `${t('member.files.drop_to_upload')} (${types})`;
    };

    return (
        <>
        <div className="member-box">
            <div className="member-box-label">
                {`${t('member.files.file')}${required ? ' *' : ''}`}
            </div>
            <div className="member-box-content">
                <div className="file-container">
                    <div className="file-container-buttons">
                        <button
                            className="action-button thin"
                            onClick={() => document.getElementById('hiddenFileInput').click()}
                            disabled={disabled}
                        >
                            {t('general.buttons.upload')}
                        </button>
                        {showViewButton && (
                             <button
                                className="action-button thin"
                                onClick={() => viewFile(current.file)}
                                disabled={disabled || !current?.file}
                            >
                                {t('general.buttons.view')}
                            </button>
                        )}
                        <button
                            className="action-button thin destructive"
                            onClick={() => {
                                handleChange('file')({ target: { value: '' } });
                        
                                if (autoFill) {
                                    handleChange('name')({ target: { value: '' } });
                                    handleChange('date')({ target: { value: '' } });
                                }
                            }}
                            disabled={disabled || !current?.file}
                        >
                            {t('general.buttons.clear')}
                        </button>
                    </div>
                    <p className="file-container-subtitle">{getSubtitle()}</p>
                </div>
            </div>
        </div>
        <input
            id="hiddenFileInput"
            type="file"
            accept={fileTypes}
            onChange={(e) => {
                handleChange('file')(e);

                if (autoFill) {
                    const file = e.target.files[0];
                    const today = new Date().toISOString().split('T')[0];
                    
                    handleChange('name')({ target: { value: file?.name } });
                    handleChange('date')({ target: { value: today } });
                }
                
            }}
            style={{ display: 'none' }}
        />
        </>
    );
};

export default FileUpload;