# NGO Donation Transparency Platform

A full-stack MERN application for transparent NGO donation management with role-based access control.

## Features

- **Authentication**: JWT-based authentication with role-based access (Admin, NGO, Donor)
- **Project Management**: NGOs can create and manage projects
- **Donation Tracking**: Complete transparency of all donations
- **Impact Scoring**: Automated calculation of project impact scores
- **Dashboards**: Role-specific dashboards with charts and analytics
- **Modern UI**: Responsive design with Tailwind CSS and Recharts

## Tech Stack

- **Frontend**: React, React Router, Tailwind CSS, Recharts, Axios
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT, bcryptjs

## Project Structure

```
ngo/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Authentication middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── .env             # Environment variables
│   ├── server.js        # Express server
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── context/     # React context
    │   ├── pages/       # Page components
    │   ├── utils/       # Utility functions
    │   ├── App.js
    │   └── index.js
    ├── tailwind.config.js
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ngo-platform
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Start the backend server:
```bash
npm run dev
```

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

Frontend will run on http://localhost:3000

## User Roles

### Admin
- Approve/reject NGO projects
- View all projects and donations
- Access platform-wide analytics

### NGO
- Create and manage projects
- View donations to their projects
- Update project information
- Track project impact scores

### Donor
- Browse and search projects
- Make donations to active projects
- Track donation history
- View project impact

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (NGO only)
- `PUT /api/projects/:id` - Update project (NGO only)
- `PATCH /api/projects/:id/approve` - Approve project (Admin only)
- `POST /api/projects/:id/impact` - Calculate impact score

### Donations
- `GET /api/donations` - Get donations
- `POST /api/donations` - Create donation (Donor only)
- `GET /api/donations/project/:projectId` - Get project donations

## Impact Score Calculation

Impact score is calculated based on:
- **Completion Rate (40%)**: Progress towards funding goal
- **Donor Count (30%)**: Number of unique donors
- **Beneficiary Impact (30%)**: Number of beneficiaries helped

Score ranges from 0-100.

## Default Test Users

Create these users via the registration page:

1. **Admin**
   - Role: admin
   - Can approve projects and view all data

2. **NGO**
   - Role: ngo
   - Can create and manage projects

3. **Donor**
   - Role: donor
   - Can donate to active projects

## Development

- Backend uses nodemon for hot reloading
- Frontend uses React Scripts with hot module replacement
- Tailwind CSS for styling with custom color scheme
- Recharts for data visualization

## Production Deployment

1. Update environment variables for production
2. Build frontend: `npm run build` in frontend directory
3. Serve frontend build from Express or use separate hosting
4. Use MongoDB Atlas for database
5. Enable HTTPS and secure JWT secret

## License

MIT
