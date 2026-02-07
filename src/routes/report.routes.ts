import { Router } from 'express';
import {
  getSalaryReportByType,
  getDepartmentReport,
  getDesignationReport,
  getYearlyComparison,
  getEmployeeSalaryHistory,
  getSalarySlip,
  getUniversityTotal,
  getFacultyReport,
  getDesignationWiseReport
} from '../controllers/report.controller';

const router = Router();

// Report routes
router.get('/salary-by-type', getSalaryReportByType);
router.get('/department', getDepartmentReport);
router.get('/designation', getDesignationReport);
router.get('/yearly-comparison', getYearlyComparison);
router.get('/employee/:employeeId/history', getEmployeeSalaryHistory);

// New routes for Reports page
router.get('/salary-slip', getSalarySlip);
router.get('/university-total', getUniversityTotal);
router.get('/faculty', getFacultyReport);
router.get('/designation-wise', getDesignationWiseReport);

export default router;
