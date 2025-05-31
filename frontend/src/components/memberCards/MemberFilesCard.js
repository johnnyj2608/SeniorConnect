import React, { memo } from 'react';
import EditButton from '../buttons/EditButton';
import FileItem from '../items/FileItem';

const MemberFilesCard = ({ data, onEdit }) => {
    const files = data || [];

    const handleEdit = () => {
        onEdit('files', files);
    };

    return (
        <div className="full-card">
            <h2>Files</h2>
            <div className="card-container">
                <EditButton onClick={handleEdit} />
                {files.length > 0 ? (
                    <div className="file-list">
                        {files.map((file, index) => (
                            <FileItem key={index} file={file} />
                        ))}
                    </div>
                ) : (
                    <p>No files uploaded</p>
                )}
            </div>
        </div>
    );
};

export default memo(MemberFilesCard);