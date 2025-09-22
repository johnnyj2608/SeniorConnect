import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { useNavigate } from 'react-router';
import SettingsSupport from './SettingsSupport';

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
    }),
}));

describe('SettingsSupport', () => {
    let mockNavigate;

    beforeEach(() => {
        mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders all support items', () => {
        render(
            <MemoryRouter>
                <SettingsSupport />
            </MemoryRouter>
        );

        expect(screen.getByText('settings.support.terms')).toBeInTheDocument();
        expect(screen.getByText('settings.support.privacy')).toBeInTheDocument();
        expect(screen.getByText('settings.support.help')).toBeInTheDocument();
    });

    it('navigates to correct paths when items are clicked', () => {
        render(
            <MemoryRouter>
                <SettingsSupport />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('settings.support.terms'));
        expect(mockNavigate).toHaveBeenCalledWith('/support/terms');

        fireEvent.click(screen.getByText('settings.support.privacy'));
        expect(mockNavigate).toHaveBeenCalledWith('/support/privacy');

        fireEvent.click(screen.getByText('settings.support.help'));
        expect(mockNavigate).toHaveBeenCalledWith('/support/help');
    });
});