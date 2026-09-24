# Cyber Forensics Analyzer

A comprehensive web-based cyber forensics analysis tool built with React, TypeScript, Node.js, and MongoDB. This application provides investigators with powerful tools for evidence analysis, case management, timeline analysis, and report generation.

## Features

- **User Authentication**: Secure login and registration system with JWT tokens
- **Evidence Upload & Analysis**: Upload and analyze digital evidence files
- **Case Management**: Create and manage forensic investigation cases
- **Timeline Analysis**: Visualize evidence timelines for investigations
- **Hash Analysis**: Calculate and verify file hashes (MD5, SHA-1, SHA-256)
- **Report Generation**: Generate comprehensive forensic reports
- **Dark Cyber Theme**: Modern UI with cyberpunk-inspired design

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **Axios** for API communication

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Multer** for file uploads

## Project Structure

```
cyber-forensics-analyzer/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── ui/                   # Reusable UI components
│   │   ├── Login.tsx            # Authentication component
│   │   ├── AnalyzerDashboard.tsx # Main dashboard
│   │   └── ...
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utility functions
│   ├── sections/                 # Page sections
│   └── types/                    # TypeScript type definitions
├── server/                       # Backend source code
│   ├── config/                   # Database configuration
│   ├── middleware/               # Express middleware
│   ├── models/                   # MongoDB models
│   ├── routes/                   # API routes
│   └── index.js                  # Server entry point
├── backend/                      # Additional backend files
├── uploads/                      # File upload directory
└── package.json                  # Dependencies and scripts
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```env
MONGO_URI=mongodb://localhost:27017/forensicsdb
JWT_SECRET=your-secret-key-here
```

4. Start the backend server:
```bash
node index.js
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Install frontend dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5174`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Evidence Management
- `POST /api/evidence/upload` - Upload evidence file
- `GET /api/evidence` - Get all evidence
- `GET /api/evidence/:id` - Get specific evidence
- `GET /api/evidence/verify/:id` - Verify evidence integrity
- `POST /api/evidence/tamper/:id` - Check for tampering

### Case Management
- `GET /api/cases` - Get all cases
- `POST /api/cases` - Create new case
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case

## Key Source Code Components

### Frontend - Login Component

```typescript
// src/components/Login.tsx
import { useState } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

interface LoginProps {
  onLogin: (token: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const res = await axios.post(endpoint, { username, password });
      if (mode === 'login') {
        onLogin(res.data.token);
      } else {
        setSuccess('Registration successful! Please login with your credentials.');
        setMode('login');
        setUsername('');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-green-400 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-black to-blue-900/30"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,0,0.1)_0%,_transparent_70%)]"></div>
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-6xl font-bold text-green-400 mb-8 text-center drop-shadow-[0_0_10px_rgba(0,255,0,0.8)] animate-pulse">
          Cyber Forensics Analyzer
        </h1>
        <Card className="w-full max-w-md bg-gray-900/90 border-green-500 text-green-400 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-center space-x-4">
              <Button
                variant={mode === 'login' ? 'default' : 'outline'}
                onClick={() => setMode('login')}
                className={mode === 'login' ? 'bg-green-600 hover:bg-green-700 text-black font-bold' : 'border-green-500 text-green-400 hover:bg-green-500 hover:text-black'}
              >
                Login
              </Button>
              <Button
                variant={mode === 'register' ? 'default' : 'outline'}
                onClick={() => setMode('register')}
                className={mode === 'register' ? 'bg-green-600 hover:bg-green-700 text-black font-bold' : 'border-green-500 text-green-400 hover:bg-green-500 hover:text-black'}
              >
                Register
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-gray-800 border-green-500 text-green-400 placeholder-green-600 focus:border-green-400 focus:ring-green-400"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-800 border-green-500 text-green-400 placeholder-green-600 focus:border-green-400 focus:ring-green-400"
                />
              </div>
              {error && (
                <Alert variant="destructive" className="border-red-500 bg-red-900/20">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="border-green-500 bg-green-900/20">
                  <AlertDescription className="text-green-400">{success}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-black font-bold">
                {mode === 'register' ? 'Register' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### Backend - User Model

```javascript
// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'investigator',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

### Backend - Authentication Routes

```javascript
// server/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !await user.comparePassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, username: user.username }, 'secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

## Usage

1. Start the backend server
2. Start the frontend development server
3. Open `http://localhost:5174` in your browser
4. Register a new account or login with existing credentials
5. Access the dashboard to manage cases and analyze evidence

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
