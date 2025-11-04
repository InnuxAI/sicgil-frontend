# SICGIL Agent UI

A modern, production-ready chat interface for SICGIL's AI-powered data analysis platform. Built with Next.js, Tailwind CSS, and TypeScript, this application provides an intuitive interface for interacting with AI agents that analyze Excel files, vehicle performance data, and more.

<div align="center">
  <img src="https://www.sicgil.com/img/logo.png" alt="SICGIL Logo" width="120" />
</div>

## 🚀 Features

### Core Capabilities
- � **Multi-User Authentication**: Complete JWT-based auth with signup/login
- 💬 **Real-Time Chat Interface**: Streaming responses with beautiful UI
- 📊 **Excel Data Analysis**: Analyze vehicle performance, HRS data, and more
- 🧩 **Tool Calls Visualization**: See what tools the AI is using in real-time
- 📝 **Session History**: Persistent conversations with automatic context management
- � **Run Cancellation**: Stop long-running tasks instantly
- � **User Profiles**: Personal dashboard with avatar and user info
- 🎨 **Modern Design**: Built with Tailwind CSS and Framer Motion

### Technical Features
- 🔄 **Real-time Streaming**: SSE-based streaming for immediate feedback
- 🗄️ **MongoDB Integration**: Scalable data storage for users and sessions
- 🔒 **Protected Routes**: Middleware-based authentication
- 📱 **Responsive Design**: Works seamlessly on all devices
- 🎭 **Multi-modality Support**: Images, videos, audio, and more
- 🧠 **Context-Aware**: AI remembers your conversation history

## 📋 Prerequisites

Before running the Agent UI, ensure you have:

1. **Node.js** (v18 or higher) and npm installed
2. **MongoDB** running locally or remotely
3. **Python Backend** (`agent_server.py`) running
4. **MCP Servers** for Excel analysis (optional but recommended)

## 🛠️ Installation

### 1. Install Dependencies

```bash
cd agent-ui
npm install
```

### 2. Configure Environment Variables

Create or update `.env.local`:

```bash
# API Configuration - Backend URL
NEXT_PUBLIC_API_URL=http://localhost:7777

# Optional: Pre-configure auth secret (must match backend)
NEXT_PUBLIC_BETTER_AUTH_SECRET=your-secret-key-change-in-production
```

### 3. Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 🚦 Getting Started

### Complete Setup Process

#### 1. Start MongoDB (First Time)

```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Or manually
mongod --config /usr/local/etc/mongod.conf
```

#### 2. Start the Python Backend

```bash
cd /Users/aksshainair/Desktop/Innux/sicgil
python agent_server.py
```

✅ Backend running at: `http://localhost:7777`

#### 3. Start the Frontend

```bash
cd /Users/aksshainair/Desktop/Innux/sicgil/agent-ui
npm run dev
```

✅ Frontend running at: `http://localhost:3000`

### First Time User Flow

1. **Visit the App**: Navigate to `http://localhost:3000`
2. **Auto-Redirect**: You'll be redirected to `/login` (not authenticated)
3. **Sign Up**: Click "Sign up" and create your account
   - Name: Your full name
   - Email: your.email@example.com
   - Password: Minimum 8 characters
4. **Auto-Login**: After signup, you're automatically logged in
5. **Start Chatting**: Begin analyzing data with the AI agent!

### Using the Application

#### Chat with the AI Agent

The SICGIL AI agent specializes in:
- 📊 **Excel Data Analysis**: HRS performance, vehicle utilization reports
- 🚗 **Fleet Management**: Vehicle statistics and trends
- 📈 **Performance Metrics**: Idle hours, efficiency calculations
- 💡 **Insights Generation**: Automated reporting and recommendations

**Example Queries:**
```
"Analyze the vehicle with highest idle hours in May"
"Show me the fleet performance trends"
"Compare HRS data year over year"
"Extract metrics from the latest Excel file"
```

#### Session Management

- **Auto-Save**: All conversations are automatically saved
- **Chat History**: Access previous sessions from the sidebar
- **Context Memory**: Agent remembers last 5 interactions
- **Cancel Tasks**: Click the ✕ button to stop long-running operations

#### User Profile

- View your profile in the left sidebar
- See your name, email, and avatar
- Sign out anytime with the × button

## 🏗️ Project Structure

```
agent-ui/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   ├── page.tsx           # Main chat interface
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   ├── chat/              # Chat interface components
│   │   │   ├── ChatArea/      # Main chat area
│   │   │   ├── Sidebar/       # Session sidebar
│   │   │   └── MessageInput/  # Input components
│   │   └── ui/                # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAIStreamHandler.tsx
│   │   ├── useChatActions.ts
│   │   └── useSessionLoader.tsx
│   ├── lib/
│   │   ├── auth/              # Auth utilities & context
│   │   └── utils.ts           # Helper functions
│   ├── types/                 # TypeScript types
│   ├── middleware.ts          # Route protection
│   └── store.ts               # Zustand state management
├── public/                    # Static assets
├── .env.local                 # Environment variables
└── package.json              # Dependencies
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | `http://localhost:7777` |
| `NEXT_PUBLIC_BETTER_AUTH_SECRET` | JWT secret (optional) | Auto-generated |

### Backend Integration

The frontend communicates with the Python FastAPI backend at:
- **Base URL**: Configured via `NEXT_PUBLIC_API_URL`
- **Auth**: JWT tokens in cookies and Authorization headers
- **Streaming**: Server-Sent Events (SSE) for real-time responses

### API Endpoints Used

- `POST /auth/signup` - Create new user
- `POST /auth/signin` - User login
- `GET /auth/me` - Get current user
- `POST /auth/signout` - User logout
- `POST /v1/agent/run` - Run agent with streaming
- `GET /v1/agent/runs` - Get session history
- `DELETE /v1/agent/runs/{run_id}` - Delete a run

## 🧪 Testing

### Build for Production

```bash
npm run build
```

### Run Tests

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Format checking
npm run format

# Run all validations
npm run validate
```

### Test Features

1. **Authentication Flow**
   - Create account → Auto-login → Access chat
   - Logout → Redirect to login → Login again

2. **Chat Functionality**
   - Send message → See streaming response
   - Upload file → Agent analyzes it
   - Long task → Cancel mid-execution

3. **Session Persistence**
   - Start conversation → Reload page → History preserved
   - Switch sessions → Context switches correctly

## 🐛 Troubleshooting

### Common Issues

**Problem**: "Failed to fetch" or connection errors
- ✅ **Solution**: Ensure backend is running at `http://localhost:7777`
- Check: `curl http://localhost:7777/health`

**Problem**: Login/Signup not working
- ✅ **Solution**: Verify MongoDB is running
- Check: `brew services list | grep mongodb`

**Problem**: Chat history not persisting
- ✅ **Solution**: Check MongoDB connection in backend logs
- Verify: Database `agentdb` and collection `agent_sessions` exist

**Problem**: Session shows "undefined" or blank
- ✅ **Solution**: Clear cookies and localStorage, then login again
- Run in console: `localStorage.clear(); document.cookie.split(";").forEach(c => document.cookie = c.trim().split("=")[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/');`

**Problem**: Agent not responding
- ✅ **Solution**: Check if MCP servers are running
- Backend should show: "MCP Tools initialized"

## 📚 Documentation

For more detailed information:
- **Backend Setup**: See `../IMPLEMENTATION_COMPLETE.md`
- **Quick Start**: See `../QUICK_START_GUIDE.md`
- **Authentication**: See `../MULTI_USER_AUTH_PLAN_MONGODB.md`

## 🛠️ Built With

- **Framework**: [Next.js 15](https://nextjs.org/) - React framework
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type safety
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) - Reusable components
- **Animation**: [Framer Motion](https://www.framer.com/motion/) - Smooth animations
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) - Lightweight state
- **Auth**: [Better Auth](https://www.better-auth.com/) - Authentication utilities
- **Icons**: [Lucide React](https://lucide.dev/) - Beautiful icons

## 📄 License

This project is part of the SICGIL platform and is proprietary software.

## 🤝 Support

For issues or questions:
- Check the troubleshooting section above
- Review the documentation in the project root
- Contact the development team

---

Built with ❤️ for SICGIL
