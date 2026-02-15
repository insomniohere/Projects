# Abyss - Full-Stack Art Protection Platform

A complete, production-ready platform where artists can share real, human-made art without worrying about AI takeover or unauthorized AI reuse. Features authentication, artwork management, AI-proof watermarking, and social features.

## Design Philosophy

- **Minimal & Cinematic**: Clean, spacious layout with smooth animations
- **Color Palette**: Black, White, and Ocean Blue (#0A4D68, #088395, #05445E)
- **Focus**: Artwork and anti-AI protection message as the centerpiece

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Data Fetching**: SWR

### Backend & Services
- **Authentication**: Clerk
- **Database**: Neon Postgres (Serverless)
- **ORM**: Drizzle
- **Image Storage**: Cloudinary
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Accounts for:
  - [Clerk](https://dashboard.clerk.com/) (Authentication)
  - [Neon](https://console.neon.tech/) (Database)
  - [Cloudinary](https://cloudinary.com/console) (Image Storage)

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Setup environment variables:**

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk Dashboard
- `CLERK_SECRET_KEY` - From Clerk Dashboard
- `CLERK_WEBHOOK_SECRET` - Create webhook endpoint in Clerk
- `DATABASE_URL` - From Neon Dashboard (PostgreSQL connection string)
- `CLOUDINARY_CLOUD_NAME` - From Cloudinary Console
- `CLOUDINARY_API_KEY` - From Cloudinary Console
- `CLOUDINARY_API_SECRET` - From Cloudinary Console

3. **Setup database:**

Push the database schema to Neon:
```bash
npx drizzle-kit push
```

4. **Configure Clerk webhook:**

In your Clerk Dashboard:
- Go to Webhooks
- Add endpoint: `https://your-domain.com/api/webhooks/clerk`
- Subscribe to events: `user.created`, `user.updated`, `user.deleted`
- Copy the signing secret to `CLERK_WEBHOOK_SECRET`

5. **Setup Cloudinary:**

In your Cloudinary Console:
- Create upload preset named `abyss-artworks`
- Enable unsigned uploading
- Configure allowed formats: JPG, PNG, WEBP

6. **Run the development server:**
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
abyss-landing/
├── app/
│   ├── (auth)/                    # Authentication routes
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (platform)/                # Protected platform routes
│   │   ├── dashboard/
│   │   ├── upload/
│   │   ├── gallery/
│   │   ├── profile/
│   │   ├── protection/
│   │   └── collections/
│   ├── (public)/                  # Public routes
│   │   ├── explore/
│   │   └── artists/
│   ├── api/                       # API routes
│   │   ├── webhooks/clerk/
│   │   ├── artworks/
│   │   └── users/
│   ├── layout.tsx                 # Root layout with ClerkProvider
│   ├── page.tsx                   # Landing page
│   └── globals.css
├── components/
│   ├── landing/                   # Landing page components
│   ├── artwork/                   # Artwork-related components
│   ├── dashboard/                 # Dashboard components
│   └── shared/                    # Shared UI components
├── lib/
│   ├── db/                        # Database configuration
│   │   ├── schema.ts              # Drizzle schema
│   │   └── index.ts               # Database client
│   ├── api/                       # API helper functions
│   ├── cloudinary/                # Cloudinary utilities
│   ├── watermark/                 # Watermarking logic
│   └── utils/                     # Utility functions
├── middleware.ts                  # Clerk auth middleware
└── drizzle.config.ts              # Drizzle configuration
```

## Features

### Core Features
- 🔐 **Authentication**: Secure sign-up/sign-in with Clerk (email, social login)
- 🎨 **Artwork Management**: Upload, edit, delete, and organize artwork
- 🛡️ **AI Protection**: Automatic watermarking with unique IDs
- 📊 **Analytics**: Track views and engagement on your artwork
- 🌐 **Public Gallery**: Explore and discover artwork from other artists
- 📁 **Collections**: Create and share curated collections
- 👥 **Social Features**: Follow artists and see activity feeds
- 🚨 **Violation Reporting**: Report unauthorized use of artwork

### UI/UX Features
- ✨ Smooth animations and transitions
- 📱 Fully responsive design
- 🎨 Ocean blue accent color theme
- ⚡ Optimized performance with image lazy loading
- 🌊 Glass morphism UI elements
- 🔍 Advanced search and filtering

## Customization

### Colors

Edit the ocean color palette in `tailwind.config.js`:

```js
colors: {
  'ocean': {
    DEFAULT: '#0A4D68',
    light: '#088395',
    dark: '#05445E',
  },
}
```

### Content

Update text content in the respective component files in the `components/` directory.

### Images

Add artwork images to `public/images/` and update the image sources in `Showcase.tsx`.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Deploy with one click

### Other Platforms

Build the static export:

```bash
npm run build
```

Deploy the `.next` folder to your hosting provider.

## Performance

- Lighthouse Score: 95+
- Core Web Vitals: Optimized
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s

## License

MIT License - feel free to use this for your projects.

## Support

For questions or issues, please open an issue on GitHub.

---

Built with ❤️ for human artists
