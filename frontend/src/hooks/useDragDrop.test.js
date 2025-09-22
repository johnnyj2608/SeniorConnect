import { renderHook, act } from '@testing-library/react';
import useDragDrop from './useDragDrop';

describe('useDragDrop', () => {
    let onDropFile;

    beforeEach(() => {
        onDropFile = jest.fn();
    });

    it('sets isDragging true on drag enter and false on drag leave', () => {
        const { result } = renderHook(() => useDragDrop(onDropFile));

        // simulate drag enter
        act(() => {
            result.current.dragProps.onDragEnter({ preventDefault: jest.fn() });
        });
        expect(result.current.isDragging).toBe(true);

        // simulate drag leave
        act(() => {
            result.current.dragProps.onDragLeave({ preventDefault: jest.fn() });
        });
        expect(result.current.isDragging).toBe(false);
    });

    it('calls onDropFile with files on drop', () => {
        const { result } = renderHook(() => useDragDrop(onDropFile));

        const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
        const mockEvent = {
            preventDefault: jest.fn(),
            dataTransfer: { files: [mockFile] }
        };

        act(() => {
            result.current.dragProps.onDrop(mockEvent);
        });

        expect(onDropFile).toHaveBeenCalledWith([mockFile]);
        expect(result.current.isDragging).toBe(false);
    });

    it('ignores drop if no files are provided', () => {
        const { result } = renderHook(() => useDragDrop(onDropFile));

        const mockEvent = {
            preventDefault: jest.fn(),
            dataTransfer: { files: [] }
        };

        act(() => {
            result.current.dragProps.onDrop(mockEvent);
        });

        expect(onDropFile).not.toHaveBeenCalled();
        expect(result.current.isDragging).toBe(false);
    });

    it('handles multiple drag enter/leave correctly', () => {
        const { result } = renderHook(() => useDragDrop(onDropFile));

        const mockEvent = { preventDefault: jest.fn() };

        act(() => {
            result.current.dragProps.onDragEnter(mockEvent);
            result.current.dragProps.onDragEnter(mockEvent);
        });
        expect(result.current.isDragging).toBe(true);

        act(() => {
            result.current.dragProps.onDragLeave(mockEvent);
        });
        expect(result.current.isDragging).toBe(true); // still dragging

        act(() => {
            result.current.dragProps.onDragLeave(mockEvent);
        });
        expect(result.current.isDragging).toBe(false);
    });
});