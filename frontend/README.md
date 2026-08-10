# RoadSense AI – Smart Infrastructure Intelligence Platform

Enterprise-grade AI-powered web application for road damage detection, prioritization, predictive maintenance, analytics, and smart city infrastructure management.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Framer Motion, React Router DOM
- **Backend (future):** FastAPI, PostgreSQL, SQLAlchemy, JWT Authentication
- **AI (future):** YOLOv8, OpenCV, PyTorch

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── assets/          # Icons, images, logos
│   ├── components/      # Reusable UI components
│   │   ├── common/      # Shared components (Container, etc.)
│   │   ├── layout/      # Layout components (Navbar, Sidebar, Footer)
│   │   ├── dashboard/   # Dashboard components (future)
│   │   ├── reports/     # Report components (future)
│   │   ├── analytics/   # Analytics components (future)
│   │   ├── map/         # Map components (future)
│   │   ├── ai/          # AI components (future)
│   │   └── forms/       # Form components (future)
│   ├── pages/           # Route pages
│   ├── hooks/           # Custom React hooks (future)
│   ├── context/         # React context providers
│   ├── services/        # API service layer (future)
│   ├── utils/           # Utility functions (future)
│   ├── routes/          # Route configuration
│   ├── styles/          # Global styles (future)
│   ├── App.jsx          # Root application component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles (Tailwind)
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Design System

- **Colors:** Primary (blue), Secondary (slate), Success (green), Warning (amber), Danger (red), Info (cyan)
- **Typography:** Inter (sans), JetBrains Mono (monospace)
- **Spacing:** 8-point grid system
- **Border Radius:** Full token scale from xs to full
- **Shadows:** Full token scale from xs to 2xl
- **Animations:** Fade, Slide (up/down/left/right), Scale

