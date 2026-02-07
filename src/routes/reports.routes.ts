import { Router } from 'express';
import {
  getSalarySlip,
  getUniversityTotal,
  getFacultyReport,
  getDepartmentReport,
  getDesignationReport,
  getEmployeeTypeReport,
  getMonthlySummary
} from '../controllers/reports.controller';

const router = Router();

// GET /api/reports/salary-slip?employeeId=xxx&month=12&year=2025
router.get('/salary-slip', getSalarySlip);

// GET /api/reports/university-total?month=12&year=2025
router.get('/university-total', getUniversityTotal);

// GET /api/reports/faculty
router.get('/faculty', getFacultyReport);

// GET /api/reports/department
router.get('/department', getDepartmentReport);

// GET /api/reports/designation
router.get('/designation', getDesignationReport);

// GET /api/reports/employee-type
router.get('/employee-type', getEmployeeTypeReport);

// GET /api/reports/monthly-summary?year=2025
router.get('/monthly-summary', getMonthlySummary);

export default router;
