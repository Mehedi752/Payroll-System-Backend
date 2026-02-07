import { Request, Response } from 'express';
import prisma from '../config/database';

// Type definitions
type EmployeeType = 'TEACHER' | 'OFFICER' | 'STAFF';

// Generate salary report by employee type
export const getSalaryReportByType = async (req: Request, res: Response) => {
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
    
    const payrolls = await prisma.payroll.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            employeeType: true,
            designation: true
          }
        }
      }
    });
    
    // Group by employee type
    const typeMap = new Map();
    
    payrolls.forEach((payroll: any) => {
      const type = payroll.employee.employeeType;
      if (!typeMap.has(type)) {
        typeMap.set(type, {
          employeeType: type,
          count: 0,
          totalBasicSalary: 0,
          totalAllowances: 0,
          totalDeductions: 0,
          totalGrossSalary: 0,
          totalNetSalary: 0
        });
      }
      
      const typeData = typeMap.get(type);
      typeData.count++;
      typeData.totalBasicSalary += payroll.basicSalary;
      typeData.totalAllowances += (
        payroll.houseRent + 
        payroll.medical + 
        payroll.transport + 
        payroll.education + 
        payroll.special
      );
      typeData.totalDeductions += (
        payroll.tax + 
        payroll.providentFund + 
        payroll.insurance + 
        payroll.loan + 
        payroll.other
      );
      typeData.totalGrossSalary += payroll.grossSalary;
      typeData.totalNetSalary += payroll.netSalary;
    });
    
    const report = Array.from(typeMap.values());
    
    return res.status(200).json({
      success: true,
      data: {
        period: { month: parseInt(month as string), year: parseInt(year as string) },
        report
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate salary report',
      error: error.message
    });
  }
};

// Generate department-wise report (for teachers)
export const getDepartmentReport = async (req: Request, res: Response) => {
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
      year: parseInt(year as string),
      employee: {
        employeeType: 'TEACHER' as EmployeeType
      }
    };
    
    const payrolls = await prisma.payroll.findMany({
      where,
      include: {
        employee: {
          include: {
            teacher: true
          }
        }
      }
    });
    
    // Group by department
    const deptMap = new Map();
    
    payrolls.forEach((payroll: any) => {
      if (!payroll.employee.teacher) return;
      
      const dept = payroll.employee.teacher.department;
      if (!deptMap.has(dept)) {
        deptMap.set(dept, {
          department: dept,
          count: 0,
          totalBasicSalary: 0,
          totalGrossSalary: 0,
          totalNetSalary: 0
        });
      }
      
      const deptData = deptMap.get(dept);
      deptData.count++;
      deptData.totalBasicSalary += payroll.basicSalary;
      deptData.totalGrossSalary += payroll.grossSalary;
      deptData.totalNetSalary += payroll.netSalary;
    });
    
    const report = Array.from(deptMap.values());
    
    return res.status(200).json({
      success: true,
      data: {
        period: { month: parseInt(month as string), year: parseInt(year as string) },
        report
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate department report',
      error: error.message
    });
  }
};

// Generate designation-wise report
export const getDesignationReport = async (req: Request, res: Response) => {
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
    
    const payrolls = await prisma.payroll.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            designation: true
          }
        }
      }
    });
    
    // Group by designation
    const desigMap = new Map();
    
    payrolls.forEach((payroll: any) => {
      const designation = payroll.employee.designation;
      if (!desigMap.has(designation)) {
        desigMap.set(designation, {
          designation,
          count: 0,
          totalBasicSalary: 0,
          totalGrossSalary: 0,
          totalNetSalary: 0,
          averageSalary: 0
        });
      }
      
      const desigData = desigMap.get(designation);
      desigData.count++;
      desigData.totalBasicSalary += payroll.basicSalary;
      desigData.totalGrossSalary += payroll.grossSalary;
      desigData.totalNetSalary += payroll.netSalary;
    });
    
    // Calculate averages
    const report = Array.from(desigMap.values()).map(item => ({
      ...item,
      averageSalary: item.totalNetSalary / item.count
    }));
    
    return res.status(200).json({
      success: true,
      data: {
        period: { month: parseInt(month as string), year: parseInt(year as string) },
        report
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate designation report',
      error: error.message
    });
  }
};

// Generate yearly comparison report
export const getYearlyComparison = async (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    
    if (!year) {
      return res.status(400).json({
        success: false,
        message: 'Year is required'
      });
    }
    
    const yearNum = parseInt(year as string);
    const monthlyData = [];
    
    for (let month = 1; month <= 12; month++) {
      const stats = await prisma.payroll.aggregate({
        where: {
          month,
          year: yearNum
        },
        _sum: {
          basicSalary: true,
          grossSalary: true,
          netSalary: true
        },
        _count: true
      });
      
      monthlyData.push({
        month,
        monthName: new Date(yearNum, month - 1, 1).toLocaleString('default', { month: 'long' }),
        employeeCount: stats._count,
        totalBasicSalary: stats._sum.basicSalary || 0,
        totalGrossSalary: stats._sum.grossSalary || 0,
        totalNetSalary: stats._sum.netSalary || 0
      });
    }
    
    // Calculate yearly totals
    const yearlyTotal = monthlyData.reduce((acc, month) => ({
      totalBasicSalary: acc.totalBasicSalary + month.totalBasicSalary,
      totalGrossSalary: acc.totalGrossSalary + month.totalGrossSalary,
      totalNetSalary: acc.totalNetSalary + month.totalNetSalary
    }), {
      totalBasicSalary: 0,
      totalGrossSalary: 0,
      totalNetSalary: 0
    });
    
    return res.status(200).json({
      success: true,
      data: {
        year: yearNum,
        monthlyData,
        yearlyTotal
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate yearly comparison',
      error: error.message
    });
  }
};

// Get employee-wise salary history
export const getEmployeeSalaryHistory = async (req: Request, res: Response) => {
  try {
    const employeeId = req.params.employeeId as string;
    const { limit = '12' } = req.query;
    
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        name: true,
        designation: true,
        employeeType: true
      }
    });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    const salaryHistory = await prisma.payroll.findMany({
      where: { employeeId },
      take: parseInt(limit as string),
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    });
    
    return res.status(200).json({
      success: true,
      data: {
        employee,
        salaryHistory
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch salary history',
      error: error.message
    });
  }
};

// Get individual salary slip for an employee
export const getSalarySlip = async (req: Request, res: Response) => {
  try {
    const { employeeId, month, year } = req.query;

    if (!employeeId || !month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, month, and year are required'
      });
    }

    const payroll = await prisma.payroll.findFirst({
      where: {
        employeeId: employeeId as string,
        month: parseInt(month as string),
        year: parseInt(year as string)
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            designation: true,
            employeeType: true
          }
        }
      }
    });

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Salary slip not found for the given period'
      });
    }

    return res.status(200).json({
      success: true,
      data: payroll
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch salary slip',
      error: error.message
    });
  }
};

// Get university-wide total salary summary
export const getUniversityTotal = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required'
      });
    }

    const payrolls = await prisma.payroll.findMany({
      where: {
        month: parseInt(month as string),
        year: parseInt(year as string)
      }
    });

    const totalEmployees = payrolls.length;
    const totalBasic = payrolls.reduce((sum, p) => sum + p.basicSalary, 0);
    const totalGross = payrolls.reduce((sum, p) => sum + p.grossSalary, 0);
    const totalNet = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
    
    const totalAllowances = payrolls.reduce((sum, p) => 
      sum + p.houseRent + p.medical + p.transport + p.education + p.special, 0
    );
    
    const totalDeductions = payrolls.reduce((sum, p) => 
      sum + p.tax + p.providentFund + p.insurance + p.loan + p.other, 0
    );

    return res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        totalBasic,
        totalGross,
        totalNet,
        totalAllowances,
        totalDeductions
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch university total',
      error: error.message
    });
  }
};

// Get faculty-wise salary report
export const getFacultyReport = async (_req: Request, res: Response) => {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        employee: {
          include: {
            payrolls: {
              orderBy: [
                { year: 'desc' },
                { month: 'desc' }
              ],
              take: 1
            }
          }
        }
      }
    });

    const facultyMap = new Map();

    teachers.forEach((teacher: any) => {
      const faculty = teacher.faculty;
      const latestPayroll = teacher.employee.payrolls[0];

      if (!facultyMap.has(faculty)) {
        facultyMap.set(faculty, {
          faculty,
          count: 0,
          totalSalary: 0
        });
      }

      const facultyData = facultyMap.get(faculty);
      facultyData.count++;
      if (latestPayroll) {
        facultyData.totalSalary += latestPayroll.netSalary;
      }
    });

    const report = Array.from(facultyMap.values());

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty report',
      error: error.message
    });
  }
};

// Get designation-wise salary report
export const getDesignationWiseReport = async (_req: Request, res: Response) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        payrolls: {
          orderBy: [
            { year: 'desc' },
            { month: 'desc' }
          ],
          take: 1
        }
      }
    });

    const designationMap = new Map();

    employees.forEach((employee: any) => {
      const designation = employee.designation;
      const latestPayroll = employee.payrolls[0];

      if (!designationMap.has(designation)) {
        designationMap.set(designation, {
          designation,
          count: 0,
          totalSalary: 0
        });
      }

      const designationData = designationMap.get(designation);
      designationData.count++;
      if (latestPayroll) {
        designationData.totalSalary += latestPayroll.netSalary;
      }
    });

    const report = Array.from(designationMap.values());

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch designation report',
      error: error.message
    });
  }
};
