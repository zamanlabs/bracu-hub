# Discord-like Chat Application with Supabase

## Project Overview
This is a real-time chat application built with Next.js, TypeScript, and Supabase. The application features both global chat and direct messaging capabilities, similar to Discord.

## Development Phases

### Phase 1: Project Setup and Authentication (Foundation)
1. Initialize Next.js project with TypeScript
2. Set up Supabase project and database
3. Configure environment variables
4. Implement user authentication:
   - Sign up/Sign in pages
   - User profile creation
   - Authentication context and hooks
5. Basic layout and navigation structure

### Phase 2: Global Chat Implementation
1. Create global chat UI components
2. Set up Supabase real-time subscriptions
3. Implement message sending and receiving
4. Add message timestamps and user information
5. Implement basic message formatting
6. Add loading states and error handling

### Phase 3: Direct Messaging System
1. Create user list and search functionality
2. Implement direct message UI
3. Set up private message channels
4. Add real-time updates for DMs
5. Implement conversation history
6. Add online/offline status indicators

### Phase 4: UI/UX Enhancement
1. Set up asset structure:
   ```
   ├── public/
   │   ├── images/
   │   │   ├── backgrounds/
   │   │   ├── icons/
   │   │   └── avatars/
   ```
2. Implement responsive design
3. Add animations and transitions
4. Integrate icon libraries:
   - Install React Icons
   - Set up Heroicons
   - Custom SVG implementation
5. Add dark/light theme support
6. Implement loading skeletons
7. Add sound notifications

### Phase 5: Advanced Features
1. Message editing and deletion
2. File sharing capabilities
3. Message reactions
4. Message threading
5. User presence system
6. Typing indicators
7. Message search functionality

### Phase 6: Performance & Security
1. Implement Row Level Security (RLS)
2. Add rate limiting
3. Optimize image loading and caching
4. Add error boundaries
5. Implement retry mechanisms
6. Add logging and monitoring
7. Performance optimization

## Features
- Real-time global chat
- One-to-one direct messaging
- User authentication with Supabase
- Real-time message updates using Supabase subscriptions
- Modern UI with responsive design

## Tech Stack
- Next.js (React framework)
- TypeScript
- Supabase (Backend as a Service)
- Tailwind CSS (for styling)
- React Icons & Heroicons
- Next/Image for optimized images

## Project Setup

### 1. Dependencies
Install the required dependencies:
```bash
npm install @supabase/supabase-js @supabase/auth-ui-react @supabase/auth-ui-shared
npm install @types/node @types/react react react-dom
npm install react-icons
npm install @heroicons/react
npm install @tailwindcss/forms @tailwindcss/typography
```

### 2. Environment Variables
Create a `.env.local` file in the root directory with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
Execute the following SQL in your Supabase SQL editor:

```sql
-- Create tables for users
create table users (
  id uuid references auth.users primary key,
  username text unique not null,
  avatar_url text,
  status text default 'offline',
  last_seen timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create table for global chat messages
create table global_messages (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  user_id uuid references users(id) not null,
  edited boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create table for direct messages
create table direct_messages (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  sender_id uuid references users(id) not null,
  receiver_id uuid references users(id) not null,
  read boolean default false,
  edited boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create table for message reactions
create table message_reactions (
  id uuid default uuid_generate_v4() primary key,
  message_id uuid,
  user_id uuid references users(id) not null,
  reaction text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## Project Structure
```
├── components/
│   ├── auth/
│   │   ├── SignIn.tsx
│   │   └── SignUp.tsx
│   ├── chat/
│   │   ├── GlobalChat.tsx
│   │   ├── DirectMessage.tsx
│   │   ├── MessageInput.tsx
│   │   └── MessageList.tsx
│   ├── ui/
│   │   ├── Avatar.tsx
│   │   ├── Button.tsx
│   │   └── Icons.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       └── Header.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── types.ts
│   └── hooks/
│       ├── useAuth.ts
│       └── useChat.ts
├── pages/
│   ├── _app.tsx
│   ├── index.tsx
│   ├── auth/
│   │   ├── signin.tsx
│   │   └── signup.tsx
│   └── chat/
│       ├── global.tsx
│       └── [userId].tsx
├── public/
│   └── images/
│       ├── backgrounds/
│       ├── icons/
│       └── avatars/
└── styles/
    └── globals.css
```

## Features Implementation

### Global Chat
- Located in `components/ChatLayout.tsx`
- Real-time message updates using Supabase subscriptions
- Displays messages with usernames and timestamps

### Direct Messages
- Located in `components/DirectMessage.tsx`
- One-to-one chat functionality
- Real-time updates for private conversations

## Security Considerations
- All database operations are protected by Row Level Security (RLS)
- User authentication is required for accessing chat features
- Messages are associated with authenticated users

## Next Steps
1. Implement user authentication UI
2. Add user profile management
3. Implement message deletion and editing
4. Add file sharing capabilities
5. Implement user presence indicators
6. Add message reactions and threading

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
MIT License 