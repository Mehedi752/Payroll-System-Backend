import { Request, Response } from 'express';
import prisma from '../config/database';

type EmployeeStatus = 'ACTIVE' | 'INACTIVE';
type PayrollStatus = 'PAID' | 'PENDING';

// Get dashboard statistics
export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    // Get employee stats
    const [totalEmployees, activeEmployees, teacherCount, officerCount, staffCount] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { status: 'ACTIVE' as EmployeeStatus } }),
      prisma.employee.count({ where: { employeeType: 'TEACHER' } }),
      prisma.employee.count({ where: { employeeType: 'OFFICER' } }),
      prisma.employee.count({ where: { employeeType: 'STAFF' } })
    ]);
    
    // Get current month payroll stats
    const currentMonthPayrolls = await prisma.payroll.count({
      where: {
        month: currentMonth,
        year: currentYear
      }
    });
    
    const paidPayrolls = await prisma.payroll.count({
      where: {
        month: currentMonth,
        year: currentYear,
        status: 'PAID' as PayrollStatus
      }
    });
    
    const pendingPayrolls = await prisma.payroll.count({
      where: {
        month: currentMonth,
        year: currentYear,
        status: 'PENDING' as PayrollStatus
      }
    });
    
    // Get total salary disbursement
    const salaryStats = await prisma.payroll.aggregate({
      where: {
        month: currentMonth,
        year: currentYear
      },
      _sum: {
        grossSalary: true,
        netSalary: true
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        employees: {
          total: totalEmployees,
          active: activeEmployees,
          inactive: totalEmployees - activeEmployees,
          byType: {
            teachers: teacherCount,
            officers: officerCount,
            staff: staffCount
          }
        },
        payroll: {
          currentMonth: {
            month: currentMonth,
            year: currentYear,
            total: currentMonthPayrolls,
            paid: paidPayrolls,
            pending: pendingPayrolls,
            totalGrossSalary: salaryStats._sum.grossSalary || 0,
            totalNetSalary: salaryStats._sum.netSalary || 0
          }
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

// Get recent payrolls
export const getRecentPayrolls = async (req: Request, res: Response) => {
  try {
    const { limit = '5' } = req.query;
    
    const payrolls = await prisma.payroll.findMany({
      take: parseInt(limit as string),
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            designation: true,
            employeeType: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.status(200).json({
      success: true,
      data: payrolls
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent payrolls',
      error: error.message
    });
  }
};

// Get salary trends (last 6 months)
export const getSalaryTrends = async (_req: Request, res: Response) => {
  try {
    const currentDate = new Date();
    const trends = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      const stats = await prisma.payroll.aggregate({
        where: { month, year },
        _sum: {
          grossSalary: true,
          netSalary: true
        },
        _count: true
      });
      
      trends.push({
        month,
        year,
        monthName: date.toLocaleString('default', { month: 'short' }),
        totalGross: stats._sum.grossSalary || 0,
        totalNet: stats._sum.netSalary || 0,
        count: stats._count
      });
    }
    
    res.status(200).json({
      success: true,
      data: trends
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch salary trends',
      error: error.message
    });
  }
};

// Get employee distribution by type
export const getEmployeeDistribution = async (_req: Request, res: Response) => {
  try {
    const [teachers, officers, staff] = await Promise.all([
      prisma.employee.count({ where: { employeeType: 'TEACHER', status: 'ACTIVE' as EmployeeStatus } }),
      prisma.employee.count({ where: { employeeType: 'OFFICER', status: 'ACTIVE' as EmployeeStatus } }),
      prisma.employee.count({ where: { employeeType: 'STAFF', status: 'ACTIVE' as EmployeeStatus } })
    ]);
    
    res.status(200).json({
      success: true,
      data: [
        { type: 'Teachers', count: teachers },
        { type: 'Officers', count: officers },
        { type: 'Staff', count: staff }
      ]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee distribution',
      error: error.message
    });
  }
};

// Get department-wise summary (for teachers)
export const getDepartmentSummary = async (_req: Request, res: Response) => {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        employee: true
      }
    });
    
    const departmentMap = new Map();
    
    teachers.forEach((teacher: { department: string; employee: { basicSalary: number } }) => {
      const dept = teacher.department;
      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, {
          department: dept,
          count: 0,
          totalSalary: 0
        });
      }
      
      const deptData = departmentMap.get(dept);
      deptData.count++;
      deptData.totalSalary += teacher.employee.basicSalary;
    });
    
    const summary = Array.from(departmentMap.values());
    
    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department summary',
      error: error.message
    });
  }
};
