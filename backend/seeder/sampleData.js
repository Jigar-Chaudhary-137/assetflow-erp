const categories = [
  { name: 'Laptop', code: 'LPT', description: 'Business laptops and mobile workstations' },
  { name: 'Desktop', code: 'DSK', description: 'Desktop computers and thin clients' },
  { name: 'Monitor', code: 'MON', description: 'Display screens and dual monitor setups' },
  { name: 'Printer', code: 'PRN', description: 'Office printers, scanners, and copiers' },
  { name: 'Router', code: 'RTR', description: 'Network routers and switches' },
  { name: 'Server', code: 'SRV', description: 'Server rack blades and storage arrays' },
  { name: 'Mobile', code: 'MBL', description: 'Corporate smartphones and tablets' },
  { name: 'Furniture', code: 'FRN', description: 'Ergonomic desks, chairs, and cabinets' },
  { name: 'Accessories', code: 'ACC', description: 'Keyboards, mice, adapters, and docks' },
  { name: 'Network Equipment', code: 'NET', description: 'Cabling, firewalls, and access points' }
];

const departments = [
  { name: 'IT Department', code: 'IT' },
  { name: 'Human Resources', code: 'HR' },
  { name: 'Finance and Accounts', code: 'FIN' },
  { name: 'Sales Division', code: 'SLS' },
  { name: 'Marketing Team', code: 'MKT' },
  { name: 'Operations Office', code: 'OPS' },
  { name: 'Administration', code: 'ADM' },
  { name: 'Procurement', code: 'PRO' }
];

const userTemplates = [
  // 1 Admin
  {
    username: 'system_admin',
    email: 'admin@assetflow.com',
    passwordRaw: 'Admin123@',
    name: 'System Admin',
    role: 'ADMIN',
    designation: 'IT Director',
    status: 'ACTIVE'
  },
  // 2 Managers
  {
    username: 'it_manager',
    email: 'it.manager@assetflow.com',
    passwordRaw: 'Manager123@',
    name: 'IT Manager',
    role: 'ASSET_MANAGER',
    designation: 'Infrastructure Manager',
    status: 'ACTIVE'
  },
  {
    username: 'hr_manager',
    email: 'hr.manager@assetflow.com',
    passwordRaw: 'Manager123@',
    name: 'HR Manager',
    role: 'ASSET_MANAGER',
    designation: 'HR Operations Lead',
    status: 'ACTIVE'
  },
  // 10 Staff
  {
    username: 'staff_alice',
    email: 'alice@assetflow.com',
    passwordRaw: 'Staff123@',
    name: 'Alice Johnson',
    role: 'EMPLOYEE',
    designation: 'Senior Developer',
    status: 'ACTIVE'
  },
  {
    username: 'staff_bob',
    email: 'bob@assetflow.com',
    passwordRaw: 'Staff123@',
    name: 'Bob Smith',
    role: 'EMPLOYEE',
    designation: 'QA Engineer',
    status: 'ACTIVE'
  },
  {
    username: 'staff_charlie',
    email: 'charlie@assetflow.com',
    passwordRaw: 'Staff123@',
    name: 'Charlie Brown',
    role: 'EMPLOYEE',
    designation: 'UI Designer',
    status: 'ACTIVE'
  },
  {
    username: 'staff_david',
    email: 'david@assetflow.com',
    passwordRaw: 'Staff123@',
    name: 'David Miller',
    role: 'EMPLOYEE',
    designation: 'Systems Engineer',
    status: 'ACTIVE'
  },
  {
    username: 'staff_eva',
    email: 'eva@assetflow.com',
    passwordRaw: 'Staff123@',
    name: 'Eva Green',
    role: 'EMPLOYEE',
    designation: 'HR Specialist',
    status: 'ACTIVE'
  },
  {
    username: 'staff_frank',
    email: 'frank@assetflow.com',
    passwordRaw: 'Staff123@',
    name: 'Frank Wright',
    role: 'EMPLOYEE',
    designation: 'Financial Analyst',
    status: 'ACTIVE'
  },
  {
    username: 'staff_grace',
    email: 'grace@assetflow.com',
    passwordRaw: 'Staff123@',
    name: 'Grace Hopper',
    role: 'EMPLOYEE',
    designation: 'Sales Representative',
    status: 'ACTIVE'
  },
  {
    username: 'staff_henry',
    email: 'henry@assetflow.com',
    passwordRaw: 'Staff123@',
    name: 'Henry Ford',
    role: 'EMPLOYEE',
    designation: 'Procurement Specialist',
    status: 'ACTIVE'
  },
  {
    username: 'staff_irene',
    email: 'irene@assetflow.com',
    passwordRaw: 'Staff123@',
    name: 'Irene Adler',
    role: 'EMPLOYEE',
    designation: 'Marketing Executive',
    status: 'ACTIVE'
  },
  {
    username: 'staff_jack',
    email: 'jack@assetflow.com',
    passwordRaw: 'Staff123@',
    name: 'Jack Ryan',
    role: 'EMPLOYEE',
    designation: 'Operations Coordinator',
    status: 'ACTIVE'
  }
];

module.exports = {
  categories,
  departments,
  userTemplates
};
