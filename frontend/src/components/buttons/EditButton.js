import React, { memo } from 'react';
import { ReactComponent as Pencil } from '../../assets/pencil.svg';

const EditButton = ({ onClick }) => {
  return (
    <button className="icon-button absolute" onClick={onClick}>
      <Pencil />
    </button>
  );
};

export default memo(EditButton);