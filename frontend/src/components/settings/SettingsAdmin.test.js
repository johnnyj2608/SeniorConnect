import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsAdmin from './SettingsAdmin';
import { AuthContext } from '../../context/AuthContext';
import { MltcContext } from '../../context/MltcContext';
import { GiftContext } from '../../context/GiftContext';
import { UserContext } from '../../context/UserContext';
import { SadcContext } from '../../context/SadcContext';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

describe('SettingsAdmin', () => {
    let mockOpenModal;
    let mockRefreshMltc;
    let mockRefreshGift;
    let mockRefreshUser;
    let mockRefreshSadc;

    const renderComponent = (user = { is_org_admin: true }) => {
        mockOpenModal = jest.fn();
        mockRefreshMltc = jest.fn().mockResolvedValue([]);
        mockRefreshGift = jest.fn().mockResolvedValue([]);
        mockRefreshUser = jest.fn().mockResolvedValue([]);
        mockRefreshSadc = jest.fn().mockResolvedValue([]);

        render(
            <AuthContext.Provider value={{ user }}>
                <MltcContext.Provider value={{ refreshMltc: mockRefreshMltc }}>
                    <GiftContext.Provider value={{ refreshGift: mockRefreshGift }}>
                        <UserContext.Provider value={{ refreshUser: mockRefreshUser }}>
                            <SadcContext.Provider value={{ refreshSadc: mockRefreshSadc }}>
                                <SettingsAdmin openModal={mockOpenModal} />
                            </SadcContext.Provider>
                        </UserContext.Provider>
                    </GiftContext.Provider>
                </MltcContext.Provider>
            </AuthContext.Provider>
        );
    };

    it('calls openModal with fetchData for sadcs', async () => {
        renderComponent();
        fireEvent.click(screen.getByText('settings.admin.sadc.label'));

        expect(mockOpenModal).toHaveBeenCalled();
        const { fetchData } = mockOpenModal.mock.calls[0][0];
        await fetchData();
        expect(mockRefreshSadc).toHaveBeenCalled();
    });

    it('calls openModal with fetchData for mltcs', async () => {
        renderComponent();
        fireEvent.click(screen.getByText('settings.admin.mltcs.label'));

        expect(mockOpenModal).toHaveBeenCalled();
        const { fetchData } = mockOpenModal.mock.calls[0][0];
        await fetchData();
        expect(mockRefreshMltc).toHaveBeenCalled();
    });

    it('calls openModal with fetchData for gifts', async () => {
        renderComponent();
        fireEvent.click(screen.getByText('settings.admin.gifts.label'));

        expect(mockOpenModal).toHaveBeenCalled();
        const { fetchData } = mockOpenModal.mock.calls[0][0];
        await fetchData();
        expect(mockRefreshGift).toHaveBeenCalled();
    });

    it('calls openModal with fetchData for users if org admin', async () => {
        renderComponent({ is_org_admin: true });
        fireEvent.click(screen.getByText('settings.admin.users.label'));

        expect(mockOpenModal).toHaveBeenCalled();
        const { fetchData } = mockOpenModal.mock.calls[0][0];
        await fetchData();
        expect(mockRefreshUser).toHaveBeenCalled();
    });

    it('does not render users button if not org admin', () => {
        renderComponent({ is_org_admin: false });
        expect(screen.queryByText('settings.admin.users.label')).not.toBeInTheDocument();
    });
});
