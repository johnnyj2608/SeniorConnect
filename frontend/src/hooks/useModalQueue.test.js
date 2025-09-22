import { renderHook, act } from '@testing-library/react';
import useModalQueue from './useModalQueue';

describe('useModalQueue', () => {
    const initialData = {
        type: 'attendance',
        data: {
            MLTC1: [
                { id: 1, name: 'John' },
                { id: 2, name: 'Jane' },
            ],
            MLTC2: [
                { id: 3, name: 'Alice' },
            ],
            unknown: [
                { id: 99, name: 'Unknown' },
            ],
        },
    };

    const cloneData = () => JSON.parse(JSON.stringify(initialData));

    it('initializes state correctly', () => {
        const { result } = renderHook(() => useModalQueue(cloneData()));

        expect(result.current.month).toMatch(/\d{4}-\d{2}/);
        expect(result.current.queuedMembers).toEqual({});
        expect(result.current.availableMembers.unknown).toBeUndefined();
        expect(result.current.availableMembers.MLTC1.length).toBe(2);
    });

    it('adds a member to queue and removes from available', () => {
        const { result } = renderHook(() => useModalQueue(cloneData()));

        act(() => {
            result.current.addQueue({ id: 1, name: 'John' }, 'MLTC1');
        });

        expect(result.current.queuedMembers.MLTC1).toHaveLength(1);
        expect(result.current.availableMembers.MLTC1).toHaveLength(1);
        expect(result.current.availableMembers.MLTC1[0].id).toBe(2);
    });

    it('removes a member from queue and returns to available', () => {
        const { result } = renderHook(() => useModalQueue(cloneData()));

        act(() => {
            result.current.addQueue({ id: 1, name: 'John' }, 'MLTC1');
            result.current.removeQueue(1, 'MLTC1');
        });

        expect(result.current.queuedMembers.MLTC1).toHaveLength(0);
        expect(result.current.availableMembers.MLTC1).toHaveLength(2);
    });

    it('adds all available members of a MLTC to queue', () => {
        const { result } = renderHook(() => useModalQueue(cloneData()));

        act(() => {
            result.current.addMltcQueue('MLTC2');
        });

        expect(result.current.queuedMembers.MLTC2).toHaveLength(1);
        expect(result.current.availableMembers.MLTC2).toBeUndefined();
    });

    it('clears a MLTC queue back to available', () => {
        const { result } = renderHook(() => useModalQueue(cloneData()));

        act(() => {
            result.current.addMltcQueue('MLTC1');
            result.current.clearMltcQueue('MLTC1');
        });

        expect(result.current.queuedMembers.MLTC1).toBeUndefined();
        expect(result.current.availableMembers.MLTC1.length).toBe(2);
    });

    it('clears all queues back to available', () => {
        const { result } = renderHook(() => useModalQueue(cloneData()));

        act(() => {
            result.current.addQueue({ id: 1, name: 'John' }, 'MLTC1');
            result.current.addQueue({ id: 3, name: 'Alice' }, 'MLTC2');
            result.current.clearQueue();
        });

        expect(result.current.queuedMembers).toEqual({});
        expect(result.current.availableMembers.MLTC1.length).toBe(2);
        expect(result.current.availableMembers.MLTC2.length).toBe(1);
    });

    it('updates month correctly', () => {
        const { result } = renderHook(() => useModalQueue(cloneData()));

        act(() => {
            result.current.onMonthChange('2025-09');
        });

        expect(result.current.month).toBe('2025-09');
    });

    it('returns empty state for non-attendance type', () => {
        const { result } = renderHook(() =>
            useModalQueue({ type: 'other', data: {} })
        );

        expect(result.current.month).toBe('');
        expect(result.current.queuedMembers).toEqual({});
        expect(result.current.availableMembers).toEqual({});
    });
});