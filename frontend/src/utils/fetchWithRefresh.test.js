import fetchWithRefresh from './fetchWithRefresh';

describe('fetchWithRefresh', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('returns response when status is not 401', async () => {
        const mockRes = { status: 200 };
        global.fetch = jest.fn().mockResolvedValue(mockRes);

        const res = await fetchWithRefresh('/test');
        expect(res).toBe(mockRes);
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith('/test', expect.objectContaining({ credentials: 'include' }));
    });

    it('retries once when status is 401 and refresh succeeds', async () => {
        const unauthorizedRes = { status: 401 };
        const refreshRes = { ok: true };
        const successRes = { status: 200 };

        global.fetch = jest
            .fn()
            .mockResolvedValueOnce(unauthorizedRes) // initial fetch
            .mockResolvedValueOnce(refreshRes)      // refresh
            .mockResolvedValueOnce(successRes);     // retry

        const res = await fetchWithRefresh('/test');
        expect(res).toBe(successRes);
        expect(fetch).toHaveBeenCalledTimes(3);
        expect(fetch).toHaveBeenNthCalledWith(2, '/user/auth/refresh/', expect.objectContaining({ method: 'POST', credentials: 'include' }));
    });

    it('throws error if refresh fails', async () => {
        const unauthorizedRes = { status: 401 };
        const refreshRes = { ok: false };

        global.fetch = jest
            .fn()
            .mockResolvedValueOnce(unauthorizedRes)
            .mockResolvedValueOnce(refreshRes);

        await expect(fetchWithRefresh('/test')).rejects.toThrow('Unauthorized - refresh failed');
        expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('does not retry if retry flag is false', async () => {
        const unauthorizedRes = { status: 401 };

        global.fetch = jest.fn().mockResolvedValue(unauthorizedRes);

        const res = await fetchWithRefresh('/test', {}, false);
        expect(res).toBe(unauthorizedRes);
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('throws error if fetch itself fails', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

        await expect(fetchWithRefresh('/test')).rejects.toThrow('Network error');
    });
});