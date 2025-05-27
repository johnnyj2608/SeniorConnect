import React, { useState, useEffect, memo } from 'react';
import EditButton from '../buttons/EditButton';
import FileItem from '../items/FileItem';
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