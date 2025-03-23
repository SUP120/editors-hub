# Artist Hiring Platform

A platform connecting artists with clients for creative projects.

## Features

- Artist portfolios and work showcase
- Client project posting
- Secure payment integration with Cashfree
- Real-time messaging
- Project management
- Review system

## Tech Stack

- Next.js 14
- React 18
- Supabase
- Tailwind CSS
- Cashfree Payment Gateway
- TypeScript

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/artist-hiring.git
cd artist-hiring
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Deployment

The site is deployed on Vercel and accessible at:
- Production: [https://www.editorshub.in](https://www.editorshub.in)

## Environment Variables

For production deployment, set these environment variables in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=https://www.editorshub.in
NEXT_PUBLIC_CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
```

## Payment Integration

The platform uses Cashfree Payment Gateway for handling payments. For testing:

- Test Card: 4111 1111 1111 1111
- Any future expiry date
- Any CVV
- OTP: 123456

## License

This project is private and proprietary.
