import { Request, Response } from 'express';
import prisma from '../config/database';

type PayrollStatus = 'PAID' | 'PENDING';

// Get all payroll records
export const getAllPayrolls = async (req: Request, res: Response) => {
  try {
    const { 
      month, 
      year, 
      status, 
      employeeId, 
      page = '1', 
      limit = '10' 
    } = req.query;
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);
    
    const where: any = {};
    
    if (month) {
      where.month = parseInt(month as string);
    }
    
    if (year) {
      where.year = parseInt(year as string);
    }
    
    if (status) {
      where.status = status as PayrollStatus;
    }
    
    if (employeeId) {
      where.employeeId = employeeId as string;
    }
    
    const [payrolls, total] = await Promise.all([
      prisma.payroll.findMany({
        where,
        skip,
        take,
        include: {
          employee: {
            include: {
              teacher: true,
              officer: true,
              staff: true
            }
          }
        },
        orderBy: [
          { year: 'desc' },
          { month: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.payroll.count({ where })
    ]);
    
    res.status(200).json({
      success: true,
      data: payrolls,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payroll records',
      error: error.message
    });
  }
};

// Get payroll by ID
export const getPayrollById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    const payroll = await prisma.payroll.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            teacher: true,
            officer: true,
            staff: true
          }
        }
      }
    });
    
    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: payroll
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payroll record',
      error: error.message
    });
  }
};

// Process payroll for a specific month/year
export const processPayroll = async (req: Request, res: Response) => {
  try {
    const { month, year, employeeIds } = req.body;
    
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required'
      });
    }
    
    // Get employees to process
    const where: any = { status: 'ACTIVE' };
    if (employeeIds && employeeIds.length > 0) {
      where.id = { in: employeeIds };
    }
    
    const employees = await prisma.employee.findMany({ where });
    
    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active employees found'
      });
    }
    
    const payrollRecords = [];
    const errors = [];
    
    for (const employee of employees) {
      try {
        // Check if payroll already exists
        const existing = await prisma.payroll.findUnique({
          where: {
            employeeId_month_year: {
              employeeId: employee.id,
              month: parseInt(month),
              year: parseInt(year)
            }
          }
        });
        
        if (existing) {
          errors.push({
            employeeId: employee.id,
            employeeName: employee.name,
            message: 'Payroll already processed for this period'
          });
          continue;
        }
        
        // Calculate salaries
        const totalAllowances = 
          employee.houseRent + 
          employee.medical + 
          employee.transport + 
          employee.education + 
          employee.special;
        
        const totalDeductions = 
          employee.tax + 
          employee.providentFund + 
          employee.insurance + 
          employee.loan + 
          employee.other;
        
        const grossSalary = employee.basicSalary + totalAllowances;
        const netSalary = grossSalary - totalDeductions;
        
        // Create payroll record
        const payroll = await prisma.payroll.create({
          data: {
            employeeId: employee.id,
            month: parseInt(month),
            year: parseInt(year),
            basicSalary: employee.basicSalary,
            houseRent: employee.houseRent,
            medical: employee.medical,
            transport: employee.transport,
            education: employee.education,
            special: employee.special,
            tax: employee.tax,
            providentFund: employee.providentFund,
            insurance: employee.insurance,
            loan: employee.loan,
            other: employee.other,
            grossSalary,
            netSalary,
            status: 'PENDING' as PayrollStatus
          },
          include: {
            employee: true
          }
        });
        
        payrollRecords.push(payroll);
      } catch (err: any) {
        errors.push({
          employeeId: employee.id,
          employeeName: employee.name,
          message: err.message
        });
      }
    }
    
    return res.status(201).json({
      success: true,
      message: `Payroll processed for ${payrollRecords.length} employees`,
      data: {
        processed: payrollRecords,
        errors
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to process payroll',
      error: error.message
    });
  }
};

// Mark payroll as paid
export const markPayrollAsPaid = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    const payroll = await prisma.payroll.findUnique({
      where: { id }
    });
    
    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }
    
    if (payroll.status === 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Payroll already marked as paid'
      });
    }
    
    const updatedPayroll = await prisma.payroll.update({
      where: { id },
      data: {
        status: 'PAID' as PayrollStatus,
        paidAt: new Date()
      },
      include: {
        employee: true
      }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Payroll marked as paid',
      data: updatedPayroll
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to mark payroll as paid',
      error: error.message
    });
  }
};

// Bulk mark payrolls as paid
export const bulkMarkAsPaid = async (req: Request, res: Response) => {
  try {
    const { payrollIds } = req.body;
    
    if (!payrollIds || payrollIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Payroll IDs are required'
      });
    }
    
    const result = await prisma.payroll.updateMany({
      where: {
        id: { in: payrollIds },
        status: 'PENDING' as PayrollStatus
      },
      data: {
        status: 'PAID' as PayrollStatus,
        paidAt: new Date()
      }
    });
    
    return res.status(200).json({
      success: true,
      message: `${result.count} payroll records marked as paid`,
      data: { updatedCount: result.count }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to mark payrolls as paid',
      error: error.message
    });
  }
};

// Delete payroll record
export const deletePayroll = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    const payroll = await prisma.payroll.findUnique({
      where: { id }
    });
    
    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }
    
    await prisma.payroll.delete({
      where: { id }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Payroll record deleted successfully'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete payroll record',
      error: error.message
    });
  }
};

// Get payroll summary for a period
export const getPayrollSummary = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required'
      });
    }
    
    const where = {
      month: parseInt(month as string),
      year: parseInt(year as string)
    };
    
    const [total, paid, pending, summary] = await Promise.all([
      prisma.payroll.count({ where }),
      prisma.payroll.count({ where: { ...where, status: 'PAID' as PayrollStatus } }),
      prisma.payroll.count({ where: { ...where, status: 'PENDING' as PayrollStatus } }),
      prisma.payroll.aggregate({
        where,
        _sum: {
          basicSalary: true,
          houseRent: true,
          medical: true,
          transport: true,
          education: true,
          special: true,
          tax: true,
          providentFund: true,
          insurance: true,
          loan: true,
          other: true,
          grossSalary: true,
          netSalary: true
        }
      })
    ]);
    
    return res.status(200).json({
      success: true,
      data: {
        period: { month: parseInt(month as string), year: parseInt(year as string) },
        counts: {
          total,
          paid,
          pending
        },
        totals: {
          basicSalary: summary._sum.basicSalary || 0,
          totalAllowances: (
            (summary._sum.houseRent || 0) +
            (summary._sum.medical || 0) +
            (summary._sum.transport || 0) +
            (summary._sum.education || 0) +
            (summary._sum.special || 0)
          ),
          totalDeductions: (
            (summary._sum.tax || 0) +
            (summary._sum.providentFund || 0) +
            (summary._sum.insurance || 0) +
            (summary._sum.loan || 0) +
            (summary._sum.other || 0)
          ),
          grossSalary: summary._sum.grossSalary || 0,
          netSalary: summary._sum.netSalary || 0
        }
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payroll summary',
      error: error.message
    });
  }
};
