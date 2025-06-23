import React from 'react';
import { useTranslation } from 'react-i18next';

const ListInput = ({ data = [], onChange, disabled }) => {
    const { t } = useTranslation();

    const handleItemChange = (index) => (e) => {
        const newItems = [...data];
        newItems[index] = e.target.value;
        onChange?.({ target: { value: newItems } });
    };

    const addItem = () => {
        const newItems = [...data, ''];
        onChange?.({ target: { value: newItems } });
    };

    const removeItem = (index) => () => {
        const newItems = data.filter((_, i) => i !== index);
        onChange?.({ target: { value: newItems } });
    };

    return (
        <div className="list-input-container">
            <div className="list-input-textfields">
                {data.map((item, index) => (
                    <div className="input-with-button danger" key={index}>
                        <input
                            type="text"
                            value={item}
                            onChange={handleItemChange(index)}
                            disabled={disabled}
                        />
                        <button type="button" onClick={removeItem(index)} disabled={disabled}>—</button>
                    </div>
                ))}
            </div>
            {!disabled && (
                <span onClick={addItem}>{t('settings.admin.click_to_add_more')}</span>
            )}
        </div>
    );
};

export default ListInput;
