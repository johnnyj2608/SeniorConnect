import React, { memo } from 'react';
import { ReactComponent as FileIcon } from '../../assets/file.svg';
import { openFile } from '../../utils/fileUtils';

const FileItem = ({ file }) => {

    const handleClick = () => {
        if (file.file) openFile(file.file);
    };

    return (
        <div
            className="file-item"
            onClick={handleClick}
            >
            <FileIcon className="file-icon" />
            <p className={'file-name'}>
                {file.name}
            </p>
        </div>
    );
};

export default memo(FileItem);