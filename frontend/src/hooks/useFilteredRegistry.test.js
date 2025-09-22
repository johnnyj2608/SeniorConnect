import { renderHook, act } from '@testing-library/react';
import useFilteredRegistry from './useFilteredRegistry';
import fetchWithRefresh from '../utils/fetchWithRefresh';

jest.mock('../utils/fetchWithRefresh');

describe('useFilteredRegistry', () => {
    const mockResults = Array.from({ length: 5 }, (_, i) => ({ id: i, name: `Item ${i}` }));

    beforeEach(() => {
        jest.clearAllMocks();

        fetchWithRefresh.mockResolvedValue({
            ok: true,
            json: async () => ({
                results: mockResults,
                count: 40, // 2 pages (20 items each)
            }),
        });
    });

    it('fetches members registry on mount', async () => {
        const { result } = renderHook(() => useFilteredRegistry('members', ''));

        // wait for fetch
        await act(async () => {});

        expect(fetchWithRefresh).toHaveBeenCalledWith('/core/members?page=1');
        expect(result.current.registry).toEqual(mockResults);
        expect(result.current.totalPages).toBe(2);
    });

    it('switches endpoint based on registryType', async () => {
        const { rerender, result } = renderHook(
            ({ type }) => useFilteredRegistry(type, ''),
            { initialProps: { type: 'absences' } }
        );

        await act(async () => {});
        expect(fetchWithRefresh).toHaveBeenCalledWith('/core/absences?page=1');

        rerender({ type: 'enrollments' });
        await act(async () => {});
        expect(fetchWithRefresh).toHaveBeenCalledWith('/audit/enrollments?page=1');

        rerender({ type: 'audit_log' });
        await act(async () => {});
        expect(fetchWithRefresh).toHaveBeenCalledWith('/audit/audits?page=1');

        rerender({ type: 'snapshots' });
        await act(async () => {});
        expect(fetchWithRefresh).toHaveBeenCalledWith('/tenant/snapshots?page=1');
    });

    it('applies filter when registryFilter is provided', async () => {
        const { result } = renderHook(() => useFilteredRegistry('members', 'active'));

        await act(async () => {});

        expect(fetchWithRefresh).toHaveBeenCalledWith('/core/members?page=1&filter=active');
        expect(result.current.currentPage).toBe(1);
    });

    it('resets state when registryType changes', async () => {
        const { rerender, result } = renderHook(
            ({ type }) => useFilteredRegistry(type, ''),
            { initialProps: { type: 'members' } }
        );

        await act(async () => {});
        expect(result.current.registry.length).toBeGreaterThan(0);

        rerender({ type: 'absences' });
        expect(result.current.registry).toEqual([]);
        expect(result.current.totalPages).toBe(1);
        expect(result.current.currentPage).toBe(1);
    });

    it('resets page when filter changes', async () => {
        const { rerender, result } = renderHook(
            ({ filter }) => useFilteredRegistry('members', filter),
            { initialProps: { filter: '' } }
        );

        await act(async () => {
            result.current.setCurrentPage(2);
        });
        expect(result.current.currentPage).toBe(2);

        rerender({ filter: 'active' });
        expect(result.current.currentPage).toBe(1);
    });

    it('handles fetch errors gracefully', async () => {
        fetchWithRefresh.mockRejectedValueOnce(new Error('Network error'));
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        renderHook(() => useFilteredRegistry('members', ''));

        await act(async () => {});
        expect(errorSpy).toHaveBeenCalled();

        errorSpy.mockRestore();
    });

    it('does nothing if registryType is invalid', async () => {
        renderHook(() => useFilteredRegistry('invalid_type', ''));
        await act(async () => {});
        expect(fetchWithRefresh).not.toHaveBeenCalled();
    });
});