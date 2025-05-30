import { useState, useEffect, useRef } from 'react';

const useDragDrop = (onDropFile) => {
    const [isDragging, setIsDragging] = useState(false);
    const dragCounter = useRef(0);

    useEffect(() => {
        const preventDefault = (e) => e.preventDefault();
        window.addEventListener('dragover', preventDefault);
        window.addEventListener('drop', preventDefault);

        return () => {
            window.removeEventListener('dragover', preventDefault);
            window.removeEventListener('drop', preventDefault);
        };
    }, []);

    const handleDragEnter = (e) => {
        e.preventDefault();
        dragCounter.current += 1;
        if (dragCounter.current === 1) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        dragCounter.current -= 1;
        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        dragCounter.current = 0;
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file && onDropFile) {
            onDropFile(file);
        }
    };

    return {
        isDragging,
        dragProps: {
            onDragEnter: handleDragEnter,
            onDragLeave: handleDragLeave,
            onDragOver: handleDragOver,
            onDrop: handleDrop,
        }
    };
};

export default useDragDrop;
