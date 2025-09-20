import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MemberPage from './MemberPage';
import fetchWithRefresh from '../utils/fetchWithRefresh';
import { BrowserRouter } from 'react-router';

jest.mock('../utils/fetchWithRefresh');

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useParams: () => ({ id: '123' }),
    useNavigate: () => jest.fn(),
}));

jest.mock('../components/cards/MemberPhotoCard', () => () => <div>PhotoCard</div>);
jest.mock('../components/cards/MemberInfoCard', () => () => <div>InfoCard</div>);
jest.mock('../components/cards/MemberAuthCard', () => () => <div>AuthCard</div>);
jest.mock('../components/cards/MemberContactCard', () => () => <div>ContactCard</div>);
jest.mock('../components/cards/MemberAbsenceCard', () => () => <div>AbsenceCard</div>);
jest.mock('../components/cards/MemberGiftedCard', () => () => <div>GiftedCard</div>);
jest.mock('../components/cards/MemberFileCard', () => () => <div>FileCard</div>);
jest.mock('../components/layout/MemberHeader', () => () => <div>MemberHeader</div>);
jest.mock('./ModalPage', () => () => <div>ModalPage</div>);
jest.mock('../components/buttons/AddButton', () => () => <div>AddButton</div>);

const mockHandleDelete = jest.fn();
const mockHandleStatus = jest.fn();
let mockModalOpen = false;

jest.mock('../hooks/useMembers', () => () => ({
    handleDelete: mockHandleDelete,
    handleStatus: mockHandleStatus,
}));

jest.mock('../hooks/useModalOpen', () => () => ({
    modalOpen: mockModalOpen,
    modalData: { type: 'info' },
    openModal: jest.fn(),
    closeModal: jest.fn(),
}));

describe('MemberPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockModalOpen = false;
    });

    const renderPage = () =>
        render(
            <BrowserRouter>
                <MemberPage />
            </BrowserRouter>
        );

    const mockMemberData = {
        info: { active: true },
        auth: {},
        contacts: [],
        absences: [],
        gifts: [],
        files: [],
        photo: null,
    };

    it('renders header and photo card', async () => {
        fetchWithRefresh.mockResolvedValueOnce({
            ok: true,
            json: async () => mockMemberData,
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText('MemberHeader')).toBeInTheDocument();
            expect(screen.getByText('PhotoCard')).toBeInTheDocument();
        });
    });

    it('renders all member cards', async () => {
        fetchWithRefresh.mockResolvedValueOnce({
            ok: true,
            json: async () => mockMemberData,
        });

        renderPage();

        await waitFor(() => {
            ['InfoCard', 'AuthCard', 'ContactCard', 'AbsenceCard', 'GiftedCard', 'FileCard', 'AddButton'].forEach((card) => {
                expect(screen.getByText(card)).toBeInTheDocument();
            });
        });
    });

    it('renders action buttons and triggers handleStatus and handleDelete', async () => {
        fetchWithRefresh.mockResolvedValueOnce({
            ok: true,
            json: async () => mockMemberData,
        });

        renderPage();

        await waitFor(() => {
            const deactivateButton = screen.getByText('general.buttons.deactivate');
            const deleteButton = screen.getByText('general.buttons.delete');

            fireEvent.click(deactivateButton);
            fireEvent.click(deleteButton);

            expect(mockHandleStatus).toHaveBeenCalledTimes(1);
            expect(mockHandleDelete).toHaveBeenCalledTimes(1);
        });
    });

    it('renders ModalPage when modalOpen is true', async () => {
        fetchWithRefresh.mockResolvedValueOnce({
            ok: true,
            json: async () => mockMemberData,
        });

        mockModalOpen = true;
        renderPage();

        await waitFor(() => {
            expect(screen.getByText('ModalPage')).toBeInTheDocument();
        });
    });
});