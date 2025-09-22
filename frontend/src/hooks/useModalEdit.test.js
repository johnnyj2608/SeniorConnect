import { renderHook, act } from '@testing-library/react';
import * as modalUtils from '../utils/modalUtils';
import * as validateUtils from '../utils/validateUtils';
import fetchWithRefresh from '../utils/fetchWithRefresh';
import useModalEdit from './useModalEdit';
import { MltcContext } from '../context/MltcContext';
import { SadcContext } from '../context/SadcContext';
import { GiftContext } from '../context/GiftContext';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('../utils/fetchWithRefresh');

describe('useModalEdit tests', () => {
    const wrapper = ({ children }) => (
        <MltcContext.Provider value={{ mltcs: [{ id: 'MLTC1' }, { id: 'MLTC2' }] }}>
            <SadcContext.Provider value={{ sadc: { name: 'Sadc Name' } }}>
                <GiftContext.Provider value={{ gifts: [{ gift_id: 'g1', id: 'g1', name: 'Gift 1', expires_at: '2024-01-01' }] }}>
                    {children}
                </GiftContext.Provider>
            </SadcContext.Provider>
        </MltcContext.Provider>
    );

    const NO_TABS_TYPE = new Set(['info', 'sadcs', 'import']);

    const defaultData = {
        id: '1',
        type: 'info',
        data: { 
            first_name: 'John', 
            last_name: 'Doe', 
            birth_date: '2000-01-01', 
            gender: 'M', 
            sadc_member_id: 'SADC123', 
            phone: '1234567890', 
            ssn: '123456789', 
            medicaid: 'M123' 
        },
        setData: jest.fn(),
    };

    const authData = {
        id: '1',
        type: 'authorizations',
        data: [
            { id: 'a1', active: true, mltc: 'MLTC1', start_date: '2023-01-01', end_date: '2023-12-31', cm_phone: '1234567890' },
            { id: 'a2', active: false, mltc: 'MLTC2', start_date: '2023-02-01', end_date: '2023-11-30', cm_phone: '0987654321' }
        ],
        setData: jest.fn(),
    };

    const deletedData = [
        { id: '1', deleted: true }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(validateUtils, 'validateRequiredFields').mockReturnValue(true);
        jest.spyOn(validateUtils, 'validateDateRange').mockReturnValue(true);
        jest.spyOn(validateUtils, 'validateInputLength').mockReturnValue(true);
        jest.spyOn(validateUtils, 'validateMedicaid').mockReturnValue(true);
        jest.spyOn(validateUtils, 'confirmMltcDeletion').mockReturnValue(true);

        jest.spyOn(modalUtils, 'sendRequest').mockResolvedValue({ id: 123 });
        jest.spyOn(modalUtils, 'saveDataTabs').mockResolvedValue([{ id: '1', active: true }]);
        fetchWithRefresh.mockResolvedValue({ ok: true, json: async () => ({ mltc: 'MLTC1' }) });
    });

    const makeHook = (type, dataOverride = {}, noTabs = new Set()) => {
        const data = {
            id: '1',
            type,
            data: { ...dataOverride },
            setData: jest.fn()
        };
        return renderHook(() => useModalEdit(data, jest.fn(), noTabs), { wrapper });
    };

    // --- BASIC TESTS ---
    it('initializes NO_TABS_TYPE data correctly', () => {
        const { result } = renderHook(() => useModalEdit(defaultData, jest.fn(), NO_TABS_TYPE), { wrapper });
        expect(result.current.localData.first_name).toBe('John');
        expect(result.current.activeTab).toBe(0);
        expect(result.current.newTabsCount).toBe(0);
        expect(result.current.isSaving).toBe(false);
    });

    it('initializes array/tabular data correctly', () => {
        const { result } = renderHook(() => useModalEdit(authData, jest.fn(), new Set()), { wrapper });
        expect(result.current.localData).toHaveLength(2);
        expect(result.current.localData[0].active).toBe(true);
    });

    it('updates string and number fields', () => {
        const { result } = renderHook(() => useModalEdit(defaultData, jest.fn(), NO_TABS_TYPE), { wrapper });
        act(() => {
            result.current.handleChange('first_name')({ target: { value: 'Jane' } });
            result.current.handleChange('phone')({ target: { value: '1112223333' } });
        });
        expect(result.current.localData.first_name).toBe('Jane');
        expect(result.current.localData.phone).toBe('1112223333');
    });

    it('toggles active tab correctly', () => {
        const { result } = renderHook(() => useModalEdit(authData, jest.fn(), new Set()), { wrapper });
        act(() => {
            result.current.handleActiveToggle(false);
        });
        expect(result.current.localData[0].active).toBe(false);
        expect(result.current.localData[1].active).toBe(false);
    });

    it('adds a new tab and deactivates old active auth', () => {
        const { result } = renderHook(() => useModalEdit(authData, jest.fn(), new Set()), { wrapper });
        act(() => result.current.handleAdd());
        expect(result.current.localData).toHaveLength(3);
        expect(result.current.localData[0].id).toBe('new');
        expect(result.current.localData[1].active).toBe(false);
        expect(result.current.activeTab).toBe(0);
    });

    it('marks tab as deleted and sets new active tab', () => {
        const { result } = renderHook(() => useModalEdit(authData, jest.fn(), new Set()), { wrapper });
        act(() => result.current.handleDelete(0));
        expect(result.current.localData[0].deleted).toBe(true);
        expect(result.current.localData[0].active).toBe(false);
        expect(result.current.activeTab).toBe(1);
    });

    it('adds modal-open class on mount and removes on unmount', () => {
        const { unmount } = renderHook(() => useModalEdit(defaultData, jest.fn(), NO_TABS_TYPE), { wrapper });
        expect(document.body.classList.contains('modal-open')).toBe(true);
        unmount();
        expect(document.body.classList.contains('modal-open')).toBe(false);
    });

    it('updates localData when sadc changes', () => {
        const { result } = renderHook(() => useModalEdit({ ...defaultData, type: 'sadcs' }, jest.fn(), NO_TABS_TYPE), { wrapper });
        expect(result.current.localData.name).toBe('Sadc Name');
    });

    // --- HANDLE SAVE FULL COVERAGE ---
    const saveAllTypes = [
        'info', 'authorizations', 'contacts', 'absences', 'files',
        'gifteds', 'import', 'users', 'mltcs', 'gifts', 'sadcs', 'deleted'
    ];

    saveAllTypes.forEach((type) => {
        it(`handleSave correctly saves type "${type}"`, async () => {
            let initialData = {};
            let noTabs = new Set();

            if (type === 'gifteds') {
                initialData = [{ gift: 'g1', received: false }];
            } else if (type === 'info') {
                initialData = defaultData.data;
                noTabs = NO_TABS_TYPE;
            } else if (type === 'deleted') {
                initialData = deletedData;
            } else if (type === 'sadcs') {
                initialData = { name: 'Sadc Name', email: 'sadc@example.com', phone: '1234567890', address: '123 St', npi: '1234567890' };
                noTabs = NO_TABS_TYPE;
            }

            const { result } = makeHook(type, initialData, noTabs);

            await act(async () => {
                await result.current.handleSave(result.current.localData);
            });

            // Validation calls
            if (!['gifteds', 'deleted', 'import', 'users', 'mltcs', 'gifts', 'sadcs', 'authorizations'].includes(type)) {
                expect(validateUtils.validateRequiredFields).toHaveBeenCalled();
            }

            // Type-specific assertions
            if (type === 'info') {
                expect(validateUtils.validateInputLength).toHaveBeenCalledWith(expect.anything(), 10, 'phone', expect.any(String));
                expect(validateUtils.validateInputLength).toHaveBeenCalledWith(expect.anything(), 9, 'ssn', expect.any(String));
                expect(validateUtils.validateMedicaid).toHaveBeenCalled();
                expect(modalUtils.sendRequest).toHaveBeenCalledWith('/core/members/1/', 'PUT', expect.anything());
            } else if (type === 'gifteds') {
                expect(modalUtils.saveDataTabs).toHaveBeenCalledWith(expect.anything(), 'gifteds', '1');
            } else if (type === 'deleted') {
                expect(modalUtils.sendRequest).toHaveBeenCalledWith('/core/members/1/', 'PATCH', {});
            }

            expect(result.current.isSaving).toBe(false);
        });
    });
});
