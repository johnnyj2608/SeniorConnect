import React, { useState, useEffect } from 'react';
import { formatPhoto } from '../../utils/formatUtils';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const MemberBasicModal = ({ data, handleChange }) => {
    return (
        <>
            <h3>Edit Details</h3>
            <div className="member-detail">
                <label>Member ID *</label>
                <input
                    type="number"
                    value={data.sadc_member_id || ''}
                    onChange={handleChange('sadc_member_id')}
                    placeholder="Required"
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>Last Name *</label>
                <input
                    type="text"
                    value={data.last_name || ''}
                    onChange={handleChange('last_name')}
                    placeholder="Required"
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>First Name *</label>
                <input
                    type="text"
                    value={data.first_name || ''}
                    onChange={handleChange('first_name')}
                    placeholder="Required"
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>Birth Date *</label>
                <input
                    type="date"
                    value={data.birth_date || ''}
                    onChange={handleChange('birth_date')}
                />
            </div>

            <div className="member-detail">
                <label>Phone</label>
                <input
                    type="number"
                    value={data.phone || ''}
                    onChange={handleChange('phone')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>Address</label>
                <input
                    type="text"
                    value={data.address || ''}
                    onChange={handleChange('address')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>Email</label>
                <input
                    type="text"
                    value={data.email || ''}
                    onChange={handleChange('email')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>Medicaid</label>
                <input
                    type="text"
                    value={data.medicaid?.toUpperCase() || ''}
                    onChange={handleChange('medicaid')}
                    autoComplete="off"
                />
            </div>
            
            <div className="member-detail">
                <label>SSN</label>
                <input
                    type="text"
                    value={data.ssn || ''}
                    onChange={handleChange('ssn')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>Enrollment</label>
                <input
                    type="date"
                    value={data.enrollment_date || ''}
                    onChange={handleChange('enrollment_date')}
                />
            </div>

            <div className="member-detail">
                <label>Note</label>
                <input
                    type="text"
                    value={data.note || ''}
                    onChange={handleChange('note')}
                    autoComplete="off"
                />
            </div>
        </>
    );
};

const MemberSideBasicModal = ({ data, handleChange }) => {
    const [languageOptions, setLanguageOptions] = useState([]);

    useEffect(() => {
        const getLanguageOptions = async () => {
            try {
                const response = await fetchWithRefresh('/core/languages/');
                if (!response.ok) return;

                const data = await response.json();
                setLanguageOptions(data);
            } catch (error) {
                console.error('Failed to fetch language options:', error);
            }
        };

        getLanguageOptions();
    }, []);

    return (
        <>
            <div className="photo-container">
                <img
                    src={formatPhoto(data.photo)}
                    alt={data.first_name ? `${data.first_name} ${data.last_name}` : "Member"} 
                    className="preview-photo"
                    onError={(e) => e.target.src = "/default-profile.jpg"}
                />
                <label htmlFor="image-upload" className="image-upload">
                    Choose Photo
                </label>
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleChange('photo')}
                    style={{ display: 'none' }}
                />
            </div>
            <div className="member-detail">
                <label>Gender *</label>
                <div className="radio-group">
                    <label>Male</label>
                    <input
                        type="radio"
                        name="gender"
                        value="M"
                        checked={data.gender === 'M'}
                        onChange={handleChange('gender')}
                    />
                    <label>Female</label>
                    <input
                        type="radio"
                        name="gender"
                        value="F"
                        checked={data.gender === 'F'}
                        onChange={handleChange('gender')}
                    />
                </div>
            </div>

            <div className="member-detail">
                <label>Language</label>
                <select 
                    value={data?.language || 0} 
                    onChange={handleChange('language')}>
                <option value="">Select an option</option>
                {languageOptions.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
                </select>
            </div>
        </>
    );
};

export { MemberBasicModal, MemberSideBasicModal };
