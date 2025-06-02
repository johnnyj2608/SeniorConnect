import React, { memo } from 'react';
import { ReactComponent as FileIcon } from '../../assets/file.svg';
import viewFile from '../../utils/viewFile';

const FileItem = ({ file }) => {
    const isExpired = file.expiration_date && new Date(file.expiration_date) < new Date();

    const handleClick = () => {
        if (file.file) viewFile(file.file);
    };

    return (
        <div
            className="file-item tooltip"
            onClick={handleClick}
            >
            <FileIcon className="file-icon" />
            <p className={`file-name ${isExpired ? 'file-expired' : ''}`}>
                {file.name}
            </p>
        </div>
    );
};

export default memo(FileItem);