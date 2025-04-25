import React, { useState, useEffect } from 'react';
import { ReactComponent as Pencil } from '../../assets/pencil.svg';
import { ReactComponent as FileIcon } from '../../assets/file.svg';

const MemberFilesCard = ({ id, onEdit }) => {
    const [files, setFiles] = useState([]);

    useEffect(() => {
        const getFileTabsByMember = async () => {
            const response = await fetch(`/core/file-tabs/latest/${id}`);
            const data = await response.json();
            setFiles(data);
        };

        if (id !== 'new') {
            getFileTabsByMember();
        }
    }, [id]);

    const handleEdit = () => {
        const getFileVersionsByTab = async () => {
            const response = await fetch(`/core/file-tabs/member/${id}`);
            const data = await response.json();
            onEdit('files', data, setFiles);
        };
        getFileVersionsByTab();
    };

    const openFileInNewTab = (fileUrl) => {
        window.open(fileUrl, '_blank');
    };

    return (
        <div className="member-full-card">
        <h2>Files</h2>
        <div className="member-container">
            <Pencil className="edit-icon" onClick={handleEdit} />
            {Object.keys(files).length > 0 ? (
                <div className="file-list">
                    {Object.entries(files).map(([name, version], index) => {
                        const isExpired = version.expiration_date && new Date(version.expiration_date) < new Date();
                        const tooltipText = `Completed: ${version.completion_date || 'N/A'}\nExpires: ${version.expiration_date || 'N/A'}`;
                        return (
                            <div
                                key={index}
                                className="file-item"
                                onClick={() => openFileInNewTab(version.file)}
                                title={tooltipText}
                            >
                                <FileIcon className="file-icon" />
                                <p className={`file-name ${isExpired ? 'file-name-expired' : ''}`}>{name}</p>
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