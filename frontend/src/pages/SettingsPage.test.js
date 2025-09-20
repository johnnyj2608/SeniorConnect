import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsPage from './SettingsPage';
import { AuthContext } from '../context/AuthContext';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../components/settings/SettingsAdmin', () => () => <div>SettingsAdmin</div>);
jest.mock('../components/settings/SettingsPreferences', () => () => <div>SettingsPreferences</div>);
jest.mock('../components/settings/SettingsData', () => () => <div>SettingsData</div>);
jest.mock('../components/settings/SettingsSupport', () => () => <div>SettingsSupport</div>);
jest.mock('../components/settings/SettingsAccount', () => () => <div>SettingsAccount</div>);
jest.mock('../components/layout/SettingsItem', () => ({ label, isActive, onClick }) => (
    <button onClick={onClick} data-active={isActive}>{label}</button>
));
jest.mock('./ModalPage', () => ({ data, onClose }) => <div>ModalPage</div>);

let mockModalOpen = false;
jest.mock('../hooks/useModalOpen', () => () => ({
    modalOpen: mockModalOpen,
    modalData: {},
    openModal: jest.fn(),
    closeModal: jest.fn(),
}));

describe('SettingsPage', () => {
    const renderPage = (user = { is_org_admin: true }) => {
        return render(
            <AuthContext.Provider value={{ user }}>
                <SettingsPage />
            </AuthContext.Provider>
        );
    };

    beforeEach(() => {
        mockModalOpen = false;
    });

    it('renders page header', () => {
        renderPage();
        expect(screen.getByText(/general.settings/i)).toBeInTheDocument();
    });

    it('renders all nav items', () => {
        renderPage();
        const navLabels = [
            'settings.admin.label',
            'settings.preferences.label',
            'settings.data.label',
            'settings.support.label',
            'settings.account.label',
        ];
        navLabels.forEach((label) => {
            expect(screen.getByText(label)).toBeInTheDocument();
        });
    });

    it('highlights active section and changes active section on click', () => {
        renderPage();
        const accountButton = screen.getByText('settings.account.label');

        // Initially first section is active
        const firstButton = screen.getByText('settings.admin.label');
        expect(firstButton.dataset.active).toBe('true');

        // Click another section
        fireEvent.click(accountButton);
        expect(accountButton.dataset.active).toBe('true');
    });

    it('renders all settings sections', () => {
        renderPage();
        ['SettingsAdmin', 'SettingsPreferences', 'SettingsData', 'SettingsSupport', 'SettingsAccount'].forEach((section) => {
            expect(screen.getByText(section)).toBeInTheDocument();
        });
    });

    it('renders ModalPage when modalOpen is true', () => {
        mockModalOpen = true;
        jest.resetModules();
        renderPage();
        expect(screen.getByText('ModalPage')).toBeInTheDocument();
    });
});