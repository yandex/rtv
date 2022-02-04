import React from 'react';

import ErrorPage from './ErrorPage/ErrorPage';

interface State {
  hasError: boolean;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export default class ErrorBoundary extends React.Component<{}, State> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage />;
    }

    return this.props.children;
  }
}
