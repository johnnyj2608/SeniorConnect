import React from 'react'
import { formatDate } from '../../utils/formatUtils'
import { ReactComponent as ArrowLeft } from '../../assets/arrow-left.svg'
import { ReactComponent as ArrowRight } from '../../assets/arrow-right.svg'

const MemberFilesModal = ({ data, handleChange, activeTab }) => {
    const current = data[activeTab] || {};

    const disabled = data.filter(tab => !tab.deleted).length <= 0

    return (
        <>
            <h3>Edit Files</h3>
            <div className="member-detail">
                <label>Name *</label>
                <input
                    type="text"
                    value={disabled ? '' : current.tab || ''}
                    onChange={handleChange('tab')}
                    autoComplete="off"
                    disabled={disabled}
                />
            </div>
            <div className="member-detail file-input">
                <label>Upload File *</label>
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleChange('file')}
                    disabled={disabled}
                />
            </div>
            <div className="member-detail">
                <label>Completed</label>
                <input
                    type="date"
                    value={disabled ? '' : current.completion_date || ''}
                    onChange={handleChange('completion_date')}
                    disabled={disabled}
                />
            </div>
            <div className="member-detail">
                <label>Expiration</label>
                <input
                    type="date"
                    value={disabled ? '' : current.expiration_date || ''}
                    onChange={handleChange('expiration_date')}
                    disabled={disabled}
                />
            </div>
            <div className="file-nav">
                <ArrowLeft className="arrow-btn" />
                <h4>{(!disabled && current.uploaded_at) ? `Uploaded: ${formatDate(current.uploaded_at)}` : ''}</h4>
                <ArrowRight className="arrow-btn" />
            </div>
        </>
    )
}

export default MemberFilesModal