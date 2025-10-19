

'use client';

import { useEffect, useState } from 'react';
import { useToast } from './use-toast';
import { useAuth } from './use-auth';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();
  const { supabase } = useAuth();
  const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.Razorpay) {
      setIsLoaded(true);
      return;
    }

    const handleLoad = () => {
      setIsLoaded(true);
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_URL}"]`);
      if (existing) {
        existing.dataset.loaded = 'true';
      }
    };

    const handleError = () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load Razorpay Checkout.',
      });
    };

    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_URL}"]`);

    if (existingScript) {
      if (existingScript.dataset.loaded === 'true') {
        setIsLoaded(true);
      } else {
        existingScript.addEventListener('load', handleLoad);
        existingScript.addEventListener('error', handleError);
      }

      return () => {
        existingScript.removeEventListener('load', handleLoad);
        existingScript.removeEventListener('error', handleError);
      };
    }

    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);
    document.body.appendChild(script);

    return () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };
  }, [toast]);

  const openCheckout = (options: any) => {
    if (!razorpayKey) {
       console.error("Razorpay Key ID is not defined. Please check your environment variables.");
       toast({
        variant: 'destructive',
        title: 'Configuration Error',
        description: 'Payment gateway is not configured correctly.',
      });
      return;
    }
      
    if (!isLoaded || !supabase || typeof window === 'undefined' || !window.Razorpay) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Payment gateway is not ready. Please try again in a moment.',
      });
      return;
    }

    // New logic: Override the handler to include the auth token
    const originalHandler = options.handler;
    options.handler = async (response: any) => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            toast({
                variant: 'destructive',
                title: 'Authentication Error',
                description: 'You must be logged in to complete this payment. Please log in and try again.',
            });
            // Also call ondismiss if available to reset UI state
            if (options.modal && options.modal.ondismiss) {
              options.modal.ondismiss();
            }
            return;
        }

        const accessToken = session.access_token;
        
        // Pass the original response and the access token to the original handler
        if (originalHandler) {
            originalHandler(response, accessToken);
        }
    };


    const rzp = new window.Razorpay({ ...options, key: razorpayKey });
    rzp.open();
  };

  return { openCheckout, isLoaded };
}

