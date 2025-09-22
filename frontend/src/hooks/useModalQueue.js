import { useState } from 'react';

const useModalQueue = (data) => {
    const initialAvailable = { ...data.data };
    if ('unknown' in initialAvailable) {
        delete initialAvailable.unknown;
    }

    const [queuedMembers, setQueuedMembers] = useState({});
    const [availableMembers, setAvailableMembers] = useState(initialAvailable);
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

    if (data?.type !== 'attendance') {
        return {
            queuedMembers: {},
            availableMembers: {},
            month: '',
            onMonthChange: () => {},
            addQueue: () => {},
            removeQueue: () => {},
            addMltcQueue: () => {},
            clearMltcQueue: () => {},
            clearQueue: () => {},
        };
    }

    const onMonthChange = (value) => {
        setMonth(value);
    };

    const addQueue = (member, mltcName) => {
        setAvailableMembers(prev => ({
            ...prev,
            [mltcName]: prev[mltcName].filter(m => m.id !== member.id),
        }));

        setQueuedMembers(prev => ({
            ...prev,
            [mltcName]: prev[mltcName] ? [...prev[mltcName], member] : [member],
        }));
    };

    const removeQueue = (memberId, mltcName) => {
        setQueuedMembers(prevQueued => {
            const queuedList = prevQueued[mltcName] || [];
            const removedMember = queuedList.find(m => m.id === memberId);
            if (!removedMember) return prevQueued;

            const updatedQueued = queuedList.filter(m => m.id !== memberId);

            setAvailableMembers(prevAvailable => ({
                ...prevAvailable,
                [mltcName]: prevAvailable[mltcName]
                    ? [...prevAvailable[mltcName], removedMember]
                    : [removedMember],
            }));

            return { ...prevQueued, [mltcName]: updatedQueued };
        });
    };

    const addMltcQueue = (mltcName) => {
        setQueuedMembers(prev => ({
            ...prev,
            [mltcName]: availableMembers[mltcName] ? [...availableMembers[mltcName]] : [],
        }));

        setAvailableMembers(prev => {
            const updated = { ...prev };
            delete updated[mltcName];
            return updated;
        });
    };

    const clearMltcQueue = (mltcName) => {
        setQueuedMembers(prevQueued => {
            const queued = prevQueued[mltcName] || [];
            setAvailableMembers(prevAvailable => ({
                ...prevAvailable,
                [mltcName]: prevAvailable[mltcName]
                    ? [...prevAvailable[mltcName], ...queued]
                    : [...queued],
            }));

            const updatedQueued = { ...prevQueued };
            delete updatedQueued[mltcName];
            return updatedQueued;
        });
    };

    const clearQueue = () => {
        setQueuedMembers(prevQueued => {
            setAvailableMembers(prevAvailable => {
                const merged = { ...prevAvailable };
                Object.entries(prevQueued).forEach(([mltcName, members]) => {
                    merged[mltcName] = merged[mltcName]
                        ? [...merged[mltcName], ...members]
                        : [...members];
                });
                return merged;
            });
            return {};
        });
    };

    return {
        queuedMembers,
        availableMembers,
        month,
        onMonthChange,
        addQueue,
        removeQueue,
        addMltcQueue,
        clearMltcQueue,
        clearQueue,
    };
};

export default useModalQueue;