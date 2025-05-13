import React, { useState } from 'react';
import { ReactComponent as Eye } from '../../assets/eye.svg';
import { ReactComponent as Trash } from '../../assets/trash.svg';
import { ReactComponent as Upload } from '../../assets/upload.svg';
import viewFile from '../../utils/viewFile';
import { formatDate } from '../../utils/formatUtils';

const MemberFilesModal = ({ data, handleChange, activeTab }) => {
    const isNew = activeTab === 'new';
    const [isDragging, setIsDragging] = useState(false);

    const fileItem = isNew
        ? { name: '', file: '', completion_date: '', expiration_date: '', edited: true }
        : data[activeTab] || {};

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            const fakeEvent = { target: { files: [file] } };
            handleChange('file')(fakeEvent);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    return (
        <div
            className={`file-drop ${isDragging ? 'drag-over' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
            <div className={`file-content ${isDragging ? 'dimmed' : ''}`}>
                <h3>{isNew ? 'Add New File' : 'Edit File'}</h3>

                <div className="member-detail">
                    <label>Name *</label>
                    <input
                        type="text"
                        value={fileItem.name || ''}
                        onChange={handleChange('name')}
                        autoComplete="off"
                    />
                </div>

                <div className="member-detail">
                    <label>Upload File *</label>
                    <div className="file-container">
                        <button
                            className="custom-file-button"
                            onClick={() => document.getElementById('hiddenFileInput').click()}
                        >
                            Choose File
                        </button>
                        <span className={`uploaded-file-name ${!fileItem.file ? 'no-file-chosen' : ''}`}>
                            {fileItem.file ? 'File chosen' : 'No file chosen'}
                        </span>
                        <input
                            id="hiddenFileInput"
                            type="file"
                            accept="*/*"
                            onChange={handleChange('file')}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>

                <div className="member-detail">
                    <label>Completed</label>
                    <input
                        type="date"
                        value={fileItem.completion_date || ''}
                        onChange={handleChange('completion_date')}
                    />
                </div>

                <div className="member-detail">
                    <label>Expiration</label>
                    <input
                        type="date"
                        value={fileItem.expiration_date || ''}
                        onChange={handleChange('expiration_date')}
                    />
                </div>

                <div className="file-buttons">
                    <button
                        className="arrow-btn tooltip"
                        onClick={() => viewFile(fileItem.file)}
                        disabled={!fileItem.file}
                        data-tooltip="View File"
                    >
                        <Eye />
                    </button>
                    {!isNew && (
                        <button
                            className="arrow-btn tooltip trash-can"
                            onClick={() => handleChange('deleted')({ target: { value: true } })}
                            data-tooltip="Delete File"
                        >
                            <Trash />
                        </button>
                    )}
                </div>

                <div className="file-footer">
                    {fileItem.uploaded_at && (
                        <p>Uploaded: {formatDate(fileItem.uploaded_at)}</p>
                    )}
                </div>
            </div>

            {isDragging && (
                <div className="upload-overlay">
                    <Upload className="upload-icon pulse" />
                    <p>Drop file to upload</p>
                </div>
            )}
        </div>
    );
};

export default MemberFilesModal;