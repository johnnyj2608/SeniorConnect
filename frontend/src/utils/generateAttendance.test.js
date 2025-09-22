import generateAttendance from './generateAttendance';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

jest.mock('jszip');
jest.mock('file-saver', () => ({ saveAs: jest.fn() }));
jest.mock('jspdf');
jest.mock('jspdf-autotable');
jest.mock('../fonts/NotoSansSC-Regular-normal', () => ({}));

describe('generateAttendance (mocked PDF)', () => {
    let zipInstance;

    const memberList = {
        'TestMLTC': [
            {
                first_name: 'John',
                last_name: 'Doe',
                mltc_name: 'TestMLTC',
                schedule: ['monday', 'wednesday'],
            },
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();

        zipInstance = {
            folder: jest.fn().mockReturnThis(),
            file: jest.fn().mockReturnThis(),
            generateAsync: jest.fn().mockResolvedValue('fake-blob'),
        };
        JSZip.mockImplementation(() => zipInstance);

        jsPDF.mockImplementation(() => ({
            internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
            setFontSize: jest.fn(),
            setFont: jest.fn(),
            text: jest.fn(),
            getTextWidth: jest.fn(() => 50),
            output: jest.fn(() => 'fake-pdf-blob'),
        }));

        autoTable.mockImplementation(jest.fn());
    });

    it('calls JSZip methods and saveAs quickly', async () => {
        await generateAttendance(memberList, '2025-09', 'TestSadc', 1);
        expect(JSZip).toHaveBeenCalled();
        expect(zipInstance.folder).toHaveBeenCalledWith('TestMLTC');
        expect(zipInstance.file).toHaveBeenCalled();
        expect(zipInstance.generateAsync).toHaveBeenCalledWith({ type: 'blob' });
        expect(saveAs).toHaveBeenCalledWith('fake-blob', expect.any(String));
    });

    it('uses template 2 when specified', async () => {
        await generateAttendance(memberList, '2025-09', 'TestSadc', 2);
        expect(zipInstance.file).toHaveBeenCalled();
        expect(zipInstance.generateAsync).toHaveBeenCalledWith({ type: 'blob' });
        expect(saveAs).toHaveBeenCalledWith('fake-blob', expect.any(String));
    });

    it('opens preview for first member without calling saveAs', async () => {
        global.URL.createObjectURL = jest.fn(() => 'blob:url');
        global.window.open = jest.fn();

        await generateAttendance(memberList, '2025-09', 'TestSadc', 1, true);

        expect(window.open).toHaveBeenCalledWith('blob:url');
        expect(saveAs).not.toHaveBeenCalled();
    });

    it('handles multiple MLTC groups', async () => {
        const multipleGroups = {
            MLTC1: memberList['TestMLTC'],
            MLTC2: memberList['TestMLTC'],
        };

        await generateAttendance(multipleGroups, '2025-09', 'TestSadc', 1);

        expect(zipInstance.folder).toHaveBeenCalledWith('MLTC1');
        expect(zipInstance.folder).toHaveBeenCalledWith('MLTC2');
        expect(zipInstance.file).toHaveBeenCalledTimes(2);
        expect(saveAs).toHaveBeenCalledWith('fake-blob', expect.any(String));
    });
});