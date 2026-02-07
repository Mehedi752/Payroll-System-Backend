import { Request, Response } from 'express';
import prisma from '../config/database';

// Get salary slip for a specific employee, month, and year
export const getSalarySlip = async (req: Request, res: Response) => {
  try {
    const { employeeId, month, year } = req.query;

    if (!employeeId || !month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, month, and year are required'
      });
    }

    // Find the payroll record
    const payroll = await prisma.payroll.findFirst({
      where: {
        employeeId: employeeId as string,
        month: parseInt(month as string),
        year: parseInt(year as string)
      },
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
        message: 'No salary record found for the specified criteria'
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

// Get university-wide total for a specific month and year
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

    const stats = {
      totalEmployees: payrolls.length,
      totalBasic: payrolls.reduce((sum, p) => sum + p.basicSalary, 0),
      totalGross: payrolls.reduce((sum, p) => sum + p.grossSalary, 0),
      totalNet: payrolls.reduce((sum, p) => sum + p.netSalary, 0),
      totalAllowances: payrolls.reduce((sum, p) => 
        sum + p.houseRent + p.medical + p.transport + p.education + p.special, 0
      ),
      totalDeductions: payrolls.reduce((sum, p) => 
        sum + p.tax + p.providentFund + p.insurance + p.loan + p.other, 0
      ),
      month: parseInt(month as string),
      year: parseInt(year as string)
    };

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch university total',
      error: error.message
    });
  }
};

// Get faculty-wise report
export const getFacultyReport = async (_req: Request, res: Response) => {
  try {
    // Get all teachers with their employee data
    const teachers = await prisma.teacher.findMany({
      include: {
        employee: true
      }
    });

    // Group by faculty
    const facultyMap = new Map<string, { count: number; totalSalary: number }>();

    teachers.forEach(teacher => {
      const faculty = teacher.faculty;
      const employee = teacher.employee;
      
      const netSalary = 
        employee.basicSalary +
        employee.houseRent +
        employee.medical +
        employee.transport +
        employee.education +
        employee.special -
        employee.tax -
        employee.providentFund -
        employee.insurance -
        employee.loan -
        employee.other;

      if (facultyMap.has(faculty)) {
        const current = facultyMap.get(faculty)!;
        facultyMap.set(faculty, {
          count: current.count + 1,
          totalSalary: current.totalSalary + netSalary
        });
      } else {
        facultyMap.set(faculty, {
          count: 1,
          totalSalary: netSalary
        });
      }
    });

    // Convert to array
    const report = Array.from(facultyMap.entries()).map(([faculty, data]) => ({
      faculty,
      count: data.count,
      totalSalary: data.totalSalary
    }));

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

// Get department-wise report
export const getDepartmentReport = async (_req: Request, res: Response) => {
  try {
    // Get all teachers with their employee data
    const teachers = await prisma.teacher.findMany({
      include: {
        employee: true
      }
    });

    // Group by department
    const deptMap = new Map<string, { count: number; totalSalary: number }>();

    teachers.forEach(teacher => {
      const department = teacher.department;
      const employee = teacher.employee;
      
      const netSalary = 
        employee.basicSalary +
        employee.houseRent +
        employee.medical +
        employee.transport +
        employee.education +
        employee.special -
        employee.tax -
        employee.providentFund -
        employee.insurance -
        employee.loan -
        employee.other;

      if (deptMap.has(department)) {
        const current = deptMap.get(department)!;
        deptMap.set(department, {
          count: current.count + 1,
          totalSalary: current.totalSalary + netSalary
        });
      } else {
        deptMap.set(department, {
          count: 1,
          totalSalary: netSalary
        });
      }
    });

    // Convert to array
    const report = Array.from(deptMap.entries()).map(([department, data]) => ({
      department,
      count: data.count,
      totalSalary: data.totalSalary
    }));

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch department report',
      error: error.message
    });
  }
};

// Get designation-wise report
export const getDesignationReport = async (_req: Request, res: Response) => {
  try {
    // Get all employees
    const employees = await prisma.employee.findMany();

    // Group by designation
    const desigMap = new Map<string, { count: number; totalSalary: number }>();

    employees.forEach(employee => {
      const designation = employee.designation;
      
      const netSalary = 
        employee.basicSalary +
        employee.houseRent +
        employee.medical +
        employee.transport +
        employee.education +
        employee.special -
        employee.tax -
        employee.providentFund -
        employee.insurance -
        employee.loan -
        employee.other;

      if (desigMap.has(designation)) {
        const current = desigMap.get(designation)!;
        desigMap.set(designation, {
          count: current.count + 1,
          totalSalary: current.totalSalary + netSalary
        });
      } else {
        desigMap.set(designation, {
          count: 1,
          totalSalary: netSalary
        });
      }
    });

    // Convert to array
    const report = Array.from(desigMap.entries()).map(([designation, data]) => ({
      designation,
      count: data.count,
      totalSalary: data.totalSalary
    }));

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

// Get employee type-wise report
export const getEmployeeTypeReport = async (_req: Request, res: Response) => {
  try {
    const employees = await prisma.employee.findMany();

    // Group by employee type
    const typeMap = new Map<string, { count: number; totalSalary: number }>();

    employees.forEach(employee => {
      const type = employee.employeeType;
      
      const netSalary = 
        employee.basicSalary +
        employee.houseRent +
        employee.medical +
        employee.transport +
        employee.education +
        employee.special -
        employee.tax -
        employee.providentFund -
        employee.insurance -
        employee.loan -
        employee.other;

      if (typeMap.has(type)) {
        const current = typeMap.get(type)!;
        typeMap.set(type, {
          count: current.count + 1,
          totalSalary: current.totalSalary + netSalary
        });
      } else {
        typeMap.set(type, {
          count: 1,
          totalSalary: netSalary
        });
      }
    });

    // Convert to array
    const report = Array.from(typeMap.entries()).map(([employeeType, data]) => ({
      employeeType,
      count: data.count,
      totalSalary: data.totalSalary
    }));

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch employee type report',
      error: error.message
    });
  }
};

// Get monthly summary report
export const getMonthlySummary = async (req: Request, res: Response) => {
  try {
    const { year } = req.query;

    if (!year) {
      return res.status(400).json({
        success: false,
        message: 'Year is required'
      });
    }

    const monthlyData = [];

    for (let month = 1; month <= 12; month++) {
      const payrolls = await prisma.payroll.findMany({
        where: {
          month: month,
          year: parseInt(year as string)
        }
      });

      monthlyData.push({
        month,
        totalEmployees: payrolls.length,
        totalBasic: payrolls.reduce((sum, p) => sum + p.basicSalary, 0),
        totalGross: payrolls.reduce((sum, p) => sum + p.grossSalary, 0),
        totalNet: payrolls.reduce((sum, p) => sum + p.netSalary, 0)
      });
    }

    return res.status(200).json({
      success: true,
      data: monthlyData
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly summary',
      error: error.message
    });
  }
};
