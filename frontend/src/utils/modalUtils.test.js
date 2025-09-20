import { 
    compareTabs, 
    getActiveAuthIndex, 
    sendRequest, 
    saveDataTabs, 
    getNewTab 
} from './modalUtils';
import fetchWithRefresh from './fetchWithRefresh';

jest.mock('./fetchWithRefresh');

describe('tabsUtils - critical behaviors', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('compareTabs', () => {
        it('returns false for identical tabs ignoring edited property', () => {
            const tab1 = { id: 1, edited: true, value: 'a' };
            const tab2 = { id: 1, edited: false, value: 'a' };
            expect(compareTabs(tab1, tab2)).toBe(false);
        });

        it('returns true for different tabs', () => {
            const tab1 = { id: 1, value: 'a' };
            const tab2 = { id: 1, value: 'b' };
            expect(compareTabs(tab1, tab2)).toBe(true);
        });
    });

    describe('getActiveAuthIndex', () => {
        it('returns correct index of active tab', () => {
            const tabs = [{ active: false }, { active: true }, { active: false }];
            expect(getActiveAuthIndex(tabs)).toBe(1);
        });

        it('returns -1 if data is null or no active tab', () => {
            expect(getActiveAuthIndex(null)).toBe(-1);
            expect(getActiveAuthIndex([{ active: false }])).toBe(-1);
        });
    });

    describe('sendRequest', () => {
        it('sends POST request with FormData and returns JSON', async () => {
            const mockResponse = { ok: true, json: async () => ({ success: true }) };
            fetchWithRefresh.mockResolvedValue(mockResponse);

            const data = { name: 'John', age: 30 };
            const response = await sendRequest('/test', 'POST', data);

            expect(fetchWithRefresh).toHaveBeenCalled();
            expect(response).toEqual({ success: true });
        });

        it('rejects promise if response is not ok', async () => {
            fetchWithRefresh.mockResolvedValue({ ok: false });
            await expect(sendRequest('/fail', 'POST', {})).rejects.toBeDefined();
        });

        it('returns null for 204 response', async () => {
            fetchWithRefresh.mockResolvedValue({ ok: true, status: 204 });
            const result = await sendRequest('/empty', 'POST', {});
            expect(result).toBeNull();
        });
    });

    describe('saveDataTabs', () => {
        it('processes updated and deleted items correctly', async () => {
            const updatedItem = { id: '1', edited: true };
            const deletedItem = { id: '2', deleted: true };
            const data = { 1: updatedItem, 2: deletedItem };

            fetchWithRefresh.mockResolvedValue({ ok: true, json: async () => updatedItem });

            const saved = await saveDataTabs(data, 'endpoint');
            expect(saved).toContainEqual(updatedItem);
            expect(fetchWithRefresh).toHaveBeenCalledTimes(2); // PUT + DELETE
        });
    });

    describe('getNewTab', () => {
        it('returns new authorization tab with defaults', () => {
            const localData = [{ active: true, mltc_member_id: 'MLTC1', mltc: 'A', services: [] }];
            const result = getNewTab('authorizations', localData, 123);
            expect(result.id).toBe('new');
            expect(result.mltc_member_id).toBe('MLTC1');
            expect(result.active).toBe(true);
        });

        it('returns new contact tab', () => {
            const result = getNewTab('contacts', [], 123);
            expect(result.members).toEqual([123]);
            expect(result.edited).toBe(true);
        });

        it('returns null for unknown type', () => {
            expect(getNewTab('unknown', [], 123)).toBeNull();
        });
    });
});