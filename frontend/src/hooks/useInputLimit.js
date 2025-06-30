import { useCallback, useState, useEffect } from 'react';

const useInputLimit = () => {
	const [overLimitFields, setOverLimitFields] = useState({});
	const [inputLimitExceeded, setInputLimitExceeded] = useState(false);

	console.log(overLimitFields)

	const handleLimit = useCallback((key, tabIndex = null) => (exceeded) => {
		const scopedKey = tabIndex !== null ? `${tabIndex}-${key}` : key;
		setOverLimitFields(prev => ({ ...prev, [scopedKey]: exceeded }));
	}, []);

	const clearTabLimit = useCallback((tabIndex) => {
		setOverLimitFields(prev => {
			const newState = { ...prev };
			Object.keys(newState).forEach(key => {
				if (key.startsWith(`${tabIndex}-`)) {
					delete newState[key];
				}
			});
			return newState;
		});
	}, []);

	useEffect(() => {
		const anyExceeded = Object.values(overLimitFields).some(Boolean);
		setInputLimitExceeded(anyExceeded);
	}, [overLimitFields]);

	return { handleLimit, clearTabLimit, inputLimitExceeded };
};

export default useInputLimit;