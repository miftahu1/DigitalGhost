'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // In a real app, you might show a specific UI or log to a service
      // For development, we'll use a toast to surface the contextual error
      toast({
        variant: 'destructive',
        title: 'Security Rules Error',
        description: `Operation: ${error.context.operation} at ${error.context.path}. Check your Firestore rules.`,
      });
      
      // We also throw it so it hits the Next.js error boundary/overlay in dev
      if (process.env.NODE_ENV === 'development') {
        console.error('Firestore Permission Denied:', error.context);
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
