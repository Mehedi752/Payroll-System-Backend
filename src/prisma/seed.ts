import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.payroll.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.officer.deleteMany({});
  await prisma.staff.deleteMany({});
  await prisma.employee.deleteMany({});
  
  console.log('✅ Cleared existing data');

  // Create Teachers
  const teachers = await Promise.all([
    prisma.employee.create({
      data: {
        name: 'Dr. Sarah Johnson',
        age: 45,
        phone: '+1234567890',
        email: 'sarah.johnson@university.edu',
        designation: 'Professor',
        employeeType: 'TEACHER',
        basicSalary: 80000,
        joiningDate: new Date('2010-08-15'),
        status: 'ACTIVE',
        houseRent: 20000,
        medical: 5000,
        transport: 3000,
        education: 2000,
        special: 5000,
        tax: 12000,
        providentFund: 8000,
        insurance: 2000,
        loan: 0,
        other: 0,
        teacher: {
          create: {
            faculty: 'Engineering',
            department: 'Computer Science',
            researchArea: 'Machine Learning',
            publications: 45
          }
        }
      }
    }),
    prisma.employee.create({
      data: {
        name: 'Dr. Michael Chen',
        age: 38,
        phone: '+1234567891',
        email: 'michael.chen@university.edu',
        designation: 'Associate Professor',
        employeeType: 'TEACHER',
        basicSalary: 65000,
        joiningDate: new Date('2015-01-20'),
        status: 'ACTIVE',
        houseRent: 16000,
        medical: 4000,
        transport: 2500,
        education: 2000,
        special: 3500,
        tax: 9500,
        providentFund: 6500,
        insurance: 1500,
        loan: 0,
        other: 0,
        teacher: {
          create: {
            faculty: 'Engineering',
            department: 'Electrical Engineering',
            researchArea: 'Renewable Energy',
            publications: 28
          }
        }
      }
    }),
    prisma.employee.create({
      data: {
        name: 'Dr. Emily Rodriguez',
        age: 35,
        phone: '+1234567892',
        email: 'emily.rodriguez@university.edu',
        designation: 'Assistant Professor',
        employeeType: 'TEACHER',
        basicSalary: 55000,
        joiningDate: new Date('2018-09-01'),
        status: 'ACTIVE',
        houseRent: 14000,
        medical: 3500,
        transport: 2000,
        education: 1500,
        special: 3000,
        tax: 8000,
        providentFund: 5500,
        insurance: 1500,
        loan: 0,
        other: 0,
        teacher: {
          create: {
            faculty: 'Science',
            department: 'Physics',
            researchArea: 'Quantum Computing',
            publications: 15
          }
        }
      }
    }),
    prisma.employee.create({
      data: {
        name: 'Prof. James Wilson',
        age: 52,
        phone: '+1234567893',
        email: 'james.wilson@university.edu',
        designation: 'Professor',
        employeeType: 'TEACHER',
        basicSalary: 85000,
        joiningDate: new Date('2008-03-10'),
        status: 'ACTIVE',
        houseRent: 21000,
        medical: 5500,
        transport: 3500,
        education: 2000,
        special: 6000,
        tax: 13000,
        providentFund: 8500,
        insurance: 2000,
        loan: 0,
        other: 0,
        teacher: {
          create: {
            faculty: 'Business',
            department: 'Management',
            researchArea: 'Strategic Management',
            publications: 62
          }
        }
      }
    })
  ]);

  console.log(`✅ Created ${teachers.length} teachers`);

  // Create Officers
  const officers = await Promise.all([
    prisma.employee.create({
      data: {
        name: 'Robert Taylor',
        age: 42,
        phone: '+1234567894',
        email: 'robert.taylor@university.edu',
        designation: 'Senior Officer',
        employeeType: 'OFFICER',
        basicSalary: 50000,
        joiningDate: new Date('2012-06-15'),
        status: 'ACTIVE',
        houseRent: 12000,
        medical: 3000,
        transport: 2000,
        education: 1000,
        special: 2500,
        tax: 7000,
        providentFund: 5000,
        insurance: 1500,
        loan: 0,
        other: 0,
        officer: {
          create: {
            office: 'Administration',
            responsibilities: ['Budget Management', 'Staff Coordination', 'Policy Implementation']
          }
        }
      }
    }),
    prisma.employee.create({
      data: {
        name: 'Lisa Anderson',
        age: 36,
        phone: '+1234567895',
        email: 'lisa.anderson@university.edu',
        designation: 'Junior Officer',
        employeeType: 'OFFICER',
        basicSalary: 38000,
        joiningDate: new Date('2017-04-20'),
        status: 'ACTIVE',
        houseRent: 9000,
        medical: 2500,
        transport: 1500,
        education: 1000,
        special: 2000,
        tax: 5500,
        providentFund: 3800,
        insurance: 1200,
        loan: 0,
        other: 0,
        officer: {
          create: {
            office: 'Human Resources',
            responsibilities: ['Recruitment', 'Employee Relations', 'Training Coordination']
          }
        }
      }
    }),
    prisma.employee.create({
      data: {
        name: 'David Martinez',
        age: 44,
        phone: '+1234567896',
        email: 'david.martinez@university.edu',
        designation: 'Administrative Officer',
        employeeType: 'OFFICER',
        basicSalary: 45000,
        joiningDate: new Date('2013-11-05'),
        status: 'ACTIVE',
        houseRent: 11000,
        medical: 2800,
        transport: 1800,
        education: 1000,
        special: 2200,
        tax: 6500,
        providentFund: 4500,
        insurance: 1400,
        loan: 0,
        other: 0,
        officer: {
          create: {
            office: 'Finance',
            responsibilities: ['Payroll Processing', 'Financial Reporting', 'Budget Planning']
          }
        }
      }
    })
  ]);

  console.log(`✅ Created ${officers.length} officers`);

  // Create Staff
  const staff = await Promise.all([
    prisma.employee.create({
      data: {
        name: 'John Smith',
        age: 32,
        phone: '+1234567897',
        email: 'john.smith@university.edu',
        designation: 'Senior Staff',
        employeeType: 'STAFF',
        basicSalary: 32000,
        joiningDate: new Date('2016-02-10'),
        status: 'ACTIVE',
        houseRent: 8000,
        medical: 2000,
        transport: 1200,
        education: 800,
        special: 1500,
        tax: 4500,
        providentFund: 3200,
        insurance: 1000,
        loan: 0,
        other: 0,
        staff: {
          create: {
            section: 'Laboratory',
            shift: 'MORNING'
          }
        }
      }
    }),
    prisma.employee.create({
      data: {
        name: 'Maria Garcia',
        age: 28,
        phone: '+1234567898',
        email: 'maria.garcia@university.edu',
        designation: 'Junior Staff',
        employeeType: 'STAFF',
        basicSalary: 25000,
        joiningDate: new Date('2019-07-15'),
        status: 'ACTIVE',
        houseRent: 6000,
        medical: 1500,
        transport: 1000,
        education: 500,
        special: 1000,
        tax: 3500,
        providentFund: 2500,
        insurance: 800,
        loan: 0,
        other: 0,
        staff: {
          create: {
            section: 'Library',
            shift: 'MORNING'
          }
        }
      }
    }),
    prisma.employee.create({
      data: {
        name: 'Ahmed Hassan',
        age: 35,
        phone: '+1234567899',
        email: 'ahmed.hassan@university.edu',
        designation: 'Lab Technician',
        employeeType: 'STAFF',
        basicSalary: 30000,
        joiningDate: new Date('2015-05-20'),
        status: 'ACTIVE',
        houseRent: 7500,
        medical: 1800,
        transport: 1200,
        education: 600,
        special: 1300,
        tax: 4200,
        providentFund: 3000,
        insurance: 900,
        loan: 0,
        other: 0,
        staff: {
          create: {
            section: 'Laboratory',
            shift: 'EVENING'
          }
        }
      }
    })
  ]);

  console.log(`✅ Created ${staff.length} staff members`);

  // Create some payroll records for the current month
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const allEmployees = [...teachers, ...officers, ...staff];
  
  for (const employee of allEmployees.slice(0, 5)) {
    const totalAllowances = employee.houseRent + employee.medical + employee.transport + employee.education + employee.special;
    const totalDeductions = employee.tax + employee.providentFund + employee.insurance + employee.loan + employee.other;
    const grossSalary = employee.basicSalary + totalAllowances;
    const netSalary = grossSalary - totalDeductions;

    await prisma.payroll.create({
      data: {
        employeeId: employee.id,
        month: currentMonth,
        year: currentYear,
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
        status: Math.random() > 0.5 ? 'PAID' : 'PENDING',
        paidAt: Math.random() > 0.5 ? new Date() : null
      }
    });
  }

  console.log(`✅ Created payroll records for current month`);

  // Create some settings
  await prisma.settings.createMany({
    data: [
      { key: 'organization_name', value: 'University Payroll System' },
      { key: 'default_currency', value: 'USD' },
      { key: 'tax_rate', value: '15' },
      { key: 'provident_fund_rate', value: '10' }
    ]
  });

  console.log(`✅ Created system settings`);
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
