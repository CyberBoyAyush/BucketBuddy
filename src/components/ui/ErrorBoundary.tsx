"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
          <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-8 max-w-md leading-relaxed">
            We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-6 py-3 bg-white text-black hover:bg-gray-100 rounded-lg transition-all duration-150 font-medium"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </button>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mt-8 p-4 bg-black border border-white/10 rounded-lg text-left max-w-2xl">
              <summary className="cursor-pointer text-red-400 font-medium hover:text-red-300 transition-colors">
                Error Details (Development)
              </summary>
              <pre className="mt-3 text-xs text-gray-400 overflow-auto font-mono leading-relaxed">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: T) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
