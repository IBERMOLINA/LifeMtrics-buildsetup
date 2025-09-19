'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import posthog from 'posthog-js';
export default function Providers({ children }) {
    useEffect(() => {
        const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
        if (!key)
            return;
        posthog.init(key, {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        });
    }, []);
    return _jsx(ClerkProvider, { children: children });
}
