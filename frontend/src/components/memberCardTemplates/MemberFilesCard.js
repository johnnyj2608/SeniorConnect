import React, { useState, useEffect } from 'react';
import { ReactComponent as Pencil } from '../../assets/pencil.svg';
import { ReactComponent as FileIcon } from '../../assets/file.svg';

const MemberFilesCard = ({ id, onEdit }) => {
    const [files, setFiles] = useState([]);

    useEffect(() => {
        const getFileTabsByMember = async () => {
            const response = await fetch(`/core/file-tabs/member/${id}`);
            const data = await response.json();
            setFiles(data);
        };

        if (id !== 'new') {
            getFileTabsByMember();
        }
    }, [id]);

    const handleEdit = () => {
        onEdit('files', files, setFiles);
    };

    return (
        <div className="member-full-card">
            <h2>Files</h2>
            <div className="member-container">
                <Pencil className="edit-icon" onClick={handleEdit} />
                {files.length > 0 ? (
                    <div className="file-list">
                    {files.map((file, index) => (
                        <div key={index} className="file-item">
                            <FileIcon className="file-icon" />
                            <p className="file-name">{file.name}</p>
                        </div>
                    ))}
                </div>
                ) : (
                    <p>No file tabs</p>
                )}
            </div>
        </div>
    );
};

export default MemberFilesCard;