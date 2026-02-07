import { Router } from 'express';
import {
  getDashboardStats,
  getRecentPayrolls,
  getSalaryTrends,
  getEmployeeDistribution,
  getDepartmentSummary
} from '../controllers/dashboard.controller';

const router = Router();

// Dashboard routes
router.get('/stats', getDashboardStats);
router.get('/recent-payrolls', getRecentPayrolls);
router.get('/salary-trends', getSalaryTrends);
router.get('/employee-distribution', getEmployeeDistribution);
router.get('/department-summary', getDepartmentSummary);

export default router;
