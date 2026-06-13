import React from 'react';
import RemoteRouter, { RemoteRouterProps } from './RemoteRouter';

export type RemoteAppProps = RemoteRouterProps;

const RemoteApp: React.FC<RemoteAppProps> = (props) => <RemoteRouter {...props} />;

export default RemoteApp;
