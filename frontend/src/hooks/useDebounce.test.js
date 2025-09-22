import { renderHook, act } from '@testing-library/react';
import useDebounce from './useDebounce';

jest.useFakeTimers();

describe('useDebounce', () => {
    it('should debounce the value', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: 'a', delay: 500 } }
        );

        expect(result.current).toBe('a');

        // change value
        rerender({ value: 'b', delay: 500 });

        // still old value until timer runs
        expect(result.current).toBe('a');

        // fast-forward time
        act(() => {
            jest.advanceTimersByTime(500);
        });

        expect(result.current).toBe('b');
    });
});