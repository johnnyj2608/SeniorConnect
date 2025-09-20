import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsAccount from './SettingsAccount';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('react-router', () => ({
    useNavigate: jest.fn(),
}));

jest.mock('../../utils/fetchWithRefresh', () => jest.fn());

global.fetch = jest.fn();

describe('SettingsAccount', () => {
    const mockSetUser = jest.fn();
    const mockNavigate = jest.fn();
    const user = { email: 'test@example.com' };

    beforeEach(() => {
        jest.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
    });

    it('renders section title and buttons', () => {
        render(
            <AuthContext.Provider value={{ user, setUser: mockSetUser }}>
                <SettingsAccount />
            </AuthContext.Provider>
        );

        expect(screen.getByText('settings.account.label')).toBeInTheDocument();
        expect(screen.getByText('settings.account.reset_password')).toBeInTheDocument();
        expect(screen.getByText('settings.account.log_out')).toBeInTheDocument();
    });

    it('calls alert and fetch on reset password click', async () => {
        window.alert = jest.fn();
        global.fetch.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValue({ success: true }),
        });

        render(
            <AuthContext.Provider value={{ user, setUser: mockSetUser }}>
                <SettingsAccount />
            </AuthContext.Provider>
        );

        fireEvent.click(screen.getByText('settings.account.reset_password'));

        expect(window.alert).toHaveBeenCalledWith('settings.account.password_reset_instructions');
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/user/auth/reset-password/', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ email: user.email }),
            }));
        });
    });

    it('calls fetchWithRefresh, setUser, and navigate on logout click', async () => {
        fetchWithRefresh.mockResolvedValueOnce({ ok: true });

        render(
            <AuthContext.Provider value={{ user, setUser: mockSetUser }}>
                <SettingsAccount />
            </AuthContext.Provider>
        );

        fireEvent.click(screen.getByText('settings.account.log_out'));

        await waitFor(() => {
            expect(fetchWithRefresh).toHaveBeenCalledWith('/user/auth/logout/', expect.objectContaining({
                method: 'POST',
                credentials: 'include',
            }));
            expect(mockSetUser).toHaveBeenCalledWith(null);
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    it('logs error if logout fetch fails', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        fetchWithRefresh.mockResolvedValueOnce({ ok: false });

        render(
            <AuthContext.Provider value={{ user, setUser: mockSetUser }}>
                <SettingsAccount />
            </AuthContext.Provider>
        );

        fireEvent.click(screen.getByText('settings.account.log_out'));

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        consoleErrorSpy.mockRestore();
    });
});