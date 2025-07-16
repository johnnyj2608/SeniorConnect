import React from 'react';
import { UserProvider } from './UserContext';
import { MltcProvider } from './MltcContext';
import { SadcProvider } from './SadcContext';
import { GiftProvider } from './GiftContext';

const providers = [
  GiftProvider,
  UserProvider,
  MltcProvider,
  SadcProvider,
];

const AppProviders = ({ children }) =>
  providers.reduceRight(
    (acc, Provider) => <Provider>{acc}</Provider>,
    children
  );

export default AppProviders;
