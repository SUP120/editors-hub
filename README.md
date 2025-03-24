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

## Deployment

### GitHub Setup

1. Create a new repository on GitHub
2. Initialize the local repository (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
```

3. Add your GitHub repository as remote:
```bash
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

### Vercel Deployment

1. Install Vercel CLI (optional):
```bash
npm i -g vercel
```

2. Deploy to Vercel:
- Option 1: Using Vercel Dashboard
  1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
  2. Import your GitHub repository
  3. Configure the following environment variables:
    - `NEXT_PUBLIC_CASHFREE_APP_ID`
    - `CASHFREE_SECRET_KEY`
    - `NEXT_PUBLIC_APP_URL`
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `SUPABASE_SERVICE_ROLE_KEY`

- Option 2: Using Vercel CLI
```bash
vercel
```

### Environment Variables

Make sure to set up these environment variables in your Vercel project:

```env
NEXT_PUBLIC_CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Production Checks

1. Ensure all environment variables are properly set in Vercel
2. Verify Supabase connection
3. Test Cashfree payment integration
4. Check CORS settings in vercel.json
5. Verify webhook endpoints are accessible

### Automatic Deployments

- The project is set up for automatic deployments when you push to the main branch
- Preview deployments are created for pull requests
- Production deployments happen from the main branch

For more details about the deployment process, check out [Vercel's Next.js deployment documentation](https://nextjs.org/docs/deployment).

## License

This project is private and proprietary.
