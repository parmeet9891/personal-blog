# Personal Blog Website

A personal blog website for Parmeet built with Next.js 14, TypeScript, Tailwind CSS, and MongoDB.

## Features

- **Dark Theme Design**: Minimalist black background with white/subtle white text
- **Responsive Layout**: Centered content container with subtle borders
- **MongoDB Integration**: Data persistence with Mongoose ODM
- **Admin Panel**: Secure content management system
- **Markdown Support**: Rich content rendering with react-markdown
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Content**: react-markdown with remark-gfm
- **Authentication**: Custom session-based authentication

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud instance)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your MongoDB connection string and other configuration.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `NEXTAUTH_SECRET`: Secret key for session management
- `NEXTAUTH_URL`: Application URL (for production)
- `ADMIN_USERNAME`: Admin username (default: Parmeet)
- `ADMIN_PASSWORD`: Admin password (default: Parmeet8826)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── Layout/            # Layout components (Header, ContentContainer)
│   ├── Article/           # Article display components
│   └── Admin/             # Admin interface components
├── lib/
│   ├── mongodb.ts         # Database connection
│   ├── auth.ts            # Authentication utilities
│   └── models/            # Mongoose schemas
└── types/                 # TypeScript type definitions
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

This project is for personal use.