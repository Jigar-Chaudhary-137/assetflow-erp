import axios from 'axios';

// Get API base URL from environment or use a default localhost address
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('assetflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (error.response && error.response.status === 401) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('assetflow_refresh_token');
      if (!refreshToken) {
        localStorage.removeItem('assetflow_token');
        localStorage.removeItem('assetflow_refresh_token');
        localStorage.removeItem('assetflow_user');
        window.dispatchEvent(new Event('auth_session_expired'));
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;

        localStorage.setItem('assetflow_token', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('assetflow_refresh_token', newRefreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        isRefreshing = false;
        
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('assetflow_token');
        localStorage.removeItem('assetflow_refresh_token');
        localStorage.removeItem('assetflow_user');
        window.dispatchEvent(new Event('auth_session_expired'));
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// MOCK DATABASE & LOGIC FOR OFFLINE / FALLBACK MODE
// This ensures that the application is fully interactive for the Hackathon even before backend is deployed.

const initialDepartments = [
  { id: 'dept-1', name: 'Information Technology', code: 'IT', head: 'John Doe (Admin)' },
  { id: 'dept-2', name: 'Human Resources', code: 'HR', head: 'Sarah Jenkins' },
  { id: 'dept-3', name: 'Finance & Accounts', code: 'FIN', head: 'Robert Vance' },
  { id: 'dept-4', name: 'Operations & Facilities', code: 'OPS', head: 'Michael Scott' }
];

const initialCategories = [
  { id: 'cat-1', name: 'Laptops & Workstations', code: 'LAP', description: 'Office laptops, desktop towers, and developer machines.' },
  { id: 'cat-2', name: 'Mobile Devices', code: 'MOB', description: 'Company phones and testing tablets.' },
  { id: 'cat-3', name: 'Monitors & Displays', code: 'MON', description: 'Screens, projectors, and conference displays.' },
  { id: 'cat-4', name: 'Office Furniture', code: 'FUR', description: 'Ergonomic chairs, standing desks, and cabinets.' }
];

const initialEmployees = [
  { id: 'emp-1', name: 'System Administrator', email: 'admin@assetflow.com', password: 'Admin@123', role: 'Admin', department: 'IT', designation: 'Director of IT', status: 'Active' },
  { id: 'emp-2', name: 'Asset Manager', email: 'manager@assetflow.com', password: 'Manager@123', role: 'Asset Manager', department: 'IT', designation: 'Asset Lead', status: 'Active' },
  { id: 'emp-3', name: 'Department Head', email: 'department@assetflow.com', password: 'Department@123', role: 'Department Head', department: 'HR', designation: 'HR Director', status: 'Active' },
  { id: 'emp-4', name: 'Employee', email: 'employee@assetflow.com', password: 'Employee@123', role: 'Employee', department: 'Operations', designation: 'Ops Manager', status: 'Active' }
];

const initialAssets = [
  { 
    id: 'ast-1', 
    name: 'MacBook Pro 16" M3 Max', 
    assetTag: 'AST-LAP-001', 
    category: 'Laptops & Workstations', 
    model: 'Apple MBP 16" 2024', 
    serialNumber: 'C02F1234Q05D', 
    purchaseDate: '2026-01-10', 
    purchaseCost: 3499, 
    status: 'Allocated', 
    department: 'Information Technology', 
    location: 'HQ - Floor 3', 
    notes: 'Primary dev machine for Senior Lead.'
  },
  { 
    id: 'ast-2', 
    name: 'Dell XPS 15 9530', 
    assetTag: 'AST-LAP-002', 
    category: 'Laptops & Workstations', 
    model: 'Dell XPS 15 2023', 
    serialNumber: '34XPS987LOK', 
    purchaseDate: '2026-02-15', 
    purchaseCost: 1999, 
    status: 'Available', 
    department: 'Information Technology', 
    location: 'IT Storage Lab', 
    notes: 'Ready to allocate.'
  },
  { 
    id: 'ast-3', 
    name: 'iPhone 15 Pro Max 256GB', 
    assetTag: 'AST-MOB-001', 
    category: 'Mobile Devices', 
    model: 'Apple iPhone 15', 
    serialNumber: 'DNPGH999XF01', 
    purchaseDate: '2026-03-01', 
    purchaseCost: 1199, 
    status: 'Reserved', 
    department: 'Human Resources', 
    location: 'HR Office Drawer B', 
    notes: 'Reserved for upcoming executive hire.'
  },
  { 
    id: 'ast-4', 
    name: 'Samsung 34" Odyssey G8 OLED', 
    assetTag: 'AST-MON-001', 
    category: 'Monitors & Displays', 
    model: 'Samsung G8 Ultrawide', 
    serialNumber: 'SAMS34ODYSSEY', 
    purchaseDate: '2026-04-12', 
    purchaseCost: 999, 
    status: 'Under Maintenance', 
    department: 'Information Technology', 
    location: 'Repair Lab', 
    notes: 'Intermittent screen flicker. Awaiting panel replacement.'
  },
  { 
    id: 'ast-5', 
    name: 'Herman Miller Aeron Chair', 
    assetTag: 'AST-FUR-001', 
    category: 'Office Furniture', 
    model: 'Aeron Size B', 
    serialNumber: 'HM-AERON-9921', 
    purchaseDate: '2025-11-20', 
    purchaseCost: 1450, 
    status: 'Allocated', 
    department: 'Operations & Facilities', 
    location: 'Main Office Space', 
    notes: 'Allocated to Ops Specialist.'
  }
];

const initialAllocations = [
  {
    id: 'alloc-1',
    assetId: 'ast-1',
    assetTag: 'AST-LAP-001',
    assetName: 'MacBook Pro 16" M3 Max',
    employeeId: 'emp-1',
    employeeName: 'System Administrator',
    allocatedBy: 'Asset Manager',
    allocatedDate: '2026-01-12',
    dueDate: '2027-01-12',
    returnedDate: null,
    status: 'Active',
    notes: 'Authorized standard setup.'
  },
  {
    id: 'alloc-2',
    assetId: 'ast-5',
    assetTag: 'AST-FUR-001',
    assetName: 'Herman Miller Aeron Chair',
    employeeId: 'emp-4',
    employeeName: 'Employee',
    allocatedBy: 'Asset Manager',
    allocatedDate: '2025-11-21',
    dueDate: '2026-11-21',
    returnedDate: null,
    status: 'Active',
    notes: 'Ergonomic requirement approved.'
  }
];

const initialBookings = [
  {
    id: 'book-1',
    assetId: 'ast-3',
    assetTag: 'AST-MOB-001',
    assetName: 'iPhone 15 Pro Max 256GB',
    employeeId: 'emp-3',
    employeeName: 'Department Head',
    startDate: '2026-07-20',
    endDate: '2026-07-25',
    purpose: 'HR Recruiting Trip photoshoot',
    status: 'Approved'
  }
];

const initialMaintenances = [
  {
    id: 'maint-1',
    assetId: 'ast-4',
    assetTag: 'AST-MON-001',
    assetName: 'Samsung 34" Odyssey G8 OLED',
    requestedBy: 'Asset Manager',
    issueDescription: 'Screen flicker at 120Hz refresh rates.',
    priority: 'Medium',
    cost: 150,
    status: 'In Progress',
    approvedBy: 'System Administrator',
    startDate: '2026-07-10',
    endDate: null,
    notes: 'Waiting on manufacturer warranty ticket response.'
  }
];

const initialNotifications = [
  {
    id: 'notif-1',
    recipientId: 'emp-1',
    title: 'New Maintenance Request',
    message: 'Samsung Odyssey G8 screen flicker reported by Asset Manager.',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'notif-2',
    recipientId: 'emp-2',
    title: 'Transfer Approved',
    message: 'Asset MacBook Pro AST-LAP-001 transfer has been finalized.',
    read: true,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

const initialAuditLogs = [
  {
    id: 'log-1',
    user: 'Asset Manager',
    action: 'Asset Allocation Created',
    targetType: 'Asset',
    targetTag: 'AST-LAP-001',
    details: 'Allocated MacBook Pro to System Administrator.',
    timestamp: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'log-2',
    user: 'System Administrator',
    action: 'Maintenance Ticket Approved',
    targetType: 'Maintenance',
    targetTag: 'AST-MON-001',
    details: 'Approved warranty service ticket.',
    timestamp: new Date(Date.now() - 36000000).toISOString()
  }
];

// Seed databases helper helper
const getMockDb = (key, initialData) => {
  const data = localStorage.getItem(`mock_${key}`);
  if (!data) {
    localStorage.setItem(`mock_${key}`, JSON.stringify(initialData));
    return initialData;
  }
  const parsed = JSON.parse(data);
  if (key === 'employees') {
    // Healing logic: Ensure the 4 required users are always present in the database with their correct passwords and roles
    let hasAllFour = true;
    for (const req of initialData) {
      const found = parsed.find(e => e.email.toLowerCase() === req.email.toLowerCase());
      if (!found || found.password !== req.password || found.name !== req.name || found.role !== req.role) {
        hasAllFour = false;
        break;
      }
    }
    if (!hasAllFour) {
      localStorage.setItem(`mock_${key}`, JSON.stringify(initialData));
      return initialData;
    }
  }
  return parsed;
};

const saveMockDb = (key, data) => {
  localStorage.setItem(`mock_${key}`, JSON.stringify(data));
};

export const getMockData = (key) => {
  switch (key) {
    case 'departments': return getMockDb('departments', initialDepartments);
    case 'categories': return getMockDb('categories', initialCategories);
    case 'employees': return getMockDb('employees', initialEmployees);
    case 'assets': return getMockDb('assets', initialAssets);
    case 'allocations': return getMockDb('allocations', initialAllocations);
    case 'bookings': return getMockDb('bookings', initialBookings);
    case 'maintenances': return getMockDb('maintenances', initialMaintenances);
    case 'notifications': return getMockDb('notifications', initialNotifications);
    case 'auditLogs': return getMockDb('auditLogs', initialAuditLogs);
    default: return [];
  }
};

export const saveMockData = (key, data) => {
  saveMockDb(key, data);
};

// Automate Audit Log & Notification helper in client
export const logMockActivity = (user, action, targetType, targetTag, details) => {
  const logs = getMockData('auditLogs');
  const newLog = {
    id: `log-${Date.now()}`,
    user,
    action,
    targetType,
    targetTag,
    details,
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog);
  saveMockData('auditLogs', logs);
};

export const triggerMockNotification = (recipientId, title, message) => {
  const notifs = getMockData('notifications');
  const newNotif = {
    id: `notif-${Date.now()}`,
    recipientId,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString()
  };
  notifs.unshift(newNotif);
  saveMockData('notifications', notifs);
};

// Safe API Call wrapper: attempts backend first, falls back to Mock logic
export const safeApiCall = async (apiFunc, mockFallbackFunc) => {
  try {
    // If backend isn't available, this will throw an error immediately
    const res = await apiFunc();
    return res.data;
  } catch (error) {
    // Check if network error (signifies backend server offline)
    if (!error.response || error.code === 'ERR_NETWORK') {
      console.warn('Backend server offline. Serving request from client-side simulated DB...');
      return mockFallbackFunc();
    }
    throw error;
  }
};

export default api;
