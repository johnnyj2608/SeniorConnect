import React, { useState, useEffect } from 'react';
import { ReactComponent as Pencil } from '../../assets/pencil.svg';
import { ReactComponent as FileIcon } from '../../assets/file.svg';
import viewFile from '../../utils/viewFile';
import { formatDate } from '../../utils/formatUtils';

const MemberFilesCard = ({ id, onEdit }) => {
    const [files, setFiles] = useState([]);

    useEffect(() => {
        const getFilesByMember = async () => {
            const response = await fetch(`/core/file/latest/${id}`);
            const data = await response.json();
            setFiles(data);
        };

        if (id !== 'new') {
            getFilesByMember();
        }
    }, [id]);

    const handleEdit = () => {
        const getFileTabVersionsByMember = async () => {
            const response = await fetch(`/core/file/member/${id}`);
            const data = await response.json();
            onEdit('files', data, setFiles);
        };
        getFileTabVersionsByMember();
    };

    return (
        <div className="member-full-card">
            <h2>Files</h2>
            <div className="member-container">
                <Pencil className="edit-icon" onClick={handleEdit} />
                {files.length > 0 ? (
                    <div className="file-list">
                        {files.map((file, index) => {
                            const content = file.content;
                            const isExpired = content?.expiration_date && new Date(content.expiration_date) < new Date();
                            const tooltipText = `Completed: ${formatDate(content?.completion_date) || 'N/A'}`;

                            return (
                                <div
                                    key={index}
                                    className="file-item tooltip"
                                    onClick={() => content?.file && viewFile(content.file)}
                                    data-tooltip={tooltipText}
                                >
                                    <FileIcon className="file-icon" />
                                    <p className={`file-name ${isExpired ? 'file-name-expired' : ''}`}>
                                        {file.name}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p>No files uploaded</p>
                )}
        </div>
    </div>
    );
};

export default MemberFilesCard;