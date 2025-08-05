import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { MainErrorFallback } from './errors/ErrorFallback';

interface Props {
  children: React.ReactNode;
}

const ErrorBoundary: React.FC<Props> = ({ children }) => (
  <ReactErrorBoundary
    //@ts-ignore
    FallbackComponent={MainErrorFallback}
    onReset={() => window.location.reload()}
  >
    {children}
  </ReactErrorBoundary>
);

export default ErrorBoundary;
