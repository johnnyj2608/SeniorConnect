import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsPreferences from './SettingsPreferences';
import { AuthContext } from '../../context/AuthContext';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

jest.mock('../../utils/fetchWithRefresh');

const mockChangeLanguage = jest.fn();

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: {
            language: 'en',
            changeLanguage: mockChangeLanguage,
        },
    }),
}));

const mockUser = {
    id: 1,
    preferences: { dark_mode: false, alt_name: true, language: 'en' },
};

const renderComponent = () => {
    const setUser = jest.fn();

    render(
        <AuthContext.Provider value={{ user: mockUser, setUser }}>
            <SettingsPreferences />
        </AuthContext.Provider>
    );

    return { setUser };
};

describe('SettingsPreferences', () => {
    beforeEach(() => {
        fetchWithRefresh.mockReset();
        localStorage.clear();
        mockChangeLanguage.mockReset();
    });

    it('changes language', async () => {
        const { setUser } = renderComponent();

        fetchWithRefresh.mockResolvedValue({
            ok: true,
            json: async () => ({
                ...mockUser,
                preferences: { ...mockUser.preferences, language: 'zh-CN' },
            }),
        });

        const languageSelect = screen.getByRole('combobox');
        fireEvent.change(languageSelect, { target: { value: 'zh-CN' } });

        await waitFor(() => expect(fetchWithRefresh).toHaveBeenCalled());
        expect(setUser).toHaveBeenCalled();
        expect(localStorage.getItem('language')).toBe('"zh-CN"');
        expect(mockChangeLanguage).toHaveBeenCalledWith('zh-CN');
    });
});
