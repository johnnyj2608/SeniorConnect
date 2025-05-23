import React, { useState, useEffect, memo } from 'react';
import { ReactComponent as Pencil } from '../../assets/pencil.svg';
import { ReactComponent as FileIcon } from '../../assets/file.svg';
import viewFile from '../../utils/viewFile';
import { formatDate } from '../../utils/formatUtils';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const MemberFilesCard = ({ id, onEdit }) => {
    const [files, setFiles] = useState([]);

    useEffect(() => {
        if (id === 'new') return;

        const getFilesByMember = async () => {
            try {
                const response = await fetchWithRefresh(`/core/files/member/${id}`);
                if (!response.ok) return;

                const data = await response.json();
                setFiles(data);
            } catch (error) {
                console.error('Failed to fetch files by member:', error);
            }
        };

        getFilesByMember();
    }, [id]);

    const handleEdit = () => {
        onEdit('files', files, setFiles);
    };

    return (
        <div className="full-card">
            <h2>Files</h2>
            <div className="card-container">
                <Pencil className="edit-icon" onClick={handleEdit} />
                {files.length > 0 ? (
                    <div className="file-list">
                        {files.map((file, index) => {
                            const isExpired = file.expiration_date && new Date(file.expiration_date) < new Date();
                            const tooltipText = `Completed: ${formatDate(file.completion_date) || 'N/A'}`;

                            return (
                                <div
                                    key={index}
                                    className="file-item tooltip"
                                    onClick={() => file.file && viewFile(file.file)}
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

export default memo(MemberFilesCard);