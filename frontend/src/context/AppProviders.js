import React from 'react';
import { UserProvider } from './UserContext';
import { MltcProvider } from './MltcContext';
import { SadcProvider } from './SadcContext';

const AppProviders = ({ children }) => (
  <UserProvider>
  <MltcProvider>
  <SadcProvider>
    {children}
  </SadcProvider>
  </MltcProvider>
  </UserProvider>
);

export default AppProviders;
