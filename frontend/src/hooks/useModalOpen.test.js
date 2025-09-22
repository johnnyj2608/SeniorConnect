import { renderHook, act } from '@testing-library/react';
import useModalOpen from './useModalOpen';
import { MltcContext } from '../context/MltcContext';
import { SadcContext } from '../context/SadcContext';
import { GiftContext } from '../context/GiftContext';
import { UserContext } from '../context/UserContext';

describe('useModalOpen', () => {
    const mockRefresh = jest.fn();

    const wrapper = ({ children }) => (
        <MltcContext.Provider value={{ refreshMltc: mockRefresh }}>
            <SadcContext.Provider value={{ refreshSadc: mockRefresh }}>
                <GiftContext.Provider value={{ refreshGift: mockRefresh }}>
                    <UserContext.Provider value={{ refreshUser: mockRefresh }}>
                        {children}
                    </UserContext.Provider>
                </GiftContext.Provider>
            </SadcContext.Provider>
        </MltcContext.Provider>
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('initial state is correct', () => {
        const { result } = renderHook(() => useModalOpen(), { wrapper });
        expect(result.current.modalOpen).toBe(false);
        expect(result.current.modalData).toBeNull();
    });

    it('opens modal with static data', async () => {
        const { result } = renderHook(() => useModalOpen(), { wrapper });

        const data = { name: 'Test' };
        await act(async () => {
            await result.current.openModal({ id: 1, type: 'gifts', setData: jest.fn(), data });
        });

        expect(result.current.modalOpen).toBe(true);
        expect(result.current.modalData).toEqual({
            id: 1,
            type: 'gifts',
            setData: expect.any(Function),
            data,
        });
        expect(mockRefresh).toHaveBeenCalledTimes(1); // refreshGift
    });

    it('opens modal with async fetchData', async () => {
        const { result } = renderHook(() => useModalOpen(), { wrapper });

        const fetchData = jest.fn().mockResolvedValue({ fetched: true });

        await act(async () => {
            await result.current.openModal({ id: 2, type: 'attendance', setData: jest.fn(), fetchData });
        });

        expect(fetchData).toHaveBeenCalled();
        expect(result.current.modalOpen).toBe(true);
        expect(result.current.modalData.data).toEqual({ fetched: true });
        expect(mockRefresh).toHaveBeenCalledTimes(1); // refreshSadc
    });

    it('does not open modal if already loading', async () => {
        const { result } = renderHook(() => useModalOpen(), { wrapper });

        const fetchData = jest.fn().mockImplementation(() => new Promise((res) => setTimeout(() => res({}), 50)));

        act(() => {
            result.current.openModal({ id: 1, type: 'gifts', setData: jest.fn(), fetchData });
            result.current.openModal({ id: 2, type: 'gifts', setData: jest.fn(), fetchData });
        });

        // Only the first call should trigger fetchData and set modal
        expect(fetchData).toHaveBeenCalledTimes(1);
    });

    it('closes modal correctly', async () => {
        const { result } = renderHook(() => useModalOpen(), { wrapper });

        await act(async () => {
            await result.current.openModal({ id: 1, type: 'gifts', setData: jest.fn(), data: { test: true } });
        });

        expect(result.current.modalOpen).toBe(true);

        act(() => {
            result.current.closeModal();
        });

        expect(result.current.modalOpen).toBe(false);
        expect(result.current.modalData).toBeNull();
    });

    it('handles errors gracefully', async () => {
        const { result } = renderHook(() => useModalOpen(), { wrapper });
        const errorFetch = jest.fn().mockRejectedValue(new Error('fail'));

        console.error = jest.fn();

        await act(async () => {
            await result.current.openModal({ id: 1, type: 'gifts', setData: jest.fn(), fetchData: errorFetch });
        });

        expect(console.error).toHaveBeenCalledWith(expect.any(Error));
        expect(result.current.modalOpen).toBe(false);
        expect(result.current.modalData).toBeNull();
    });
});