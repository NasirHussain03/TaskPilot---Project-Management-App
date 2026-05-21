# TaskPilot — Project Management App

A full-stack project management application built with React, Node.js, Express, and MongoDB. TaskPilot helps teams organize projects, track tasks, collaborate in real-time, and stay on top of deadlines.

---

## Features

- **Authentication** — Secure register/login with JWT and bcrypt password hashing
- **Projects** — Create, update, and delete projects with member management
- **Tasks** — Full task lifecycle (Todo → In Progress → Completed) with priority levels, due dates, comments, and file attachments
- **Real-time Chat** — Team messaging powered by Socket.io
- **Team Management** — View and manage team members with role-based access (Admin / Member)
- **Activity Log** — Automatic tracking of project and task activity
- **Notifications** — In-app notification system
- **Calendar View** — Visual overview of upcoming task deadlines
- **Profile Management** — Update name, bio, phone, and address
- **File Uploads** — Attach files to tasks via Multer
- **Dashboard** — Overview of projects, tasks, and recent activity with charts (Recharts)

---

## Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React 19 | UI framework |
| React Router v7 | Client-side routing |
| Tailwind CSS | Styling |
| Axios | HTTP requests |
| Socket.io-client | Real-time communication |
| Recharts | Dashboard charts |
| React Icons | Icon library |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| Socket.io | Real-time WebSocket server |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |
| Multer | File upload handling |
| express-validator | Request validation |

---

## Project Structure

```
TaskPilot/
├── client/                  # React frontend
│   ├── public/
│   └── src/
│       ├── components/      # Reusable components (ProtectedRoute, etc.)
│       ├── context/         # AuthContext (global auth state)
│       ├── layouts/         # App layout wrapper
│       ├── pages/           # Dashboard, Projects, Tasks, Team, Chat, Calendar, Profile
│       ├── services/        # Axios API instance & Socket.io client
│       └── App.jsx
│
└── server/                  # Node.js backend
    └── src/
        ├── config/          # Database connection
        ├── controllers/     # Route handler logic
        ├── middleware/       # Auth & role middleware
        ├── models/          # Mongoose schemas (User, Project, Task, Chat, etc.)
        ├── routes/          # Express route definitions
        ├── utils/           # Socket.io helper, token generator, mailer, activity logger
        ├── validators/      # express-validator rules
        └── server.js        # App entry point
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/NasirHussain03/TaskPilot---Project-Management-App.git
cd TaskPilot---Project-Management-App
```

### 2. Setup the server
```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

Start the server:
```bash
npm run dev
```

### 3. Setup the client
```bash
cd client
npm install
npm start
```

The app will be available at **http://localhost:3000**  
The API runs at **http://localhost:5000**

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user info |
| GET | `/api/projects` | Get all projects |
| POST | `/api/projects` | Create a project |
| PUT | `/api/projects/:id` | Update a project |
| DELETE | `/api/projects/:id` | Delete a project |
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| POST | `/api/tasks/:id/comments` | Add a comment to a task |
| POST | `/api/tasks/:id/attachments` | Add an attachment to a task |
| GET | `/api/users` | Get all users |
| GET | `/api/chat` | Get chat messages |
| GET | `/api/notifications` | Get notifications |
| GET | `/api/activities` | Get activity log |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `NODE_ENV` | Environment (`development` / `production`) |

---

## License

This project is open source and available under the [MIT License](LICENSE).
