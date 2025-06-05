import React, { memo } from 'react';
import { ReactComponent as FileIcon } from '../../assets/file.svg';
import viewFile from '../../utils/viewFile';
import { formatDate } from '../../utils/formatUtils';

const FileItem = ({ file }) => {
    const isExpired = file.expiration_date && new Date(file.expiration_date) < new Date();
    const tooltipText = `Completed: ${formatDate(file.completion_date) || 'N/A'}`;

    const handleClick = () => {
        if (file.file) viewFile(file.file);
    };

    return (
        <div
            className="file-item tooltip"
            onClick={handleClick}
            data-tooltip={tooltipText}
            >
            <FileIcon className="file-icon" />
            <p className={`file-name${isExpired ? ' file-expired' : ''}`}>
                {file.name}
            </p>
        </div>
    );
};

export default memo(FileItem);