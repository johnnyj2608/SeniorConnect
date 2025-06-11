import React from 'react';
import { ReactComponent as Upload } from '../../assets/upload.svg';
import { useTranslation } from 'react-i18next';

const DragOverlay = ({ disabled }) => {
    const { t } = useTranslation();

    if (disabled) return null;

    return (
        <div className={"upload-overlay"}>
            <Upload className="upload-icon pulse" />
            <p>{t('member.files.drop_to_upload')}</p>
        </div>
    );
};

export default DragOverlay;