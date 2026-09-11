import { useEffect } from 'react';
import { useRouteError } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import * as Sentry from '@sentry/react';
import Button from '../FormElements/Button';

function RouteErrorBoundary() {
  const error = useRouteError();

  useEffect(() => {
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
      <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <AlertTriangle size={28} className="text-red-600" />
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
      <p className="text-gray-500 mb-6">We've been notified and are looking into it.</p>
      <Button to="/">Back to home</Button>
    </div>
  );
}

export default RouteErrorBoundary;