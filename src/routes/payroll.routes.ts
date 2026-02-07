import { Router } from 'express';
import {
  getAllPayrolls,
  getPayrollById,
  processPayroll,
  markPayrollAsPaid,
  bulkMarkAsPaid,
  deletePayroll,
  getPayrollSummary
} from '../controllers/payroll.controller';

const router = Router();

// Payroll routes
router.get('/', getAllPayrolls);
router.get('/summary', getPayrollSummary);
router.get('/:id', getPayrollById);
router.post('/process', processPayroll);
router.put('/:id/pay', markPayrollAsPaid);
router.put('/bulk-pay', bulkMarkAsPaid);
router.delete('/:id', deletePayroll);

export default router;
