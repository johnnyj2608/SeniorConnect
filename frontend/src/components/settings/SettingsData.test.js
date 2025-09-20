import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsData from './SettingsData';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

jest.mock('../../utils/fetchWithRefresh');

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

describe('SettingsData', () => {
    let mockOpenModal;

    beforeEach(() => {
        mockOpenModal = jest.fn();

        global.URL.createObjectURL = jest.fn(() => 'mock-url');
        global.URL.revokeObjectURL = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('calls exportMemberCSV when download members is clicked', async () => {
        const mockBlob = new Blob(['test'], { type: 'text/csv' });

        fetchWithRefresh.mockResolvedValue({
            ok: true,
            blob: jest.fn().mockResolvedValue(mockBlob),
        });

        render(<SettingsData openModal={mockOpenModal} />);
        fireEvent.click(screen.getByText('settings.data.download_members'));

        await waitFor(() => {
            expect(fetchWithRefresh).toHaveBeenCalledWith('/core/members/csv/');
            expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
        });
    });

    it('calls openModal with type "import" when upload members is clicked', () => {
        render(<SettingsData openModal={mockOpenModal} />);
        fireEvent.click(screen.getByText('settings.data.upload_members'));

        expect(mockOpenModal).toHaveBeenCalledWith({
            type: 'import',
            data: { name: '', date: '', file: '' },
        });
    });

    it('calls openModal with type "deleted" when restore deleted is clicked', async () => {
        const mockData = [];
        fetchWithRefresh.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(mockData),
        });

        render(<SettingsData openModal={mockOpenModal} />);
        fireEvent.click(screen.getByText('settings.data.restore_deleted'));

        await waitFor(async () => {
            expect(mockOpenModal).toHaveBeenCalled();
            const { fetchData } = mockOpenModal.mock.calls[0][0];
            await expect(fetchData()).resolves.toBe(mockData);
        });
    });
});