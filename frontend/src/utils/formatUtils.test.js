import {
    formatDate,
    formatTime,
    formatTimestamp,
    formatPhone,
    formatGender,
    formatSchedule,
    sortSchedule,
    formatSSN,
    formatPhoto,
    formatStatus,
    normalizeField,
    formatObjectDisplay
} from './formatUtils';

jest.mock('./formatUtils', () => {
    const originalModule = jest.requireActual('./formatUtils');
    return { ...originalModule };
});

describe('formatUtils', () => {

    describe('formatDate', () => {
        it('formats a valid date', () => {
            expect(formatDate('2025-09-20')).toBe('09/20/2025');
        });

        it('returns null for falsy input', () => {
            expect(formatDate(null)).toBeNull();
        });
    });

    describe('formatTime', () => {
        it('formats a valid time string', () => {
            expect(formatTime('14:30:00')).toBe('02:30 PM');
        });

        it('returns null for falsy input', () => {
            expect(formatTime(null)).toBeNull();
        });
    });

    describe('formatPhone', () => {
        it('formats 10-digit number correctly', () => {
            expect(formatPhone('5551234567')).toBe('(555) 123-4567');
        });

        it('returns original input if not valid', () => {
            expect(formatPhone('')).toBe('');
        });
    });

    describe('formatGender', () => {
        it('returns Male for "M"', () => {
            expect(formatGender('M')).toBe('Male');
        });

        it('returns Female for "F"', () => {
            expect(formatGender('F')).toBe('Female');
        });

        it('returns unknown for other input', () => {
            expect(formatGender('X')).toBe('unknown');
        });
    });

    describe('formatSchedule', () => {
        it('formats a single day', () => {
            expect(formatSchedule('monday')).toBe('Mon');
            expect(formatSchedule('monday', true)).toBe('1');
        });

        it('formats array of days', () => {
            expect(formatSchedule(['monday', 'wednesday'])).toBe('Mon, Wed');
            expect(formatSchedule(['monday', 'wednesday'], true)).toBe('1.3');
        });

        it('returns empty string for unknown input', () => {
            expect(formatSchedule(null)).toBe('');
        });
    });

    describe('sortSchedule', () => {
        it('sorts array of days in week order', () => {
            expect(sortSchedule(['wednesday', 'monday'])).toEqual(['monday', 'wednesday']);
        });

        it('removes empty strings', () => {
            expect(sortSchedule(['', 'friday'])).toEqual(['friday']);
        });

        it('returns empty array for null', () => {
            expect(sortSchedule(null)).toEqual([]);
        });
    });

    describe('formatSSN', () => {
        it('formats SSN correctly', () => {
            expect(formatSSN('123456789')).toBe('123-45-6789');
        });

        it('returns empty string for invalid input', () => {
            expect(formatSSN(null)).toBe('');
            expect(formatSSN(123)).toBe('');
        });
    });

    describe('formatStatus', () => {
        const today = new Date().toISOString().split('T')[0];

        it('returns upcoming if start date is in future', () => {
            const future = '2999-01-01';
            expect(formatStatus(future, null)).toBe('upcoming');
        });

        it('returns completed if end date is in past', () => {
            const pastStart = '2020-01-01';
            const pastEnd = '2020-01-02';
            expect(formatStatus(pastStart, pastEnd)).toBe('completed');
        });

        it('returns ongoing if start <= today <= end', () => {
            expect(formatStatus(today, null)).toBe('ongoing');
        });
    });

    describe('normalizeField', () => {
        it('lowercases and replaces spaces with underscores', () => {
            expect(normalizeField('Hello World')).toBe('hello_world');
        });

        it('returns empty string for falsy input', () => {
            expect(normalizeField(null)).toBe('');
        });
    });

    describe('formatObjectDisplay', () => {
        const t = (key) => key;

        it('formats absence entries', () => {
            const entry = { model_name: 'absence', object_display: 'vacation: 01/01/2025 — 01/05/2025' };
            const result = formatObjectDisplay(entry, t);
            expect(result.props.children[0].props.children[0]).toContain('member.absences.vacation');
        });

        it('returns null for unknown model', () => {
            const entry = { model_name: 'unknown', object_display: '' };
            expect(formatObjectDisplay(entry, t)).toBeNull();
        });
    });
});