import { useState } from 'react';

function useModalQueue(data) {
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
            clearQueue: () => {},
            
        };
    }

    const onMonthChange = (value) => {
        setMonth(value);
    };

    const addQueue = (member, mltcName) => {
        setAvailableMembers((prev) => {
            const updatedMltc = prev[mltcName].filter((m) => m.id !== member.id);
            return { ...prev, [mltcName]: updatedMltc };
        });

        setQueuedMembers((prev) => {
            const updatedMltc = prev[mltcName] ? [...prev[mltcName], member] : [member];
            return { ...prev, [mltcName]: updatedMltc };
        });
    };

    const removeQueue = (memberId, mltcName) => {
        if (!queuedMembers[mltcName]) return;

        const removedMember = queuedMembers[mltcName].find((m) => m.id === memberId);
        if (!removedMember) return;

        setQueuedMembers((prev) => {
            const updatedMltc = prev[mltcName].filter((m) => m.id !== memberId);
            return { ...prev, [mltcName]: updatedMltc };
        });

        setAvailableMembers((prev) => {
            const updatedMltc = prev[mltcName] ? [...prev[mltcName], removedMember] : [removedMember];
            return { ...prev, [mltcName]: updatedMltc };
        });
    };

    const addMltcQueue = (mltcName) => {
        setQueuedMembers((prev) => {
            const updatedQueued = { ...prev };
            const available = availableMembers[mltcName] || [];
    
            updatedQueued[mltcName] = [...available];
    
            return updatedQueued;
        });
    
        setAvailableMembers((prev) => {
            const updatedAvailable = { ...prev };
            delete updatedAvailable[mltcName];
            return updatedAvailable;
        });
    };
    
    const clearMltcQueue = (mltcName) => {
        setAvailableMembers((prev) => {
        const updatedAvailable = { ...prev };
        const queued = queuedMembers[mltcName] || [];
        const existing = updatedAvailable[mltcName] || [];

        updatedAvailable[mltcName] = [...queued, ...existing];

        return updatedAvailable;
    });
    
        setQueuedMembers((prev) => {
            const updatedQueued = { ...prev };
            delete updatedQueued[mltcName];
            return updatedQueued;
        });
    };
    

    const clearQueue = () => {
        setAvailableMembers((prev) => {
            const merged = { ...prev };
            Object.entries(queuedMembers).forEach(([mltcName, members]) => {
                merged[mltcName] = merged[mltcName] ? [...merged[mltcName], ...members] : members;
            });
            return merged;
        });
        setQueuedMembers({});
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
}

export default useModalQueue;