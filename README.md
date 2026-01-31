# Studium AI

An AI-powered intelligent note-taking and tutoring application designed for educational use.

## 🚀 Features

- ✅ **User Authentication** - Secure signup/signin with JWT tokens
- ✅ **Password Reset** - Email-based password recovery with 15-minute token expiration
- 🔄 **Notes Management** - Coming soon
- 🤖 **AI Integration** - Claude & Gemini APIs ready for integration

## 📋 Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.2.1
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcrypt
- **Email**: Nodemailer (Gmail integration)
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: React 18.2.0
- **Language**: TypeScript
- **Bundler**: Vite 5.1.0
- **Routing**: React Router DOM 6.22.0
- **HTTP Client**: Axios

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sanshai28/studium-ai.git
   cd studium-ai
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install

   # Configure environment variables
   cp .env.example .env
   # Edit .env with your database credentials and API keys

   # Run database migrations
   npx prisma migrate dev

   # Start development server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install

   # Start development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage
```

### Frontend
```bash
cd frontend

# Run linter
npm run lint

# Build for production
npm run build
```

## 🔄 CI/CD Pipeline

This project uses **GitHub Actions** for continuous integration and deployment.

### Automated Checks on Every PR:
- ✅ All unit tests must pass
- ✅ Test coverage must be ≥ 75%
- ✅ Frontend must build successfully
- ✅ Code quality checks (linting, no console.logs)

### Setting Up Branch Protection
See [CI/CD Setup Guide](.github/CICD_SETUP.md) for detailed instructions on:
- Configuring branch protection rules
- Understanding test requirements
- Troubleshooting pipeline issues

## 📁 Project Structure

```
studium-ai/
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth & validation
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── __tests__/      # Test suites
│   ├── prisma/             # Database schema & migrations
│   └── package.json
│
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React Context (Auth)
│   │   ├── pages/         # Page components
│   │   └── utils/         # Utilities
│   └── package.json
│
└── .github/
    └── workflows/          # CI/CD pipelines
```

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/tutor_db
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-gmail-app-password
FRONTEND_URL=http://localhost:3000
PORT=5001
NODE_ENV=development
```

See [.env.example](backend/.env.example) for all available options.

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Write tests** for new functionality
5. **Ensure tests pass**
   ```bash
   npm test
   npm run test:coverage  # Coverage must be ≥ 75%
   ```
6. **Commit your changes**
   ```bash
   git commit -m "Add: your feature description"
   ```
7. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Open a Pull Request**

**Note**: All PRs must pass CI/CD checks before merging. See [CI/CD Setup Guide](.github/CICD_SETUP.md) for requirements.

## 📝 API Documentation

### Authentication Endpoints

**Base URL**: `/api/v1/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Create new user account |
| POST | `/signin` | Authenticate user |
| POST | `/request-password-reset` | Request password reset email |
| POST | `/reset-password` | Reset password with token |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check server status |
| GET | `/api/version` | Get API version info |

For detailed API documentation, see [MOBILE_API.md](backend/MOBILE_API.md).

## 🎯 Roadmap

- [x] User authentication system
- [x] Password reset functionality
- [x] CI/CD pipeline
- [ ] Notes CRUD operations
- [ ] AI-powered note assistance (Claude)
- [ ] AI-powered tutoring (Gemini)
- [ ] Note tagging and organization
- [ ] Search functionality
- [ ] Export notes (PDF, Markdown)
- [ ] Mobile apps (iOS/Android via Capacitor)

## 📜 License

ISC

## 👥 Team

- **Sanchayan** - [@sanshai28](https://github.com/sanshai28)

## 🐛 Issues & Support

Found a bug or have a feature request? [Open an issue](https://github.com/sanshai28/studium-ai/issues)

---

**Built with ❤️ for students by students**
