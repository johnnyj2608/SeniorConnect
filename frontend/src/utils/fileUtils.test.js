import { openFile, saveFile } from './fileUtils';

beforeAll(() => {
    // Mock browser URL APIs
    global.URL.createObjectURL = jest.fn();
    global.URL.revokeObjectURL = jest.fn();
    // Mock window.open
    global.open = jest.fn();
});

describe('fileUtils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('openFile', () => {
        it('opens a File object with URL.createObjectURL', async () => {
            const file = new File(['content'], 'test.txt', { type: 'text/plain' });
            global.URL.createObjectURL.mockReturnValue('blob:url');

            await openFile(file);

            expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
            expect(global.open).toHaveBeenCalledWith('blob:url', '_blank');
        });

        it('fetches signed URL for a string path and opens it', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ url: 'signed-url' })
            });

            await openFile('file.pdf');

            expect(global.fetch).toHaveBeenCalledWith('/common/file.pdf/');
            expect(global.open).toHaveBeenCalledWith('signed-url', '_blank');
        });
    });

    describe('saveFile', () => {
        it('downloads file from URL', async () => {
            const blob = new Blob(['content'], { type: 'text/plain' });
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                blob: async () => blob
            });

            const appendSpy = jest.spyOn(document.body, 'appendChild');
            const removeSpy = jest.spyOn(document.body, 'removeChild');

            await saveFile('file-url', 'myfile.txt');

            expect(global.fetch).toHaveBeenCalledWith('file-url', { mode: 'cors' });
            expect(appendSpy).toHaveBeenCalled();
            expect(removeSpy).toHaveBeenCalled();
            expect(global.URL.revokeObjectURL).toHaveBeenCalled();
        });
    });
});