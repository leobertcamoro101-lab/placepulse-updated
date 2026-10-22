import { useEffect } from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { AlertTriangle, FileQuestion } from 'lucide-react';
import * as Sentry from '@sentry/react';
import Button from '../FormElements/Button';

function RouteErrorBoundary() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  useEffect(() => {
    if (!is404) {
      console.error(error);
      Sentry.captureException(error);
    }
  }, [error, is404]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
      <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
        {is404 ? (
          <FileQuestion size={28} className="text-red-600" />
        ) : (
          <AlertTriangle size={28} className="text-red-600" />
        )}
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">
        {is404 ? 'Page Not Found' : 'Something went wrong'}
      </h1>
      <p className="text-gray-500 mb-6">
        {is404
          ? "Sorry, we couldn't find the page you're looking for."
          : "We've been notified and are looking into it."}
      </p>
      <Button to="/">Back to home</Button>
    </div>
  );
}

export default RouteErrorBoundary;
