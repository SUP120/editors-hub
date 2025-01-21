# Artist Hiring Platform

A modern web platform for connecting clients with talented artists. Built with Next.js, Supabase, and TailwindCSS.

## Features

- **User Authentication**
  - Email-based authentication
  - Separate artist and client profiles
  - Profile management

- **Artist Features**
  - Portfolio management
  - Work showcase
  - Order management
  - Earnings tracking
  - Payment withdrawals
  - Reviews and ratings

- **Client Features**
  - Browse artist works
  - Place orders
  - Real-time chat with artists
  - Review and rate completed work
  - Order history

- **Platform Features**
  - Real-time notifications
  - Email notifications
  - Secure payment processing
  - Admin dashboard
  - Chat system
  - File sharing

## Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Email**: Resend
- **Styling**: TailwindCSS, Custom UI Components
- **State Management**: React Context
- **File Storage**: Supabase Storage

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Resend account (for emails)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Setup

1. Create a new Supabase project
2. Run the following tables in Supabase SQL editor:

```sql
-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade,
  full_name text,
  display_name text,
  avatar_url text,
  bio text,
  email text,
  location text,
  phone_number text,
  is_artist boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

-- Create artist_profiles table
create table artist_profiles (
  id uuid references profiles(id) on delete cascade,
  specialty text[],
  skills text[],
  hourly_rate numeric,
  portfolio_urls text[],
  years_of_experience integer,
  education text[],
  certifications text[],
  languages text[],
  social_links jsonb,
  rating numeric default 0,
  total_reviews integer default 0,
  availability_status text default 'available',
  primary key (id)
);

-- Create works table
create table works (
  id uuid default uuid_generate_v4(),
  artist_id uuid references profiles(id) on delete cascade,
  title text,
  description text,
  price numeric,
  delivery_time integer,
  category text,
  subcategory text,
  images text[],
  tags text[],
  status text default 'active',
  requirements text,
  revisions integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

-- Create orders table
create table orders (
  id uuid default uuid_generate_v4(),
  work_id uuid references works(id) on delete cascade,
  client_id uuid references profiles(id),
  artist_id uuid references profiles(id),
  status text default 'pending',
  payment_status text default 'pending',
  requirements text,
  project_files_link text,
  completed_work_link text,
  total_amount numeric,
  platform_fee numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

-- Create messages table
create table messages (
  id uuid default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  sender_id uuid references profiles(id),
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

-- Create reviews table
create table reviews (
  id uuid default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  artist_id uuid references profiles(id),
  client_id uuid references profiles(id),
  rating integer,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

-- Create artist_earnings table
create table artist_earnings (
  id uuid default uuid_generate_v4(),
  artist_id uuid references profiles(id) on delete cascade,
  total_earned numeric default 0,
  pending_amount numeric default 0,
  last_payout_date timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

-- Create payment_requests table
create table payment_requests (
  id uuid default uuid_generate_v4(),
  artist_id uuid references profiles(id) on delete cascade,
  amount numeric,
  status text default 'pending',
  requested_at timestamp with time zone default timezone('utc'::text, now()),
  processed_at timestamp with time zone,
  primary key (id)
);

-- Create payment_details table
create table payment_details (
  id uuid default uuid_generate_v4(),
  artist_id uuid references profiles(id) on delete cascade,
  upi_id text,
  bank_name text,
  account_number text,
  ifsc_code text,
  account_holder_name text,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);
```

3. Enable Row Level Security (RLS) and set up appropriate policies

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/artist-hiring.git
cd artist-hiring
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

The easiest way to deploy this app is to use the [Vercel Platform](https://vercel.com).

1. Push your code to GitHub
2. Import your repository to Vercel
3. Add environment variables
4. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
