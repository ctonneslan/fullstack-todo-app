# Full-Stack Todo Application

A modern, full-stack todo application with user authentication, built with React, Node.js, Express, and PostgreSQL.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-19.1.1-blue.svg)

## Features

- ✅ **User Authentication** - Secure JWT-based authentication with bcrypt password hashing
- ✅ **User-Specific Todos** - Each user has their own isolated todo list
- ✅ **Full CRUD Operations** - Create, read, update, delete, and toggle todos
- ✅ **Modern UI** - Clean, dark-themed interface with responsive design
- ✅ **Docker Support** - Fully containerized with Docker Compose
- ✅ **Comprehensive Testing** - 46 integration tests covering all features
- ✅ **RESTful API** - Well-structured backend with proper error handling

## Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS** - Custom styling with CSS variables

### Backend
- **Node.js 20** - JavaScript runtime
- **Express** - Web application framework
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **Jest** - Testing framework

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD pipeline

## Getting Started

### Prerequisites

- Node.js 20 or higher
- PostgreSQL 14 or higher
- npm or yarn
- Docker and Docker Compose (for containerized setup)

### Installation

#### Option 1: Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fullstack-todo-app
   ```

2. **Start PostgreSQL**
   ```bash
   brew services start postgresql@14
   ```

3. **Create the database**
   ```bash
   psql -U postgres -h localhost
   CREATE DATABASE todo_app;
   \q
   ```

4. **Initialize the database schema**
   ```bash
   psql -U postgres -h localhost -d todo_app -f backend/init.sql
   ```

5. **Grant permissions**
   ```bash
   psql -d todo_app -c "GRANT ALL PRIVILEGES ON TABLE users TO postgres;"
   psql -d todo_app -c "GRANT ALL PRIVILEGES ON TABLE todos TO postgres;"
   psql -d todo_app -c "GRANT ALL PRIVILEGES ON SEQUENCE users_id_seq TO postgres;"
   psql -d todo_app -c "GRANT ALL PRIVILEGES ON SEQUENCE todos_id_seq TO postgres;"
   ```

6. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

7. **Set up environment variables**
   ```bash
   # backend/.env is already configured with defaults
   # Modify if needed
   ```

8. **Start the backend**
   ```bash
   npm start
   # Server runs on http://localhost:3000
   ```

9. **Install frontend dependencies** (in a new terminal)
   ```bash
   cd frontend
   npm install
   ```

10. **Start the frontend**
    ```bash
    npm run dev
    # Frontend runs on http://localhost:5173
    ```

#### Option 2: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fullstack-todo-app
   ```

2. **Start all services**
   ```bash
   npm run docker:dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Database: localhost:5432

4. **Stop all services**
   ```bash
   npm run docker:dev:down
   ```

## Usage

### Creating an Account

1. Navigate to http://localhost:5173
2. Click "Sign up" on the login page
3. Fill in your name, email, and password
4. You'll be automatically logged in

### Managing Todos

- **Create**: Use the form at the top to add new todos
- **Complete**: Click the checkbox to mark as done
- **Edit**: Click the edit button to modify title/description
- **Delete**: Click the delete button to remove a todo

### Authentication

- Tokens are stored in localStorage
- Automatically included in all API requests
- Users can only see and manage their own todos
- Logout button in the top-right corner

## API Documentation

### Authentication Endpoints

```
POST /api/auth/register
Body: { email, password, name }
Returns: { user, token }

POST /api/auth/login
Body: { email, password }
Returns: { user, token }

GET /api/auth/me
Headers: Authorization: Bearer <token>
Returns: { user }
```

### Todo Endpoints (Protected)

```
GET /api/todos
Returns: Array of user's todos

POST /api/todos
Body: { title, description }
Returns: Created todo

GET /api/todos/:id
Returns: Single todo

PUT /api/todos/:id
Body: { title, description, completed }
Returns: Updated todo

PATCH /api/todos/:id/toggle
Returns: Todo with toggled completed status

DELETE /api/todos/:id
Returns: Success message
```

## Testing

### Run Backend Tests

```bash
cd backend
npm test
```

**Test Coverage:**
- 22 authentication tests
- 24 todo functionality tests
- User isolation and authorization tests
- All 46 tests passing ✅

### Create Test Database

```bash
psql -U postgres -h localhost -c "CREATE DATABASE todo_app_test;"
```

## Docker Commands

```bash
# Development
npm run docker:dev              # Start dev environment
npm run docker:dev:down         # Stop dev environment

# Production
npm run docker:prod             # Start production build
npm run docker:prod:down        # Stop production

# Cleanup
npm run docker:clean            # Remove all containers and volumes
```

## Project Structure

```
fullstack-todo-app/
├── backend/
│   ├── src/
│   │   ├── __tests__/          # Integration tests
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Auth middleware
│   │   ├── repositories/       # Database layer
│   │   ├── routes/             # API routes
│   │   └── services/           # Business logic
│   ├── init.sql                # Database schema
│   ├── server.js               # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── contexts/           # React contexts (Auth)
│   │   ├── pages/              # Page components
│   │   ├── services/           # API clients
│   │   └── styles/             # CSS files
│   └── package.json
├── docker-compose.yml          # Production Docker config
├── docker-compose.dev.yml      # Development Docker config
└── README.md
```

## Environment Variables

### Backend (.env)

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=todo_app
DB_PASSWORD=postgres
DB_PORT=5432
PORT=3000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### Frontend

```env
VITE_API_BASE_URL=/api
```

## Security Features

- ✅ Passwords hashed with bcrypt (10 salt rounds)
- ✅ JWT tokens with 7-day expiration
- ✅ Protected API routes with authentication middleware
- ✅ User data isolation (users can't access other users' todos)
- ✅ SQL injection prevention with parameterized queries
- ✅ Input validation on all endpoints

## Troubleshooting

### Database Issues

**Error: "permission denied for table users"**
```bash
psql -d todo_app -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;"
psql -d todo_app -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;"
```

**Error: "database todo_app does not exist"**
```bash
psql -U postgres -h localhost -c "CREATE DATABASE todo_app;"
```

### Docker Issues

**Port already in use**
```bash
# Stop local services
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
lsof -ti:5432 | xargs kill -9
```

**Rebuild containers**
```bash
docker-compose -f docker-compose.dev.yml build --no-cache
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with modern web technologies
- Inspired by clean, minimal design principles
- Focus on user experience and security
