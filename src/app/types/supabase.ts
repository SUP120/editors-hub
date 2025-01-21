import { User as SupabaseUser } from '@supabase/supabase-js';

export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export interface User extends SupabaseUser {
  email: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface ArtistProfile extends Profile {
  display_name: string;
  bio: string;
  location: string;
  phone: string;
  professional_title: string;
  years_of_experience: number;
  portfolio_url?: string;
  is_verified: boolean;
}

export interface Work {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  before_images?: string[];
  after_images?: string[];
  video_url?: string;
  artist_id: string;
  created_at: string;
  tags: string[];
}

export interface Order {
  id: string;
  work_id: string;
  client_id: string;
  artist_id: string;
  status: string;
  created_at: string;
  amount: number;
  payment_status: string;
}

export interface Message {
  id: string;
  order_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  attachments?: string[];
}

export interface PaymentRequest {
  id: string;
  artist_id: string;
  amount: number;
  status: string;
  created_at: string;
} 