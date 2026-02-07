import { Request, Response } from 'express';
import prisma from '../config/database';

type EmployeeType = 'TEACHER' | 'OFFICER' | 'STAFF';
type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

// Get all employees with filters
export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const { type, status, search, page = '1', limit = '10' } = req.query;
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);
    
    const where: any = {};
    
    if (type) {
      where.employeeType = type as EmployeeType;
    }
    
    if (status) {
      where.status = status as EmployeeStatus;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take,
        include: {
          teacher: true,
          officer: true,
          staff: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.employee.count({ where })
    ]);
    
    res.status(200).json({
      success: true,
      data: employees,
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
      message: 'Failed to fetch employees',
      error: error.message
    });
  }
};

// Get employee by ID
export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        teacher: true,
        officer: true,
        staff: true,
        payrolls: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch employee',
      error: error.message
    });
  }
};

// Create new employee
export const createEmployee = async (req: Request, res: Response) => {
  try {
    const {
      employeeId,
      name,
      age,
      phone,
      email,
      designation,
      employeeType,
      basicSalary,
      joiningDate,
      status,
      avatar,
      allowances,
      deductions,
      // Type-specific fields
      faculty,
      department,
      researchArea,
      publications,
      office,
      responsibilities,
      section,
      shift
    } = req.body;
    
    // Create employee with type-specific data
    const employee = await prisma.employee.create({
      data: {
        ...(employeeId && { id: employeeId }),
        name,
        age: parseInt(age),
        phone,
        email,
        designation,
        employeeType: employeeType as EmployeeType,
        basicSalary: parseFloat(basicSalary),
        joiningDate: new Date(joiningDate),
        status: status || 'ACTIVE',
        avatar,
        houseRent: allowances?.houseRent || 0,
        medical: allowances?.medical || 0,
        transport: allowances?.transport || 0,
        education: allowances?.education || 0,
        special: allowances?.special || 0,
        tax: deductions?.tax || 0,
        providentFund: deductions?.providentFund || 0,
        insurance: deductions?.insurance || 0,
        loan: deductions?.loan || 0,
        other: deductions?.other || 0,
        
        // Create related type-specific data
        ...(employeeType === 'TEACHER' && {
          teacher: {
            create: {
              faculty,
              department,
              researchArea,
              publications: publications ? parseInt(publications) : 0
            }
          }
        }),
        
        ...(employeeType === 'OFFICER' && {
          officer: {
            create: {
              office,
              responsibilities: responsibilities || []
            }
          }
        }),
        
        ...(employeeType === 'STAFF' && {
          staff: {
            create: {
              section,
              shift
            }
          }
        })
      },
      include: {
        teacher: true,
        officer: true,
        staff: true
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create employee',
      error: error.message
    });
  }
};

// Update employee
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const {
      name,
      age,
      phone,
      email,
      designation,
      basicSalary,
      status,
      avatar,
      allowances,
      deductions,
      // Type-specific fields
      faculty,
      department,
      researchArea,
      publications,
      office,
      responsibilities,
      section,
      shift
    } = req.body;
    
    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
      include: { teacher: true, officer: true, staff: true }
    });
    
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Update employee
    await prisma.employee.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(age && { age: parseInt(age) }),
        ...(phone && { phone }),
        ...(email && { email }),
        ...(designation && { designation }),
        ...(basicSalary && { basicSalary: parseFloat(basicSalary) }),
        ...(status && { status: status as EmployeeStatus }),
        ...(avatar !== undefined && { avatar }),
        ...(allowances?.houseRent !== undefined && { houseRent: allowances.houseRent }),
        ...(allowances?.medical !== undefined && { medical: allowances.medical }),
        ...(allowances?.transport !== undefined && { transport: allowances.transport }),
        ...(allowances?.education !== undefined && { education: allowances.education }),
        ...(allowances?.special !== undefined && { special: allowances.special }),
        ...(deductions?.tax !== undefined && { tax: deductions.tax }),
        ...(deductions?.providentFund !== undefined && { providentFund: deductions.providentFund }),
        ...(deductions?.insurance !== undefined && { insurance: deductions.insurance }),
        ...(deductions?.loan !== undefined && { loan: deductions.loan }),
        ...(deductions?.other !== undefined && { other: deductions.other })
      },
      include: {
        teacher: true,
        officer: true,
        staff: true
      }
    });
    
    // Update type-specific data
    if (existingEmployee.employeeType === 'TEACHER' && existingEmployee.teacher) {
      await prisma.teacher.update({
        where: { employeeId: id },
        data: {
          ...(faculty && { faculty }),
          ...(department && { department }),
          ...(researchArea !== undefined && { researchArea }),
          ...(publications !== undefined && { publications: parseInt(publications) })
        }
      });
    }
    
    if (existingEmployee.employeeType === 'OFFICER' && existingEmployee.officer) {
      await prisma.officer.update({
        where: { employeeId: id },
        data: {
          ...(office && { office }),
          ...(responsibilities && { responsibilities })
        }
      });
    }
    
    if (existingEmployee.employeeType === 'STAFF' && existingEmployee.staff) {
      await prisma.staff.update({
        where: { employeeId: id },
        data: {
          ...(section && { section }),
          ...(shift && { shift })
        }
      });
    }
    
    // Fetch updated employee
    const updatedEmployee = await prisma.employee.findUnique({
      where: { id },
      include: {
        teacher: true,
        officer: true,
        staff: true
      }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update employee',
      error: error.message
    });
  }
};

// Delete employee
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    const employee = await prisma.employee.findUnique({
      where: { id }
    });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    await prisma.employee.delete({
      where: { id }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete employee',
      error: error.message
    });
  }
};

// Get employee statistics
export const getEmployeeStats = async (_req: Request, res: Response) => {
  try {
    const [total, teachers, officers, staff, active, inactive] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { employeeType: 'TEACHER' as EmployeeType } }),
      prisma.employee.count({ where: { employeeType: 'OFFICER' as EmployeeType } }),
      prisma.employee.count({ where: { employeeType: 'STAFF' as EmployeeType } }),
      prisma.employee.count({ where: { status: 'ACTIVE' as EmployeeStatus } }),
      prisma.employee.count({ where: { status: 'INACTIVE' as EmployeeStatus } })
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        total,
        byType: {
          teachers,
          officers,
          staff
        },
        byStatus: {
          active,
          inactive
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee statistics',
      error: error.message
    });
  }
};
