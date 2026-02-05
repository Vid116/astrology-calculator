export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
          billing_address: Json | null;
          payment_method: Json | null;
          calculation_count: number;
          calculation_reset_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          billing_address?: Json | null;
          payment_method?: Json | null;
          calculation_count?: number;
          calculation_reset_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          billing_address?: Json | null;
          payment_method?: Json | null;
          calculation_count?: number;
          calculation_reset_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          stripe_customer_id: string | null;
        };
        Insert: {
          id: string;
          stripe_customer_id?: string | null;
        };
        Update: {
          id?: string;
          stripe_customer_id?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          active: boolean | null;
          name: string | null;
          description: string | null;
          image: string | null;
          metadata: Json | null;
        };
        Insert: {
          id: string;
          active?: boolean | null;
          name?: string | null;
          description?: string | null;
          image?: string | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          active?: boolean | null;
          name?: string | null;
          description?: string | null;
          image?: string | null;
          metadata?: Json | null;
        };
      };
      prices: {
        Row: {
          id: string;
          product_id: string | null;
          active: boolean | null;
          description: string | null;
          unit_amount: number | null;
          currency: string | null;
          type: 'one_time' | 'recurring' | null;
          interval: 'day' | 'week' | 'month' | 'year' | null;
          interval_count: number | null;
          trial_period_days: number | null;
          metadata: Json | null;
        };
        Insert: {
          id: string;
          product_id?: string | null;
          active?: boolean | null;
          description?: string | null;
          unit_amount?: number | null;
          currency?: string | null;
          type?: 'one_time' | 'recurring' | null;
          interval?: 'day' | 'week' | 'month' | 'year' | null;
          interval_count?: number | null;
          trial_period_days?: number | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          product_id?: string | null;
          active?: boolean | null;
          description?: string | null;
          unit_amount?: number | null;
          currency?: string | null;
          type?: 'one_time' | 'recurring' | null;
          interval?: 'day' | 'week' | 'month' | 'year' | null;
          interval_count?: number | null;
          trial_period_days?: number | null;
          metadata?: Json | null;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          status: 'trialing' | 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid' | 'paused' | null;
          metadata: Json | null;
          price_id: string | null;
          quantity: number | null;
          cancel_at_period_end: boolean | null;
          created: string;
          current_period_start: string;
          current_period_end: string;
          ended_at: string | null;
          cancel_at: string | null;
          canceled_at: string | null;
          trial_start: string | null;
          trial_end: string | null;
        };
        Insert: {
          id: string;
          user_id: string;
          status?: 'trialing' | 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid' | 'paused' | null;
          metadata?: Json | null;
          price_id?: string | null;
          quantity?: number | null;
          cancel_at_period_end?: boolean | null;
          created?: string;
          current_period_start?: string;
          current_period_end?: string;
          ended_at?: string | null;
          cancel_at?: string | null;
          canceled_at?: string | null;
          trial_start?: string | null;
          trial_end?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: 'trialing' | 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid' | 'paused' | null;
          metadata?: Json | null;
          price_id?: string | null;
          quantity?: number | null;
          cancel_at_period_end?: boolean | null;
          created?: string;
          current_period_start?: string;
          current_period_end?: string;
          ended_at?: string | null;
          cancel_at?: string | null;
          canceled_at?: string | null;
          trial_start?: string | null;
          trial_end?: string | null;
        };
      };
      user_roles: {
        Row: {
          user_id: string;
          is_admin: boolean;
          is_superuser: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          is_admin?: boolean;
          is_superuser?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          is_admin?: boolean;
          is_superuser?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      keywords: {
        Row: {
          id: string;
          type: 'planet' | 'sign';
          name: string;
          keywords: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: 'planet' | 'sign';
          name: string;
          keywords?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: 'planet' | 'sign';
          name?: string;
          keywords?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          user_id: string;
          avatar_url: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          avatar_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string;
          avatar_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      study_notes: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          image_url: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: string;
          image_url: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: string;
          image_url?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      availability_slots: {
        Row: {
          id: string;
          superuser_id: string;
          start_time: string;
          end_time: string;
          duration_minutes: number | null;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          superuser_id: string;
          start_time: string;
          end_time: string;
          duration_minutes?: number | null;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          superuser_id?: string;
          start_time?: string;
          end_time?: string;
          duration_minutes?: number;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      consultation_bookings: {
        Row: {
          id: string;
          slot_id: string;
          user_id: string;
          superuser_id: string;
          scheduled_start: string;
          scheduled_end: string;
          duration_minutes: number;
          status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
          user_name: string;
          user_email: string;
          user_phone: string | null;
          birth_date: string | null;
          birth_time: string | null;
          birth_place: string | null;
          consultation_topic: string | null;
          additional_notes: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
          approved_at: string | null;
        };
        Insert: {
          id?: string;
          slot_id: string;
          user_id: string;
          superuser_id: string;
          scheduled_start: string;
          scheduled_end: string;
          duration_minutes: number;
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
          user_name: string;
          user_email: string;
          user_phone?: string | null;
          birth_date?: string | null;
          birth_time?: string | null;
          birth_place?: string | null;
          consultation_topic?: string | null;
          additional_notes?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
          approved_at?: string | null;
        };
        Update: {
          id?: string;
          slot_id?: string;
          user_id?: string;
          superuser_id?: string;
          scheduled_start?: string;
          scheduled_end?: string;
          duration_minutes?: number;
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
          user_name?: string;
          user_email?: string;
          user_phone?: string | null;
          birth_date?: string | null;
          birth_time?: string | null;
          birth_place?: string | null;
          consultation_topic?: string | null;
          additional_notes?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
          approved_at?: string | null;
        };
      };
    };
    Functions: {
      increment_calculation_count: {
        Args: { user_uuid: string };
        Returns: {
          new_count: number;
          reset_date: string;
          is_reset: boolean;
        }[];
      };
    };
  };
};

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type User = Tables<'users'>;
export type Customer = Tables<'customers'>;
export type Product = Tables<'products'>;
export type Price = Tables<'prices'>;
export type Subscription = Tables<'subscriptions'>;
export type UserRole = Tables<'user_roles'>;
export type Keyword = Tables<'keywords'>;
export type Profile = Tables<'profiles'>;
export type StudyNote = Tables<'study_notes'>;
export type AvailabilitySlot = Tables<'availability_slots'>;
export type ConsultationBooking = Tables<'consultation_bookings'>;

export type BookingStatus = ConsultationBooking['status'];

// A computed time slot within an availability window
export type SelectedTimeSlot = {
  slot_id: string;
  superuser_id: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
};

export type SubscriptionWithPrice = Subscription & {
  prices: Price | null;
};

export type SubscriptionStatus = Subscription['status'];
