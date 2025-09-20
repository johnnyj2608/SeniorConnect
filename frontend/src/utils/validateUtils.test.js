import {
    validateRequiredFields,
    validateDateRange,
    validateInputLength,
    validateMedicaid,
    confirmMltcDeletion
} from './validateUtils';

jest.mock('i18next', () => ({
    t: (key, options) => options?.fields || key
}));

describe('Validation Utilities', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.alert = jest.fn();
        global.confirm = jest.fn();
    });

    describe('validateRequiredFields', () => {
        it('alerts and returns false if required fields missing', () => {
            const data = { name: '', age: 25, edited: true };
            const result = validateRequiredFields('fields', data, ['name', 'age']);
            expect(result).toBe(false);
            expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('fields.name'));
        });

        it('returns true when all required fields present', () => {
            const data = { name: 'John', age: 25, edited: true };
            expect(validateRequiredFields('fields', data, ['name', 'age'])).toBe(true);
            expect(global.alert).not.toHaveBeenCalled();
        });
    });

    describe('validateDateRange', () => {
        it('alerts and returns false for invalid end_date', () => {
            const data = [{ start_date: '2025-01-02', end_date: '2025-01-01' }];
            expect(validateDateRange(data)).toBe(false);
            expect(global.alert).toHaveBeenCalledWith('alerts.invalid_dates');
        });

        it('returns true for valid date ranges', () => {
            const data = [{ start_date: '2025-01-01', end_date: '2025-01-02' }];
            expect(validateDateRange(data)).toBe(true);
        });
    });

    describe('validateInputLength', () => {
        it('alerts and returns false if length mismatch', () => {
            const data = [{ code: '123' }];
            expect(validateInputLength(data, 5, 'code', 'Code')).toBe(false);
            expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('alerts.exact_length'));
        });

        it('returns true for correct length', () => {
            const data = [{ code: '12345' }];
            expect(validateInputLength(data, 5, 'code', 'Code')).toBe(true);
        });
    });

    describe('validateMedicaid', () => {
        it('returns true for empty input', () => {
            expect(validateMedicaid('')).toBe(true);
        });

        it('alerts and returns false for invalid format', () => {
            expect(validateMedicaid('123456')).toBe(false);
            expect(global.alert).toHaveBeenCalledWith('alerts.invalid_medicaid');
        });

        it('returns true for valid format', () => {
            expect(validateMedicaid('AB12345C')).toBe(true);
        });
    });

    describe('confirmMltcDeletion', () => {
        it('returns true if no items deleted', () => {
            const items = [{ name: 'Item', deleted: false }];
            expect(confirmMltcDeletion(items)).toBe(true);
        });

        it('calls confirm and returns true if confirmed', () => {
            const items = [{ name: 'Item', deleted: true }];
            global.confirm.mockReturnValueOnce(true);
            expect(confirmMltcDeletion(items)).toBe(true);
            expect(global.confirm).toHaveBeenCalled();
        });

        it('returns false if deletion canceled', () => {
            const items = [{ name: 'Item', deleted: true }];
            global.confirm.mockReturnValueOnce(false);
            expect(confirmMltcDeletion(items)).toBe(false);
        });
    });
});