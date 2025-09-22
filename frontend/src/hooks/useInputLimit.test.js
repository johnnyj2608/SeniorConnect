import { renderHook, act } from '@testing-library/react';
import useInputLimit from './useInputLimit';

describe('useInputLimit', () => {
    it('initially has no exceeded fields', () => {
        const { result } = renderHook(() => useInputLimit());

        expect(result.current.inputLimitExceeded).toBe(false);
    });

    it('sets inputLimitExceeded to true when a field exceeds limit', () => {
        const { result } = renderHook(() => useInputLimit());

        act(() => {
            result.current.handleLimit('name')(true);
        });

        expect(result.current.inputLimitExceeded).toBe(true);
    });

    it('sets inputLimitExceeded back to false when field no longer exceeds', () => {
        const { result } = renderHook(() => useInputLimit());

        act(() => {
            result.current.handleLimit('name')(true);
        });
        expect(result.current.inputLimitExceeded).toBe(true);

        act(() => {
            result.current.handleLimit('name')(false);
        });
        expect(result.current.inputLimitExceeded).toBe(false);
    });

    it('scopes field keys by tab index', () => {
        const { result } = renderHook(() => useInputLimit());

        act(() => {
            result.current.handleLimit('fieldA', 1)(true);
            result.current.handleLimit('fieldA', 2)(true);
        });

        expect(result.current.inputLimitExceeded).toBe(true);

        act(() => {
            result.current.clearTabLimit(1);
        });

        // only tab 2 remains exceeded
        expect(result.current.inputLimitExceeded).toBe(true);

        act(() => {
            result.current.clearTabLimit(2);
        });

        expect(result.current.inputLimitExceeded).toBe(false);
    });

    it('can handle multiple fields across tabs', () => {
        const { result } = renderHook(() => useInputLimit());

        act(() => {
            result.current.handleLimit('name', 0)(true);
            result.current.handleLimit('email', 0)(true);
            result.current.handleLimit('note', 1)(true);
        });

        expect(result.current.inputLimitExceeded).toBe(true);

        act(() => {
            result.current.clearTabLimit(0);
        });

        // only note in tab 1 remains
        expect(result.current.inputLimitExceeded).toBe(true);

        act(() => {
            result.current.clearTabLimit(1);
        });

        expect(result.current.inputLimitExceeded).toBe(false);
    });
});