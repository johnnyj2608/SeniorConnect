import { useState, useEffect, useCallback } from 'react';

const useInputLimit = (setInputLimitExceeded) => {
    const [overLimitFields, setOverLimitFields] = useState({});

    useEffect(() => {
		const hasLimitExceeded = Object.values(overLimitFields).some(Boolean);
		setInputLimitExceeded(hasLimitExceeded);
    }, [overLimitFields, setInputLimitExceeded]);

    const handleLimit = useCallback((key) => (isExceeded) => {
		setOverLimitFields((prev) => {
			if (prev[key] === isExceeded) return prev;
			return { ...prev, [key]: isExceeded };
		});
    }, []);

    return handleLimit;
};

export default useInputLimit;
