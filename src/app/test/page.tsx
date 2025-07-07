'use client';

import { supabase } from '@/lib/supabaseClient';
import { useEffect } from 'react';

export default function TestPage() {
  useEffect(() => {
    console.log('Direct import test - supabase client:', supabase);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Testing Supabase Client</h1>
      <p>Check the browser console for logs</p>
      <p>Environment variables:</p>
      <ul>
        <li>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'undefined'}</li>
        <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Found' : 'undefined'}</li>
      </ul>
    </div>
  );
}
