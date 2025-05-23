import React, { useContext, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import ModalPage from './ModalPage';

const SettingsPage = () => {
    const navigate = useNavigate()
    const { user, setUser } = useContext(AuthContext)
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);

    const handleModalOpen = useCallback(async () => {
        if (!user?.is_admin_user) return;

        try {
            const response = await fetch(`/user/users`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setModalData({ type: "users", data });
            setModalOpen(true);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Could not load users. Please try again.');
        }
    }, [user]);


    const handleModalClose = useCallback(() => {
        setModalOpen(false)
        setModalData(null)
    }, [])

    const handleLogout = async () => {
        try {
            const response = await fetch('/user/auth/logout/', {
                method: 'POST',
                credentials: 'include',
            })

            if (!response.ok) {
                throw new Error('Logout failed')
            }

            setUser(null)

            console.log('Logged out successfully')
            navigate('/login')
        } catch (error) {
            console.error('Logout error:', error)
            alert('Logout failed. Please try again.')
        }
    }

    return (
        <>
            <div className="page-header">
                <div className="page-title-row">
                    <h2 className="page-title">&#9782; Settings</h2>
                </div>
            </div>

            <div className="settings-content">
                <h3 className="section-title">General</h3>
                <ul className="settings-list">
                    <li>Notifications</li>
                    <li>Dark Mode</li>
                    <li>Localization</li>
                </ul>
            </div>

            <div className="settings-content">
                <h3 className="section-title">Snapshots</h3>
                <ul className="settings-list">
                    <li>Archived Reports (X frequency)</li>
                </ul>
            </div>

            <div className="settings-content">
                <h3 className="section-title">Support</h3>
                <ul className="settings-list">
                    <li>Terms of Service</li>
                    <li>Privacy Policy</li>
                    <li>Support</li>
                </ul>
            </div>

            {user?.is_admin_user && (
                <div className="settings-content">
                    <h3 className="section-title">Admin</h3>
                    <ul className="settings-list">
                        <li className=""
                            onClick={handleModalOpen}>
                            User Management
                        </li>
                    </ul>
                </div>
            )}

            <div className="settings-content">
                <h3 className="section-title">Account</h3>
                <ul className="settings-list">
                    <li className="logout" onClick={handleLogout}>
                        Log out
                    </li>
                </ul>
            </div>

            {modalOpen && (
                <ModalPage
                    data={modalData}
                    onClose={handleModalClose}
                />
            )}
        </>
    )
}

export default SettingsPage