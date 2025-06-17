import React, { useState } from 'react';

const ListDetail = ({
    label,
    value,
    tabs = null,
    tabContent = {},
}) => {
    const [activeTab, setActiveTab] = useState(tabs?.[0]?.key || '');

    if (!tabs && (value == null || value === '')) return null;

    return (
        <div className="member-box">
            {tabs ? (
                <div className="member-box-label">
                    {tabs.map(({ key, label }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setActiveTab(key)}
                            className={`member-box-tab ${activeTab === key ? 'active' : ''}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            ) : (
                <label className="member-box-label">{label}</label>
            )}

            <div className={`member-box-content${tabs ? ' tabs' : ''}`}>
                {tabs ? tabContent?.[activeTab] ?? null : value}
            </div>
        </div>
    );
};

export default ListDetail;