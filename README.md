# Payroll Management System - Backend

A comprehensive payroll management system backend built with **PostgreSQL**, **Prisma**, **Express**, and **TypeScript**.

## 🚀 Features

- **Employee Management**: CRUD operations for Teachers, Officers, and Staff
- **Payroll Processing**: Automated payroll calculation and management
- **Reports**: Generate various salary reports (by type, department, designation, yearly comparison)
- **Dashboard**: Real-time statistics and analytics
- **RESTful API**: Well-structured API endpoints with proper error handling

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup PostgreSQL Database:**
   - Create a new PostgreSQL database named `payroll_db`
   - Update the `.env` file with your database credentials

3. **Configure Environment Variables:**
   - Copy `.env.example` to `.env`
   - Update the following variables:
     ```env
     DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/payroll_db?schema=public"
     PORT=5000
     CORS_ORIGIN=http://localhost:5173
     ```

4. **Generate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

5. **Run Database Migrations:**
   ```bash
   npm run prisma:migrate
   ```

6. **Seed the Database (Optional):**
   ```bash
   npm run prisma:seed
   ```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Open Prisma Studio (Database GUI)
```bash
npm run prisma:studio
```

## 📡 API Endpoints

### Employees
- `GET /api/employees` - Get all employees (with pagination & filters)
- `GET /api/employees/:id` - Get employee by ID
- `GET /api/employees/stats` - Get employee statistics
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Payroll
- `GET /api/payroll` - Get all payroll records
- `GET /api/payroll/:id` - Get payroll by ID
- `GET /api/payroll/summary` - Get payroll summary for a period
- `POST /api/payroll/process` - Process payroll for employees
- `PUT /api/payroll/:id/pay` - Mark payroll as paid
- `PUT /api/payroll/bulk-pay` - Bulk mark payrolls as paid
- `DELETE /api/payroll/:id` - Delete payroll record

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-payrolls` - Get recent payroll records
- `GET /api/dashboard/salary-trends` - Get salary trends (last 6 months)
- `GET /api/dashboard/employee-distribution` - Get employee distribution by type
- `GET /api/dashboard/department-summary` - Get department-wise summary

### Reports
- `GET /api/reports/salary-by-type` - Salary report by employee type
- `GET /api/reports/department` - Department-wise report
- `GET /api/reports/designation` - Designation-wise report
- `GET /api/reports/yearly-comparison` - Yearly comparison report
- `GET /api/reports/employee/:employeeId/history` - Employee salary history

### Settings
- `GET /api/settings` - Get all settings
- `GET /api/settings/:key` - Get setting by key
- `PUT /api/settings/:key` - Update or create setting

## 📊 Database Schema

The system uses PostgreSQL with Prisma ORM. Main tables:
- **Employee**: Base employee information
- **Teacher**: Teacher-specific data (faculty, department, research area)
- **Officer**: Officer-specific data (office, responsibilities)
- **Staff**: Staff-specific data (section, shift)
- **Payroll**: Payroll records with salary breakdown
- **Settings**: System configuration

## 🔧 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Security**: Helmet, CORS
- **Logging**: Morgan
- **Compression**: Compression middleware

## 📝 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:seed` - Seed database with sample data

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 5000 |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:5173 |

## 🎯 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

## 🧪 Testing

The API can be tested using:
- Postman
- Thunder Client (VS Code extension)
- cURL
- Frontend application

## 📄 License

ISC

## 👥 Support

For support, please contact the development team or open an issue in the repository.
