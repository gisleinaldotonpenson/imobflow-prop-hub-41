import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get environment variables with fallbacks
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase credentials are provided
const hasSupabaseCredentials = SUPABASE_URL && SUPABASE_ANON_KEY && 
                             !SUPABASE_URL.includes('your_') && 
                             !SUPABASE_ANON_KEY.includes('your_');

// Helper function to create a query builder with method chaining
const createQueryBuilder = (table: string, mockData: any[] = []) => {
  let query = {
    data: [...mockData],
    filters: {
      eq: [] as {column: string, value: any}[], 
      order: {column: 'created_at', ascending: false}
    },
    select: function(columns?: string) {
      // In a real implementation, this would filter the selected columns
      return this;
    },
    eq: function(column: string, value: any) {
      this.filters.eq.push({column, value});
      return this;
    },
    order: function(column: string, options: {ascending: boolean} = {ascending: false}) {
      this.filters.order = {column, ...options};
      return this;
    },
    then: function(onFulfilled: any) {
      // Apply filters
      let result = [...this.data];
      
      // Apply equality filters
      this.filters.eq.forEach(filter => {
        result = result.filter(item => item[filter.column] === filter.value);
      });
      
      // Apply sorting
      const {column, ascending} = this.filters.order;
      result.sort((a, b) => {
        if (a[column] < b[column]) return ascending ? -1 : 1;
        if (a[column] > b[column]) return ascending ? 1 : -1;
        return 0;
      });
      
      return Promise.resolve({
        data: result,
        error: null
      }).then(onFulfilled);
    },
    single: function() {
      return {
        then: (onFulfilled: any) => {
          return this.then(({data, error}: any) => {
            if (data && data.length > 0) {
              return onFulfilled({data: data[0], error: null});
            }
            return onFulfilled({data: null, error: {message: 'No rows returned'}});
          });
        }
      };
    }
  };
  
  return query;
};

// Create a mock Supabase client for development when credentials are missing
const createMockSupabaseClient = () => {
  if (import.meta.env.PROD) {
    console.error('Running in production without valid Supabase credentials');
  } else {
    console.warn('Running in development mode with mock Supabase client');
  }

  // Mock data for different tables
  const mockData: Record<string, any[]> = {
    properties: [
      {
        id: '1',
        title: 'Modern Apartment in Downtown',
        description: 'Beautiful modern apartment with great views',
        price: 250000,
        location: 'Downtown',
        bedrooms: 2,
        bathrooms: 2,
        area: 85,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    leads: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        status: 'New',
        source: 'Website',
        notes: 'Interested in 2-bedroom apartments',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    statuses: [
      { id: '1', name: 'New', color: '#3b82f6', order: 1, is_default: true },
      { id: '2', name: 'Contacted', color: '#8b5cf6', order: 2 },
      { id: '3', name: 'Qualified', color: '#10b981', order: 3 },
      { id: '4', name: 'Proposal Sent', color: '#f59e0b', order: 4 },
      { id: '5', name: 'Closed Won', color: '#10b981', order: 5 },
      { id: '6', name: 'Closed Lost', color: '#ef4444', order: 6 }
    ]
  };

  return {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signIn: async () => ({ data: { user: null, session: null }, error: null }),
      signOut: async () => ({ error: null }),
      user: () => ({ data: { user: null } }),
    },
    from: (table: string) => {
      // Return a query builder for the table
      return {
        select: () => createQueryBuilder(table, mockData[table] || []),
        insert: (data: any) => ({
          select: () => ({
            data: [{
              ...data,
              id: Math.random().toString(36).substr(2, 9),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }],
            error: null
          })
        }),
        update: (data: any) => ({
          eq: (column: string, value: any) => ({
            data: mockData[table]?.map(item => 
              item[column] === value ? {...item, ...data, updated_at: new Date().toISOString()} : item
            ) || [],
            error: null
          })
        }),
        delete: () => ({
          eq: (column: string, value: any) => ({
            data: mockData[table]?.filter(item => item[column] !== value) || [],
            error: null
          })
        })
      };
    },
    channel: (name: string) => ({
      on: (event: string, callback: Function) => {
        console.log(`[Mock] Subscribed to channel '${name}' for event '${event}'`);
        return {
          subscribe: () => ({
            unsubscribe: () => {
              console.log(`[Mock] Unsubscribed from channel '${name}'`);
            }
          })
        };
      }
    })
  } as unknown as ReturnType<typeof createClient<Database>>;
};

// Initialize Supabase client with proper error handling
let supabase: ReturnType<typeof createClient<Database>>;

if (hasSupabaseCredentials) {
  try {
    supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      }
    });
    console.log('Supabase client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    supabase = createMockSupabaseClient();
  }
} else {
  supabase = createMockSupabaseClient();
}

export { supabase };