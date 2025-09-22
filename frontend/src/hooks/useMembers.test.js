import { renderHook, act } from '@testing-library/react';
import useMembers from './useMembers';
import fetchWithRefresh from '../utils/fetchWithRefresh';

jest.mock('../utils/fetchWithRefresh');

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => mockNavigate,
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

describe('useMembers', () => {
    let setMemberData;

    beforeEach(() => {
        jest.clearAllMocks();
        setMemberData = jest.fn();
        global.confirm = jest.fn();
    });

    it('cancels delete if confirm is false', async () => {
        global.confirm.mockReturnValue(false);

        const { result } = renderHook(() => useMembers(1, setMemberData));

        await act(async () => {
            await result.current.handleDelete();
        });

        expect(fetchWithRefresh).not.toHaveBeenCalled();
        expect(setMemberData).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('deletes member successfully when confirmed', async () => {
        global.confirm.mockReturnValue(true);
        fetchWithRefresh.mockResolvedValue({ ok: true });

        const { result } = renderHook(() => useMembers(1, setMemberData));

        await act(async () => {
            await result.current.handleDelete();
        });

        expect(fetchWithRefresh).toHaveBeenCalledWith('/core/members/1/', expect.any(Object));
        expect(setMemberData).toHaveBeenCalledWith(null);
        expect(mockNavigate).toHaveBeenCalledWith('/members');
    });

    it('updates member status successfully', async () => {
        const mockJson = jest.fn().mockResolvedValue({ active: false });
        fetchWithRefresh.mockResolvedValue({ ok: true, json: mockJson });

        const { result } = renderHook(() => useMembers(1, setMemberData));

        await act(async () => {
            await result.current.handleStatus();
        });

        expect(fetchWithRefresh).toHaveBeenCalledWith('/core/members/1/status/', expect.any(Object));
        expect(setMemberData).toHaveBeenCalledWith(expect.any(Function));

        const updater = setMemberData.mock.calls[0][0];
        const prev = { info: { active: true } };
        expect(updater(prev)).toEqual({ info: { active: false } });
    });

    it('does nothing if id is missing', async () => {
        const { result } = renderHook(() => useMembers(null, setMemberData));

        await act(async () => {
            await result.current.handleDelete();
            await result.current.handleStatus();
        });

        expect(fetchWithRefresh).not.toHaveBeenCalled();
        expect(setMemberData).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});