# 🎵 SoundSpire - Music Discovery & Artist Community Platform

A modern music platform connecting fans with artists through personalized discovery, community building, and social interaction.

## 📖 Table of Contents
- [What is SoundSpire?](#what-is-soundspire)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Video Pipeline](#video-pipeline)
- [How It Works](#how-it-works)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

---

## 🎯 What is SoundSpire?

SoundSpire is a music platform that helps you:
- **Discover new artists** based on your music preferences
- **Join artist communities** and interact with your favorite musicians
- **Write and read reviews** about artists and their work
- **Connect with other music fans** who share your taste

### Two Types of Users:
1. **Music Fans** - Discover artists, write reviews, join communities
2. **Artists** - Create communities, engage with fans, build your presence

---

## ✨ Key Features

### For Music Fans
- 🎧 **Personalized Recommendations** - Get artist suggestions based on your favorite genres and languages
- ⭐ **Review System** - Write detailed reviews with ratings
- 💬 **Community Forums** - Discuss music in artist-specific communities
- 🔍 **Smart Discovery** - Explore artists by genre, language, or popularity
- 👤 **User Profiles** - Customize your profile and track your activity
- 📰 **Feed** - Browse posts from artists you follow
- 🔔 **Notifications** - Stay updated on activity in your communities

### For Artists
- 🎤 **Artist Communities** - Create subscription-based fan communities
- 📊 **Fan Engagement** - Interact directly with your audience
- 🎨 **Content Sharing** - Share updates, fan art, and exclusive content
- 🎬 **Video Posts** - Upload videos with automatic HLS transcoding for adaptive streaming

### Social Features
- 💬 Comments & Replies
- ❤️ Likes & Reactions
- 🔔 Real-time Notifications
- 👥 Community Presence Tracking
- 🔎 Global Search

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first styling
- **React Context** - State management

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **PostgreSQL** - Relational database
- **Sequelize** - ORM for database operations
- **JWT** - Secure authentication

### External Services
- **Google OAuth** - Social login
- **AWS S3** - File storage
- **AWS MediaConvert** - Video transcoding to HLS
- **AWS CDK** - Infrastructure as code
- **Soundcharts API** - Artist data
- **Supabase** - DB Hosting
- **AWS Amplify** - Website hosting

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Git installed

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd soundspire-frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Setup SSL Certificates (for HTTPS)
```bash
# Install mkcert (if not already installed)
# macOS: brew install mkcert
# Windows: choco install mkcert

mkcert -install
mkcert localhost
```

### Step 4: Setup Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database Configuration
DB_NAME=soundspire_db
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Base URLs
NEXT_PUBLIC_BASE_URL=https://localhost:3000
NEXTAUTH_URL=https://localhost:3000
DOMAIN=https://localhost:3000

# JWT Secret (Generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your_generated_secret
JWT_SECRET=your_jwt_secret

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_bucket_name

# Soundcharts API (Optional)
SOUNDCHARTS_CLIENT_ID=your_soundcharts_id
SOUNDCHARTS_TOKEN=your_soundcharts_token

# Email Service
MAILTRAP_USER=your_mailtrap_user
MAILTRAP_PASS=your_mailtrap_password

# Gmail (alternative to Mailtrap for production)
GMAIL_USER=your_gmail_address
GMAIL_APP_PASSWORD=your_gmail_app_password
GMAIL_SERVICE=gmail
GMAIL_HOST=smtp.gmail.com
GMAIL_SMTP_PORT=587
```

### Step 5: (Optional) Deploy Video Pipeline Infrastructure

Required only if you want video upload + HLS transcoding to work. See [VIDEO_PIPELINE.md](./VIDEO_PIPELINE.md) for full instructions.

```bash
cd lambda && npm install
cd ../infra && npm install && npm run build
npx cdk bootstrap  # first time only
npx cdk deploy
```

### Step 6: Run the Development Server
```bash
npm run dev
```

Open [https://localhost:3000](https://localhost:3000) in your browser.

---

## 📁 Project Structure

```
soundspire-frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (protected)/         # Auth-required pages
│   │   │   ├── explore/         # Main discovery page
│   │   │   ├── feed/            # Post feed
│   │   │   ├── communities/     # Browse communities
│   │   │   ├── reviews/         # Reviews pages
│   │   │   ├── profile/         # User profile
│   │   │   ├── my-music/        # User's music
│   │   │   ├── notifications/   # Notifications
│   │   │   └── settings/        # Account settings
│   │   ├── (artist)/            # Artist-specific pages
│   │   │   └── artist/          # Artist dashboard & onboarding
│   │   ├── community/[slug]/    # Community detail page
│   │   ├── api/                 # Backend API routes
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── users/          # User management
│   │   │   ├── artists/        # Artist data
│   │   │   ├── community/      # Community features
│   │   │   ├── communities/    # Community listing
│   │   │   ├── reviews/        # Review system
│   │   │   ├── preferences/    # User preferences
│   │   │   ├── posts/          # Post CRUD
│   │   │   ├── forums/         # Forum management
│   │   │   ├── forum-posts/    # Forum post CRUD
│   │   │   ├── comments/       # Comments
│   │   │   ├── like/           # Like/unlike
│   │   │   ├── notifications/  # Notifications
│   │   │   ├── search/         # Global search
│   │   │   ├── upload/         # File & multipart upload
│   │   │   ├── video/          # Video status polling
│   │   │   └── images/         # Image proxy (presigned S3)
│   │   ├── login/              # Login page
│   │   ├── complete-profile/   # Profile completion
│   │   ├── forgot-password/    # Password reset request
│   │   ├── reset-password/     # Password reset
│   │   ├── verifyemail/        # Email verification
│   │   └── PreferenceSelectionPage/  # Onboarding
│   │
│   ├── components/              # Reusable UI components
│   │   ├── Navbar.tsx          # Navigation bar
│   │   ├── MobileNav.tsx       # Mobile navigation
│   │   ├── ArtistCard.tsx      # Artist display card
│   │   ├── ReviewCard.tsx      # Review display
│   │   ├── CommentsSection.tsx # Comment system
│   │   ├── CommunityHeader.tsx # Community page header
│   │   ├── ImageCropModal.tsx  # Image cropping on upload
│   │   ├── HLSVideo.tsx        # HLS video player (hls.js)
│   │   ├── MediaSlideShow.tsx  # Media slideshow
│   │   ├── Posts/
│   │   │   ├── Post.tsx        # Single post component
│   │   │   ├── PostCarousel.tsx
│   │   │   └── PostComment.tsx
│   │   └── ui/                 # Base UI components
│   │
│   ├── models/                  # Database models (Sequelize)
│   │   ├── User.ts
│   │   ├── Artist.ts
│   │   ├── Community.ts
│   │   ├── Review.ts
│   │   ├── Post.ts
│   │   ├── Forum.ts
│   │   ├── ForumPost.ts
│   │   ├── Comment.ts
│   │   ├── Like.ts
│   │   ├── Social.ts
│   │   ├── Notification.ts
│   │   ├── ArtistVote.ts
│   │   ├── UserVerification.ts
│   │   ├── UserPreferences.ts
│   │   ├── Genres.ts
│   │   ├── Languages.ts
│   │   ├── CommunitySubscription.ts
│   │   └── associations.ts     # Model relationships
│   │
│   ├── context/                 # React Context providers
│   │   └── AuthContext.tsx     # Authentication state
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useRequireAuth.ts   # Auth protection
│   │   ├── useCheckPreferences.ts
│   │   ├── useCheckCompleteProfileOnRoute.ts
│   │   ├── useCommunityPresence.ts
│   │   └── useRedirectIfAuthenticated.ts
│   │
│   ├── lib/                     # Utility functions
│   │   ├── sequelize.ts        # Database connection
│   │   ├── auth.ts             # Auth helpers
│   │   ├── dbConfig.ts         # DB configuration
│   │   └── supabaseClient.ts   # Supabase client
│   │
│   ├── types/                   # TypeScript definitions
│   │   ├── user.ts
│   │   └── communitySubscription.ts
│   │
│   └── utils/                   # Helper functions
│       ├── mailer.ts           # Email utilities
│       ├── getDataFromToken.ts # JWT helpers
│       ├── uploadToS3.ts       # S3 upload (single + multipart)
│       └── videoThumbnail.ts   # Client-side video thumbnail
│
├── lambda/                      # AWS Lambda function
│   └── mediaconvert-trigger.js # Triggers MediaConvert on S3 upload
│
├── infra/                       # AWS CDK infrastructure
│   └── lib/infra-stack.ts      # IAM roles, Lambda, S3 notifications
│
├── public/                      # Static assets
├── docs/                        # Documentation
│   ├── project-structure.md
│   └── google-oauth-setup.md
├── VIDEO_PIPELINE.md            # Video upload & HLS pipeline docs
├── .env.local                   # Environment variables
├── package.json                 # Dependencies
├── tailwind.config.js          # Tailwind configuration
└── server.js                    # Custom HTTPS server
```

---

## 🎬 Video Pipeline

Videos uploaded by artists go through a multi-stage pipeline for adaptive streaming. See [VIDEO_PIPELINE.md](./VIDEO_PIPELINE.md) for full details.

```
Browser → S3 (multipart upload) → S3 Event → Lambda → MediaConvert
→ HLS output (1080p / 720p / 480p) → S3 (transcoded/)
→ Frontend polls /api/video/status → hls.js plays .m3u8
```

- Files ≥ 10MB use S3 multipart upload (4 parallel chunks)
- MediaConvert produces 3 quality levels with 6-second HLS segments
- Frontend polls every 5s until transcoding is complete, then plays via `hls.js`

---

## 🔄 How It Works

### User Journey

#### 1. **Sign Up / Login**
```
User visits homepage → Signs up with email or Google OAuth
→ Email verification (if email signup)
→ Redirected to profile completion
```

#### 2. **Profile Setup**
```
Complete profile (name, bio, profile picture)
→ Select preferences (languages, genres, favorite artists)
→ Redirected to explore page
```

#### 3. **Discover & Engage**
```
Browse artists by genre/language
→ Read reviews and ratings
→ Join artist communities
→ Write reviews and comments
```

### Artist Journey

#### 1. **Artist Onboarding**
```
Artist signs up → Verification process
→ Create artist profile
→ Set up community (optional)
```

#### 2. **Community Management**
```
Create forums → Post updates
→ Engage with fans
→ Manage subscriptions
```

### Authentication Flow

```mermaid
User → Login Page → API (/api/auth/google or /api/users/login)
→ JWT Token Generated → Cookie Set
→ Check Profile Complete? → Check Preferences Set?
→ Redirect to Explore Page
```

### Database Relationships

```
Users ←→ UserPreferences
Users ←→ Reviews ←→ Artists
Users ←→ Comments ←→ Reviews
Artists ←→ Communities ←→ CommunitySubscriptions ←→ Users
Communities ←→ Forums ←→ ForumPosts ←→ Comments
```

---

## 📚 API Documentation

### Authentication Endpoints

#### Sign Up
```http
POST /api/users/signup
Content-Type: application/json

{
  "username": "musicfan123",
  "email": "user@example.com",
  "password_hash": "securepassword"
}
```

#### Login
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password_hash": "securepassword"
}
```

#### Google OAuth
```http
GET /api/auth/google
→ Redirects to Google OAuth
→ Callback: /api/auth/google/callback
```

### User Endpoints

#### Get User Profile
```http
GET /api/users/[userId]
```

#### Complete Profile
```http
POST /api/users/complete-profile
Content-Type: application/json

{
  "userId": "uuid",
  "full_name": "John Doe",
  "bio": "Music enthusiast",
  "city": "New York",
  "country": "USA"
}
```

### Preference Endpoints

#### Check Preferences
```http
GET /api/preferences/check?userId=uuid
```

#### Save Preferences
```http
POST /api/preferences/save
Content-Type: application/json

{
  "userId": "uuid",
  "genres": ["Rock", "Pop"],
  "languages": ["English", "Spanish"],
  "favoriteArtists": ["Artist1", "Artist2"]
}
```

### Community Endpoints

#### Get Community
```http
GET /api/community/[slug]
```

#### Subscribe to Community
```http
POST /api/community/subscribe
Content-Type: application/json

{
  "userId": "uuid",
  "communityId": "uuid"
}
```

### Review Endpoints

#### Submit Review
```http
POST /api/reviews/submit
Content-Type: application/json

{
  "userId": "uuid",
  "artistId": "uuid",
  "rating": 5,
  "content": "Amazing artist!"
}
```

---

## 🎨 Key Components Explained

### 1. **AuthContext** (`src/context/AuthContext.tsx`)
Manages user authentication state across the app.

```typescript
const { user, isLoading } = useAuth();
```

### 2. **Navbar** (`src/components/Navbar.tsx`)
Main navigation with theme toggle and user menu.

### 3. **ArtistCard** (`src/components/ArtistCard.tsx`)
Displays artist information in a card format.

### 4. **CommentsSection** (`src/components/CommentsSection.tsx`)
Handles comments, replies, and likes.

### 5. **HLSVideo** (`src/components/HLSVideo.tsx`)
Polls `/api/video/status` and plays transcoded HLS video via `hls.js` once ready.

### 6. **ImageCropModal** (`src/components/ImageCropModal.tsx`)
Provides in-browser image cropping before upload.

### 7. **Custom Hooks**
- `useRequireAuth()` - Protects routes requiring authentication
- `useCheckPreferences()` - Ensures users have set preferences
- `useCommunityPresence()` - Tracks active users in communities
- `useRedirectIfAuthenticated()` - Redirects logged-in users away from auth pages

---

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **HTTP-only Cookies** - Prevents XSS attacks
- **Password Hashing** - bcrypt for secure password storage
- **Email Verification** - Confirms user email addresses
- **Input Validation** - Prevents SQL injection and XSS
- **HTTPS Required** - Encrypted communication

---

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Check for linting errors
npm run lint

# Build for production
npm run build
```

---

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

---

## 📝 Common Issues & Solutions

### Issue: Database connection fails
**Solution**: Check your if `.env.local` has correct supabase credentials.

### Issue: SSL certificate errors
**Solution**: Run `mkcert -install` and `mkcert localhost` again.

### Issue: Google OAuth not working
**Solution**: Verify the Google Cloud Console settings and redirect URIs.

### Issue: Images not uploading
**Solution**: Check AWS S3 credentials and bucket permissions.

---

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Guide](https://www.postgresql.org/docs/)
- [Sequelize ORM](https://sequelize.org/docs/v6/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---
