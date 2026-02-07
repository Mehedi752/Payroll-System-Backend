import { BaseService } from './base.service';
import prisma from '../config/database';

/**
 * Employee Service Class
 * Demonstrates: Inheritance (extends BaseService), Encapsulation, Polymorphism
 */
export class EmployeeService extends BaseService<any> {
  constructor() {
    super(prisma.employee);
  }

  /**
   * Get all employees with pagination and filters
   * Demonstrates: Method Overriding and Polymorphism
   */
  async getAllEmployees(filters: {
    type?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { type, status, search, page = 1, limit = 10 } = filters;
    
    const skip = (page - 1) * limit;
    const where: any = {};
    
    if (type) where.employeeType = type;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const [employees, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
        include: {
          teacher: true,
          officer: true,
          staff: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.count(where)
    ]);
    
    return {
      employees,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get employee by ID with related data
   */
  async getEmployeeById(id: string) {
    return await this.findById(id, {
      teacher: true,
      officer: true,
      staff: true,
      payrolls: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    });
  }

  /**
   * Create new employee
   */
  async createEmployee(data: any) {
    const { employeeType, ...employeeData } = data;
    
    // Create employee with type-specific data
    const employee = await this.model.create({
      data: {
        ...employeeData,
        employeeType,
        ...(employeeType === 'TEACHER' && data.teacher && {
          teacher: { create: data.teacher }
        }),
        ...(employeeType === 'OFFICER' && data.officer && {
          officer: { create: data.officer }
        }),
        ...(employeeType === 'STAFF' && data.staff && {
          staff: { create: data.staff }
        })
      },
      include: {
        teacher: true,
        officer: true,
        staff: true
      }
    });
    
    return employee;
  }

  /**
   * Update employee
   */
  async updateEmployee(id: string, data: any) {
    const { employeeType, teacher, officer, staff, ...employeeData } = data;
    
    return await this.model.update({
      where: { id },
      data: {
        ...employeeData,
        ...(employeeType === 'TEACHER' && teacher && {
          teacher: { upsert: { create: teacher, update: teacher } }
        }),
        ...(employeeType === 'OFFICER' && officer && {
          officer: { upsert: { create: officer, update: officer } }
        }),
        ...(employeeType === 'STAFF' && staff && {
          staff: { upsert: { create: staff, update: staff } }
        })
      },
      include: {
        teacher: true,
        officer: true,
        staff: true
      }
    });
  }

  /**
   * Delete employee
   */
  async deleteEmployee(id: string) {
    return await this.delete(id);
  }

  /**
   * Get employee statistics
   * Demonstrates: Business Logic Encapsulation
   */
  async getEmployeeStats() {
    const [total, teachers, officers, staffMembers, active, inactive] = await Promise.all([
      this.count(),
      this.count({ employeeType: 'TEACHER' }),
      this.count({ employeeType: 'OFFICER' }),
      this.count({ employeeType: 'STAFF' }),
      this.count({ status: 'ACTIVE' }),
      this.count({ status: 'INACTIVE' })
    ]);

    return {
      total,
      byType: {
        teachers,
        officers,
        staff: staffMembers
      },
      byStatus: {
        active,
        inactive
      }
    };
  }

  /**
   * Search employees by keyword
   */
  async searchEmployees(keyword: string) {
    return await this.model.findMany({
      where: {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { email: { contains: keyword, mode: 'insensitive' } },
          { phone: { contains: keyword, mode: 'insensitive' } },
          { designation: { contains: keyword, mode: 'insensitive' } }
        ]
      },
      include: {
        teacher: true,
        officer: true,
        staff: true
      },
      take: 10
    });
  }
}

// Export singleton instance
export const employeeService = new EmployeeService();
