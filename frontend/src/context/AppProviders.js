import React from 'react';
import { MltcProvider } from './MltcContext';
import { SadcProvider } from './SadcContext';

const AppProviders = ({ children }) => (
  <MltcProvider>
    <SadcProvider>
      {children}
    </SadcProvider>
  </MltcProvider>
);

export default AppProviders;
