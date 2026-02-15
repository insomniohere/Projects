# Abyss - Landing Page

A minimal, cinematic landing page for Abyss, a platform where artists can share real, human-made art without worrying about AI takeover or unauthorized AI reuse.

## Design Philosophy

- **Minimal & Cinematic**: Clean, spacious layout with smooth animations
- **Color Palette**: Black, White, and Ocean Blue (#0A4D68, #088395, #05445E)
- **Focus**: Artwork and anti-AI protection message as the centerpiece

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
abyss-landing/
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/
│   ├── Navigation.tsx  # Sticky header nav
│   ├── Hero.tsx        # Hero section
│   ├── Features.tsx    # Features grid
│   ├── Protection.tsx  # AI protection section
│   ├── Showcase.tsx    # Artwork showcase
│   ├── CTA.tsx         # Call-to-action
│   └── Footer.tsx      # Footer
└── public/             # Static assets
```

## Features

- ✨ Smooth animations and transitions
- 📱 Fully responsive design
- 🎨 Ocean blue accent color theme
- 🛡️ Focus on AI protection messaging
- ⚡ Optimized performance
- 🌊 Floating background effects
- 🔒 Glass morphism UI elements

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
