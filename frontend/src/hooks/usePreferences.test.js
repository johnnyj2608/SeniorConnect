import { renderHook } from '@testing-library/react';
import usePreferences from './usePreferences';
import { AuthContext } from '../context/AuthContext';

describe('usePreferences', () => {
    const key = 'testKey';

    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    const wrapper = ({ user }) => ({ children }) => (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    );

    it('returns backend preference if present and updates localStorage', () => {
        const user = { preferences: { [key]: 'backendValue' } };
        const { result } = renderHook(() => usePreferences(key, 'defaultValue'), {
            wrapper: wrapper({ user }),
        });

        expect(result.current).toBe('backendValue');
        expect(JSON.parse(localStorage.getItem(key))).toBe('backendValue');
    });

    it('returns localStorage value if backend value is missing', () => {
        localStorage.setItem(key, JSON.stringify('localValue'));
        const { result } = renderHook(() => usePreferences(key, 'defaultValue'), {
            wrapper: wrapper({ user: {} }),
        });

        expect(result.current).toBe('localValue');
    });

    it('returns defaultValue if neither backend nor localStorage value exist', () => {
        const { result } = renderHook(() => usePreferences('missingKey', 'defaultValue'), {
            wrapper: wrapper({ user: {} }),
        });

        expect(result.current).toBe('defaultValue');
    });

    it('falls back to raw localStorage if JSON.parse fails', () => {
        localStorage.setItem(key, 'invalid JSON');
        const { result } = renderHook(() => usePreferences(key, 'defaultValue'), {
            wrapper: wrapper({ user: {} }),
        });

        expect(result.current).toBe('invalid JSON');
    });

    it('does not overwrite localStorage if backend value matches', () => {
        localStorage.setItem(key, JSON.stringify('sameValue'));
        const user = { preferences: { [key]: 'sameValue' } };
        renderHook(() => usePreferences(key, 'defaultValue'), {
            wrapper: wrapper({ user }),
        });

        expect(JSON.parse(localStorage.getItem(key))).toBe('sameValue');
    });
});