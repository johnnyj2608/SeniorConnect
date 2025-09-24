import React from 'react';
import { render, screen } from '@testing-library/react';
import {
    colorBoolean,
    colorAbsence,
    colorEnrollment,
    colorAudit,
    colorStats,
} from './colorUtils';

const t = (key) => key;

describe('colorBoolean', () => {
    it('renders yes in green for true', () => {
        render(colorBoolean(true, t));
        const el = screen.getByText('general.yes');
        expect(el).toHaveClass('green');
    });

    it('renders no in red for false', () => {
        render(colorBoolean(false, t));
        const el = screen.getByText('general.no');
        expect(el).toHaveClass('red');
    });
});

describe('colorAbsence', () => {
    it('renders correct class and text for each status', () => {
        const cases = [
            ['ongoing', 'green', 'registry.absences.ongoing'],
            ['completed', '', 'registry.absences.completed'],
            ['upcoming', 'yellow', 'registry.absences.upcoming'],
        ];
        cases.forEach(([status, cls, key]) => {
            render(colorAbsence(status, t));
            const el = screen.getByText(key);
            if (cls) expect(el).toHaveClass(cls);
        });
    });

    it('returns null for unknown status', () => {
        expect(colorAbsence('unknown', t)).toBeNull();
    });
});

describe('colorEnrollment', () => {
    it('renders enrollment, disenrollment, and transfer correctly', () => {
        const enrollmentEl = render(colorEnrollment('enrollment', 10, 20, t));
        expect(screen.getByText('registry.enrollments.enrollment:')).toHaveClass('green');

        render(colorEnrollment('disenrollment', 10, 20, t));
        expect(screen.getByText('registry.enrollments.disenrollment:')).toHaveClass('red');

        render(colorEnrollment('transfer', 10, 20, t));
        expect(screen.getByText('registry.enrollments.transfer:')).toHaveClass('yellow');
    });

    it('returns null for unknown status', () => {
        expect(colorEnrollment('unknown', 1, 2, t)).toBeNull();
    });
});

describe('colorAudit', () => {
    const cases = [
        ['create', 'green', 'registry.audit_log.create'],
        ['delete', 'red', 'registry.audit_log.delete'],
        ['update', 'yellow', 'registry.audit_log.update'],
    ];
    cases.forEach(([status, cls, key]) => {
        it(`renders ${status} with class ${cls}`, () => {
            render(colorAudit(status, t));
            expect(screen.getByText(key)).toHaveClass(cls);
        });
    });

    it('returns null for unknown status', () => {
        expect(colorAudit('unknown', t)).toBeNull();
    });
});

describe('colorStats', () => {
    it('renders positive change in green with arrow', () => {
        render(colorStats(50, 10));
        const el = screen.getByText(/↑ \+10/);
        expect(el).toHaveClass('green');
    });

    it('renders negative change in red with arrow', () => {
        render(colorStats(50, -5));
        const el = screen.getByText(/↓ -5/);
        expect(el).toHaveClass('red');
    });

    it('renders zero change correctly', () => {
        render(colorStats(50, 0));
        expect(screen.getByText('(0%)')).toBeInTheDocument();
    });

    it('calculates percentChange correctly when count-change is 0', () => {
        render(colorStats(10, 10)); // 10-10=0
        const el = screen.getByText(/↑ \+10/);
        expect(el).toHaveClass('green');
    });
});