import React, { useState, useEffect } from 'react';
import { ReactComponent as ArrowLeft } from '../../assets/arrow-left.svg'
import { ReactComponent as ArrowRight } from '../../assets/arrow-right.svg'
import { ReactComponent as Eye } from '../../assets/eye.svg'
import { ReactComponent as Trash } from '../../assets/trash.svg'
import viewFile from '../../utils/viewFile';

const MemberFilesModal = ({ data, handleChange, activeTab }) => {
    const current = data[activeTab] || {};
    const [versions, setVersions] = useState([]);
    const [versionIndex, setVersionIndex] = useState(0);

    useEffect(() => {
        const getFileVersionsByTab = async () => {
            const response = await fetch(`/core/file-versions/tab/${current.id}`);
            const data = await response.json();
            setVersions(data);
            setVersionIndex(0);
        };

        if (current.id !== 'new') {
            getFileVersionsByTab();
        }
    }, [current.id]);

    const currentVersion = versions[versionIndex] || {};

    const disabled = data.filter(tab => !tab.deleted).length <= 0

    const handlePrev = () => {
        setVersionIndex((prev) => (prev > 0 ? prev - 1 : prev));
    };

    const handleNext = () => {
        setVersionIndex((prev) => (prev < versions.length - 1 ? prev + 1 : prev));
    };

    console.log(current)
    console.log(currentVersion)

    return (
        <>
            <h3>Edit Files</h3>
            <div className="member-detail">
                <label>Name *</label>
                <input
                    type="text"
                    value={disabled ? '' : current.name || ''}
                    onChange={handleChange('name')}
                    autoComplete="off"
                    disabled={disabled}
                />
            </div>
            <div className="member-detail">
                <label>Upload File *</label>
                <div className="file-container">
                    <button
                        className="custom-file-button"
                        onClick={() => document.getElementById('hiddenFileInput').click()}
                        disabled={disabled}
                    >
                        Choose File
                    </button>
                    <span className="uploaded-file-name">
                        {currentVersion.file?.split('/').pop() || 'No file chosen'}
                    </span>
                    <input
                        id="hiddenFileInput"
                        type="file"
                        accept="application/pdf"
                        onChange={handleChange('file')}
                        style={{ display: 'none' }}
                    />
                </div>
            </div>
            <div className="member-detail">
                <label>Completed</label>
                <input
                    type="date"
                    value={disabled ? '' : currentVersion.completion_date || ''}
                    onChange={handleChange('completion_date')}
                    disabled={disabled}
                />
            </div>
            <div className="member-detail">
                <label>Expiration</label>
                <input
                    type="date"
                    value={disabled ? '' : currentVersion.expiration_date || ''}
                    onChange={handleChange('expiration_date')}
                    disabled={disabled}
                />
            </div>
            <div className="file-nav">
                <button
                    className="arrow-btn"
                    onClick={handlePrev}
                    disabled={versionIndex === 0}
                >
                    <ArrowLeft />
                </button>
                <div className="file-buttons">
                    <button 
                        className="arrow-btn"
                        onClick={() => viewFile(currentVersion.file)}
                        disabled={!currentVersion.file}
                    >
                        <Eye />
                    </button>
                    <button 
                        className="arrow-btn"
                        onClick={() => console.log('delete version')}
                        disabled={!currentVersion.file}
                    >
                        <Trash />
                    </button>
                </div>
                <button
                    className="arrow-btn"
                    onClick={handleNext}
                    disabled={versionIndex >= versions.length - 1}
                >
                    <ArrowRight />
                </button>
            </div>
        </>
    )
}

export default MemberFilesModal