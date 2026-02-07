import { BaseService } from './base.service';
import prisma from '../config/database';

/**
 * Payroll Service Class
 * Demonstrates: Inheritance, Encapsulation, Single Responsibility Principle
 */
export class PayrollService extends BaseService<any> {
  constructor() {
    super(prisma.payroll);
  }

  /**
   * Get all payroll records with filters
   */
  async getAllPayrolls(filters: {
    employeeId?: string;
    month?: number;
    year?: number;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { employeeId, month, year, status, page = 1, limit = 10 } = filters;
    
    const skip = (page - 1) * limit;
    const where: any = {};
    
    if (employeeId) where.employeeId = employeeId;
    if (month) where.month = parseInt(String(month));
    if (year) where.year = parseInt(String(year));
    if (status) where.status = status;
    
    const [payrolls, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
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
          { month: 'desc' }
        ]
      }),
      this.count(where)
    ]);
    
    return {
      payrolls,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get payroll by ID
   */
  async getPayrollById(id: string) {
    return await this.findById(id, {
      employee: {
        include: {
          teacher: true,
          officer: true,
          staff: true
        }
      }
    });
  }

  /**
   * Process payroll for an employee
   * Demonstrates: Business Logic and Calculation Encapsulation
   */
  async processPayroll(data: {
    employeeId: string;
    month: number;
    year: number;
  }) {
    const { employeeId, month, year } = data;
    
    // Check if payroll already exists
    const existingPayroll = await this.model.findFirst({
      where: { employeeId, month, year }
    });
    
    if (existingPayroll) {
      throw new Error('Payroll already processed for this period');
    }
    
    // Get employee data
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        teacher: true,
        officer: true,
        staff: true
      }
    });
    
    if (!employee) {
      throw new Error('Employee not found');
    }
    
    // Calculate salary components
    const grossSalary = this.calculateGrossSalary(employee);
    const totalDeductions = this.calculateTotalDeductions(employee);
    const netSalary = grossSalary - totalDeductions;
    
    // Create payroll record
    const payroll = await this.create({
      employeeId,
      employeeName: employee.name,
      employeeType: employee.employeeType,
      designation: employee.designation,
      month,
      year,
      basicSalary: employee.basicSalary,
      allowances: (employee as any).allowances || {},
      deductions: (employee as any).deductions || {},
      grossSalary,
      netSalary,
      status: 'PAID',
      paidAt: new Date()
    });
    
    return payroll;
  }

  /**
   * Calculate gross salary (private method)
   * Demonstrates: Encapsulation (private business logic)
   */
  private calculateGrossSalary(employee: any): number {
    const allowances = employee.allowances as any;
    const totalAllowances = Object.values(allowances).reduce((sum: number, val: any) => sum + Number(val), 0);
    return Number(employee.basicSalary) + totalAllowances;
  }

  /**
   * Calculate total deductions (private method)
   */
  private calculateTotalDeductions(employee: any): number {
    const deductions = employee.deductions as any;
    return Object.values(deductions).reduce((sum: number, val: any) => sum + Number(val), 0);
  }

  /**
   * Process payroll for all employees in a month
   */
  async processMonthlyPayroll(month: number, year: number) {
    const employees = await prisma.employee.findMany({
      where: { status: 'ACTIVE' },
      include: {
        teacher: true,
        officer: true,
        staff: true
      }
    });
    
    const results = [];
    const errors = [];
    
    for (const employee of employees) {
      try {
        const payroll = await this.processPayroll({
          employeeId: employee.id,
          month,
          year
        });
        results.push(payroll);
      } catch (error: any) {
        errors.push({
          employeeId: employee.id,
          employeeName: employee.name,
          error: error.message
        });
      }
    }
    
    return { results, errors };
  }

  /**
   * Get payroll summary for a period
   */
  async getPayrollSummary(month: number, year: number) {
    const payrolls = await this.model.findMany({
      where: { month, year }
    });
    
    const summary = {
      totalEmployees: payrolls.length,
      totalBasicSalary: 0,
      totalAllowances: 0,
      totalDeductions: 0,
      totalGrossSalary: 0,
      totalNetSalary: 0,
      byType: {
        teachers: { count: 0, total: 0 },
        officers: { count: 0, total: 0 },
        staff: { count: 0, total: 0 }
      }
    };
    
    payrolls.forEach((payroll: any) => {
      summary.totalBasicSalary += Number(payroll.basicSalary);
      summary.totalGrossSalary += Number(payroll.grossSalary);
      summary.totalNetSalary += Number(payroll.netSalary);
      
      const allowances = payroll.allowances as any;
      const deductions = payroll.deductions as any;
      summary.totalAllowances += Object.values(allowances).reduce((sum: number, val: any) => sum + Number(val), 0);
      summary.totalDeductions += Object.values(deductions).reduce((sum: number, val: any) => sum + Number(val), 0);
      
      const type = payroll.employeeType.toLowerCase();
      if (type === 'teacher') {
        summary.byType.teachers.count++;
        summary.byType.teachers.total += Number(payroll.netSalary);
      } else if (type === 'officer') {
        summary.byType.officers.count++;
        summary.byType.officers.total += Number(payroll.netSalary);
      } else if (type === 'staff') {
        summary.byType.staff.count++;
        summary.byType.staff.total += Number(payroll.netSalary);
      }
    });
    
    return summary;
  }

  /**
   * Update payroll status
   */
  async updatePayrollStatus(id: string, status: string) {
    return await this.update(id, { status });
  }

  /**
   * Delete payroll record
   */
  async deletePayroll(id: string) {
    return await this.delete(id);
  }
}

// Export singleton instance
export const payrollService = new PayrollService();
