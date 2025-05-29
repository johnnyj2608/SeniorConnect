import React, { useContext, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import SettingsAccount from '../components/settingsContent/SettingsAccount';
import SettingsData from '../components/settingsContent/SettingsData';
import SettingsGeneral from '../components/settingsContent/SettingsGeneral';
import SettingsSnapshots from '../components/settingsContent/SettingsSnapshots';
import SettingsSupport from '../components/settingsContent/SettingsSupport';
import ModalPage from './ModalPage';
import fetchWithRefresh from '../utils/fetchWithRefresh'
import { ReactComponent as AngleRight } from '../assets/angle-right.svg'

const SettingsPage = () => {
    const navigate = useNavigate()
    const { user, setUser } = useContext(AuthContext)
    const [content, setContent] = useState('General');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);

    const handleModalOpen = useCallback(async () => {
        if (!user?.is_org_admin) return;

        try {
            const response = await fetchWithRefresh(`/user/users`);
            if (!response.ok) return;

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
            const response = await fetchWithRefresh('/user/auth/logout/', {
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

    const getContent = () => {
        switch (content) {
            case 'General':
                return <SettingsGeneral />;
            case 'Data':
                return <SettingsData />;
            case 'Snapshots':
                return <SettingsSnapshots />;
            case 'Support':
                return <SettingsSupport />;
            case 'Account':
                return <SettingsAccount />;
            default:
                return null;
        }
    };    

    return (
        <>
            <div className="page-header">
                <div className="page-title-row">
                    <h2 className="page-title">&#9782; Settings</h2>
                </div>
            </div>

            <div className="settings-body">
                <div className="settings-nav">
                    <div 
                        className="settings-nav-item"
                        onClick={() => setContent('General')}>
                        <span>General</span>
                        <AngleRight/>
                    </div>
                    <div 
                        className="settings-nav-item"
                        onClick={() => setContent('Data')}>
                        <span>Data</span>
                        <AngleRight/>
                    </div>
                    <div 
                        className="settings-nav-item"
                        onClick={() => setContent('Snapshots')}>
                        <span>Snapshots</span>
                        <AngleRight/>
                    </div>
                    <div 
                        className="settings-nav-item"
                        onClick={() => setContent('Support')}>
                        <span>Support</span>
                        <AngleRight/>
                    </div>
                    <div 
                        className="settings-nav-item"
                        onClick={() => setContent('Account')}>
                        <span>Account</span>
                        <AngleRight/>
                    </div>                
                </div>

                <div className="settings-content">
                    {getContent()}
                </div>
            </div>
            
            {/* {user?.is_org_admin && (
                <div className="settings-content">
                    <ul className="settings-list">
                        <li className=""
                            onClick={handleModalOpen}>
                            User Management
                        </li>
                    </ul>
                </div>
            )}

            <div className="settings-content">
                <ul className="settings-list">
                    <li>Reset password</li>
                    <li className="logout" onClick={handleLogout}>
                        Log out
                    </li>
                </ul>
            </div> */}

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