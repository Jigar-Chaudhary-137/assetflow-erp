const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Reusable Schema Definitions
const schemas = {
  ApiResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: { type: 'object' },
      message: { type: 'string', example: 'Action performed successfully' }
    }
  },
  ApiError: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'fail' },
      message: { type: 'string', example: 'Error occurred processing request' }
    }
  },
  ValidationError: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'fail' },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            msg: { type: 'string', example: 'Invalid value provided' },
            param: { type: 'string', example: 'email' },
            location: { type: 'string', example: 'body' }
          }
        }
      }
    }
  },
  User: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '6a534e46009ac1f536dd466d' },
      username: { type: 'string', example: 'john_doe' },
      email: { type: 'string', example: 'john.doe@example.com' },
      name: { type: 'string', example: 'John Doe' },
      role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'], example: 'EMPLOYEE' },
      status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'], example: 'ACTIVE' },
      departmentId: { type: 'string', example: '6a534fa9ba7e1c2073025f56' },
      contactNumber: { type: 'string', example: '1234567890' },
      phone: { type: 'string', example: '9876543210' },
      designation: { type: 'string', example: 'Software Engineer' },
      joiningDate: { type: 'string', format: 'date-time', example: '2026-07-12T00:00:00.000Z' }
    }
  },
  Category: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '6a534fa9ba7e1c2073025f55' },
      name: { type: 'string', example: 'Electronics' },
      code: { type: 'string', example: 'ELEC' },
      description: { type: 'string', example: 'Electronic gadgets and devices' }
    }
  },
  Department: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '6a534fa9ba7e1c2073025f56' },
      name: { type: 'string', example: 'Engineering' },
      code: { type: 'string', example: 'ENG' },
      parentDepartmentId: { type: 'string', example: '6a534fa9ba7e1c2073025f50' },
      status: { type: 'string', example: 'ACTIVE' }
    }
  },
  Asset: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '6a534bf196ae68172c0b07fc' },
      assetTag: { type: 'string', example: 'AST-ELEC-001' },
      serialNumber: { type: 'string', example: 'SN123456789' },
      name: { type: 'string', example: 'MacBook Pro 16' },
      categoryId: { type: 'string', example: '6a534fa9ba7e1c2073025f55' },
      departmentId: { type: 'string', example: '6a534fa9ba7e1c2073025f56' },
      status: { type: 'string', enum: ['AVAILABLE', 'ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED'], example: 'AVAILABLE' },
      bookable: { type: 'boolean', example: true },
      location: {
        type: 'object',
        properties: {
          building: { type: 'string', example: 'Building A' },
          floor: { type: 'integer', example: 3 },
          room: { type: 'string', example: 'Room 302' }
        }
      },
      purchaseInfo: {
        type: 'object',
        properties: {
          purchaseCost: { type: 'number', example: 2500 },
          purchaseDate: { type: 'string', format: 'date-time', example: '2026-01-01T00:00:00.000Z' },
          warrantyExpiration: { type: 'string', format: 'date-time', example: '2028-01-01T00:00:00.000Z' }
        }
      }
    }
  },
  Allocation: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '6a534bfb458a86f2601314e5' },
      assetId: { type: 'string', example: '6a534bf196ae68172c0b07fc' },
      employeeId: { type: 'string', example: '6a534e46009ac1f536dd466d' },
      checkoutDate: { type: 'string', format: 'date-time', example: '2026-07-12T00:00:00.000Z' },
      expectedReturnDate: { type: 'string', format: 'date-time', example: '2026-08-12T00:00:00.000Z' },
      actualReturnDate: { type: 'string', format: 'date-time', example: '2026-07-20T00:00:00.000Z' },
      status: { type: 'string', enum: ['ACTIVE', 'RETURNED', 'OVERDUE'], example: 'ACTIVE' },
      notes: { type: 'string', example: 'Standard software development checkout' }
    }
  },
  Transfer: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '6a534c0fb72fdbf89b595971' },
      assetId: { type: 'string', example: '6a534bf196ae68172c0b07fc' },
      allocationId: { type: 'string', example: '6a534bfb458a86f2601314e5' },
      fromEmployeeId: { type: 'string', example: '6a534e46009ac1f536dd466d' },
      toEmployeeId: { type: 'string', example: '6a534e46009ac1f536dd466e' },
      requestedById: { type: 'string', example: '6a534e46009ac1f536dd466d' },
      actionById: { type: 'string', example: '6a534e3b70b295db888bcae0' },
      status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'], example: 'PENDING' },
      comments: { type: 'string', example: 'Developer transfer to new department custodian' }
    }
  },
  Maintenance: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '6a534caad2fe42278bb54594' },
      assetId: { type: 'string', example: '6a534bf196ae68172c0b07fc' },
      reportedById: { type: 'string', example: '6a534e46009ac1f536dd466d' },
      issueDescription: { type: 'string', example: 'Screen flickering issue' },
      priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], example: 'HIGH' },
      status: { type: 'string', enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], example: 'SCHEDULED' },
      scheduledDate: { type: 'string', format: 'date-time', example: '2026-07-15T10:00:00.000Z' },
      startedAt: { type: 'string', format: 'date-time', example: '2026-07-15T10:15:00.000Z' },
      completionDate: { type: 'string', format: 'date-time', example: '2026-07-15T14:00:00.000Z' },
      estimatedCost: { type: 'number', example: 150 },
      actualCost: { type: 'number', example: 140 },
      vendor: { type: 'string', example: 'Apple Care Service' },
      notes: { type: 'string', example: 'Panel replacement completed under warranty scope' }
    }
  },
  Audit: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '6a534cb91cd4985b4cf4c7a6' },
      auditCode: { type: 'string', example: 'AUD-2026-Q3-01' },
      auditName: { type: 'string', example: 'Q3 Laptop Inventory Audit' },
      auditType: { type: 'string', example: 'INVENTORY' },
      scheduledDate: { type: 'string', format: 'date-time', example: '2026-07-20T00:00:00.000Z' },
      auditorId: { type: 'string', example: '6a534e46009ac1f536dd466d' },
      scope: { type: 'string', example: 'Engineering Dept' },
      remarks: { type: 'string', example: 'Verifying all high-end macbooks' },
      status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], example: 'PENDING' },
      selectedAssets: {
        type: 'array',
        items: { type: 'string', example: '6a534bf196ae68172c0b07fc' }
      },
      verifiedAssets: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            assetId: { type: 'string', example: '6a534bf196ae68172c0b07fc' },
            found: { type: 'boolean', example: true },
            condition: { type: 'string', enum: ['GOOD', 'DAMAGED', 'MISSING'], example: 'GOOD' },
            remarks: { type: 'string', example: 'Device verified in good working condition' }
          }
        }
      }
    }
  },
  Notification: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '6a534e46009ac1f536dd466f' },
      recipient: { type: 'string', example: '6a534e46009ac1f536dd466d' },
      title: { type: 'string', example: 'Asset Allocated' },
      message: { type: 'string', example: 'Asset MacBook Pro has been allocated to you.' },
      type: { type: 'string', example: 'SYSTEM' },
      priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], example: 'MEDIUM' },
      module: { type: 'string', example: 'ALLOCATION' },
      entityId: { type: 'string', example: '6a534bfb458a86f2601314e5' },
      isRead: { type: 'boolean', example: false }
    }
  },
  ActivityLog: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '6a534e46009ac1f536dd4660' },
      userId: { type: 'string', example: '6a534e3b70b295db888bcae0' },
      userName: { type: 'string', example: 'Log Admin' },
      action: { type: 'string', example: 'CREATE' },
      module: { type: 'string', example: 'ASSET' },
      entityId: { type: 'string', example: '6a534bf196ae68172c0b07fc' },
      httpMethod: { type: 'string', example: 'POST' },
      endpoint: { type: 'string', example: '/api/assets' },
      ipAddress: { type: 'string', example: '::1' },
      userAgent: { type: 'string', example: 'PostmanRuntime/7.40.0' }
    }
  }
};

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Asset Flow ERP API',
      version: '1.0.0',
      description: 'Asset Flow ERP Backend REST API Documentation providing control schemas and workflow configurations.',
      contact: {
        name: 'Developer Support',
        email: 'support@assetflow.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Authorization header using the Bearer scheme. Example: "Bearer <token>"'
        }
      },
      schemas
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      { name: 'Authentication', description: 'User registration, login, token refresh, and logout' },
      { name: 'Users', description: 'User profiles and status administration' },
      { name: 'Categories', description: 'Asset categorizations CRUD' },
      { name: 'Departments', description: 'Organization departments structure' },
      { name: 'Assets', description: 'Asset registrations and status transitions' },
      { name: 'Allocations', description: 'Check-outs, returns, and allocations mapping' },
      { name: 'Transfers', description: 'Asset custodianship transfers' },
      { name: 'Maintenance', description: 'Equipment repair schedules and status tracking' },
      { name: 'Audits', description: 'Asset validation and inventory sync cycles' },
      { name: 'Notifications', description: 'In-app alert configurations' },
      { name: 'Activity Logs', description: 'System-wide trace parameters' },
      { name: 'Reports & Dashboard', description: 'MongoDB Aggregation metrics and Excel/PDF export' }
    ]
  },
  // Point to path folders, but since we will configure route docs explicitly, let's keep it clean
  apis: []
};

const swaggerSpec = swaggerJSDoc(options);

// Inject paths programmatically to keep files cleaner, and guarantee no parsing failures
swaggerSpec.paths = {
  '/api/auth/register': {
    post: {
      tags: ['Authentication'],
      summary: 'Register a new User & Employee',
      description: 'Creates a new user record. By default, creates an employee profile unified to the user _id.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['username', 'email', 'password', 'name'],
              properties: {
                username: { type: 'string', example: 'john_doe' },
                email: { type: 'string', example: 'john.doe@example.com' },
                password: { type: 'string', example: 'password123' },
                name: { type: 'string', example: 'John Doe' },
                role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'], default: 'EMPLOYEE', example: 'EMPLOYEE' },
                departmentId: { type: 'string', example: '6a534fa9ba7e1c2073025f56' },
                contactNumber: { type: 'string', example: '1234567890' }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'User registered successfully',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
        },
        400: { description: 'Duplicate Email/Username or validation failure', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } }
      }
    }
  },
  '/api/auth/login': {
    post: {
      tags: ['Authentication'],
      summary: 'Authenticate User & Login',
      description: 'Verifies email and password, generates access and refresh tokens, and resolves user profile parameters.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', example: 'john.doe@example.com' },
                password: { type: 'string', example: 'password123' }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Login successful. Returns tokens and user data.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
        },
        401: { description: 'Invalid email or password credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } }
      }
    }
  },
  '/api/auth/refresh': {
    post: {
      tags: ['Authentication'],
      summary: 'Refresh Access Token',
      description: 'Generates a new access token using a valid HTTP-Only or request body refresh token.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['refreshToken'],
              properties: {
                refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' }
              }
            }
          }
        }
      },
      responses: {
        200: { description: 'Token refreshed successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
        401: { description: 'Invalid or expired refresh token' }
      }
    }
  },
  '/api/auth/logout': {
    post: {
      tags: ['Authentication'],
      summary: 'Logout User',
      description: 'Clears refresh tokens from database.',
      responses: {
        200: { description: 'Logged out successfully' }
      }
    }
  },
  '/api/auth/me': {
    get: {
      tags: ['Authentication'],
      summary: 'Get Current Profile Details',
      description: 'Retrieves profile information for the authenticated user session.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Success', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
      }
    }
  },
  '/api/users': {
    get: {
      tags: ['Users'],
      summary: 'Get all Unified Users / Employees',
      description: 'Lists all users. Supports pagination, sorting, and search fields. Restricted to Admin and Manager.',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'search', in: 'query', schema: { type: 'string' } }
      ],
      responses: {
        200: { description: 'Success', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
        403: { description: 'Blocked for staff' }
      }
    }
  },
  '/api/users/{id}': {
    get: {
      tags: ['Users'],
      summary: 'Get User / Employee details by ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Success', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
      }
    },
    put: {
      tags: ['Users'],
      summary: 'Update User / Employee profile fields',
      description: 'Updates properties like phone, designation, joiningDate, and departmentId. Admin/Manager or the user self.',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'John updated' },
                phone: { type: 'string', example: '9999999999' },
                designation: { type: 'string', example: 'Senior Engineer' }
              }
            }
          }
        }
      },
      responses: {
        200: { description: 'Updated successfully' }
      }
    },
    delete: {
      tags: ['Users'],
      summary: 'Soft-delete or Deactivate User',
      description: 'Blocks user, sets status to INACTIVE. Restricted to Admin.',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'User deactivated successfully' }
      }
    }
  },
  '/api/users/{id}/status': {
    patch: {
      tags: ['Users'],
      summary: 'Change User Status',
      description: 'Toggles status (ACTIVE, INACTIVE, SUSPENDED). Blocks if user has active allocations. Admin only.',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['status'],
              properties: { status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] } }
            }
          }
        }
      },
      responses: {
        200: { description: 'Status updated' }
      }
    }
  },
  '/api/categories': {
    post: {
      tags: ['Categories'],
      summary: 'Create Category',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', required: ['name', 'code'], properties: { name: { type: 'string' }, code: { type: 'string' } } } } }
      },
      responses: { 201: { description: 'Created' } }
    },
    get: {
      tags: ['Categories'],
      summary: 'Get all Categories',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api/categories/{id}': {
    get: {
      tags: ['Categories'],
      summary: 'Get Category By ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    },
    put: {
      tags: ['Categories'],
      summary: 'Update Category',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' } } } } }
      },
      responses: { 200: { description: 'Success' } }
    },
    delete: {
      tags: ['Categories'],
      summary: 'Delete Category',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api/departments': {
    post: {
      tags: ['Departments'],
      summary: 'Create Department',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', required: ['name', 'code'], properties: { name: { type: 'string' }, code: { type: 'string' } } } } }
      },
      responses: { 201: { description: 'Created' } }
    },
    get: {
      tags: ['Departments'],
      summary: 'Get all Departments',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api/departments/{id}': {
    get: {
      tags: ['Departments'],
      summary: 'Get Department By ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    },
    put: {
      tags: ['Departments'],
      summary: 'Update Department',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, code: { type: 'string' } } } } }
      },
      responses: { 200: { description: 'Success' } }
    },
    delete: {
      tags: ['Departments'],
      summary: 'Delete Department',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api/assets': {
    post: {
      tags: ['Assets'],
      summary: 'Register Asset',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['assetTag', 'serialNumber', 'name', 'categoryId'],
              properties: {
                assetTag: { type: 'string' },
                serialNumber: { type: 'string' },
                name: { type: 'string' },
                categoryId: { type: 'string' },
                departmentId: { type: 'string' }
              }
            }
          }
        }
      },
      responses: { 201: { description: 'Created' } }
    },
    get: {
      tags: ['Assets'],
      summary: 'Get all Assets with filters',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'status', in: 'query', schema: { type: 'string' } },
        { name: 'categoryId', in: 'query', schema: { type: 'string' } }
      ],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api/assets/{id}': {
    get: {
      tags: ['Assets'],
      summary: 'Get Asset By ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    },
    put: {
      tags: ['Assets'],
      summary: 'Update Asset details',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' } } } } }
      },
      responses: { 200: { description: 'Success' } }
    },
    delete: {
      tags: ['Assets'],
      summary: 'Soft Delete / Retire Asset',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api/allocations': {
    post: {
      tags: ['Allocations'],
      summary: 'Allocate Asset (Check Out)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['assetId', 'employeeId', 'expectedReturnDate'],
              properties: { assetId: { type: 'string' }, employeeId: { type: 'string' }, expectedReturnDate: { type: 'string' } }
            }
          }
        }
      },
      responses: { 201: { description: 'Success' } }
    }
  },
  '/api/allocations/{id}/return': {
    post: {
      tags: ['Allocations'],
      summary: 'Return Asset (Check In)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        content: { 'application/json': { schema: { type: 'object', properties: { notes: { type: 'string' } } } } }
      },
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api/allocations/active': {
    get: {
      tags: ['Allocations'],
      summary: 'Get active allocations list',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api/transfers': {
    post: {
      tags: ['Transfers'],
      summary: 'Create Transfer Request',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['assetId', 'toEmployeeId'],
              properties: { assetId: { type: 'string' }, toEmployeeId: { type: 'string' } }
            }
          }
        }
      },
      responses: { 201: { description: 'Success' } }
    },
    get: {
      tags: ['Transfers'],
      summary: 'Get Transfers History',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api/transfers/{id}/approve': {
    patch: {
      tags: ['Transfers'],
      summary: 'Approve Transfer Request',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api/transfers/{id}/reject': {
    patch: {
      tags: ['Transfers'],
      summary: 'Reject Transfer Request',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        content: { 'application/json': { schema: { type: 'object', properties: { reason: { type: 'string' } } } } }
      },
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api/maintenance': {
    post: {
      tags: ['Maintenance'],
      summary: 'Schedule Maintenance Request',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['assetId', 'issueDescription', 'scheduledDate'],
              properties: { assetId: { type: 'string' }, issueDescription: { type: 'string' }, scheduledDate: { type: 'string' } }
            }
          }
        }
      },
      responses: { 201: { description: 'Success' } }
    },
    get: {
      tags: ['Maintenance'],
      summary: 'Get Maintenance Task History',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api/maintenance/{id}/start': {
    patch: {
      tags: ['Maintenance'],
      summary: 'Start Maintenance Task',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api/maintenance/{id}/complete': {
    patch: {
      tags: ['Maintenance'],
      summary: 'Complete Maintenance Task',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['resolutionDetails', 'actualCost'],
              properties: { resolutionDetails: { type: 'string' }, actualCost: { type: 'number' } }
            }
          }
        }
      },
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api/maintenance/{id}/cancel': {
    patch: {
      tags: ['Maintenance'],
      summary: 'Cancel Maintenance Task',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api/audits': {
    post: {
      tags: ['Audits'],
      summary: 'Create Audit Cycle',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['auditCode', 'auditName', 'scheduledDate', 'auditorId'],
              properties: { auditCode: { type: 'string' }, auditName: { type: 'string' }, scheduledDate: { type: 'string' }, auditorId: { type: 'string' } }
            }
          }
        }
      },
      responses: { 201: { description: 'Success' } }
    },
    get: {
      tags: ['Audits'],
      summary: 'Get Audit History List',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api/audits/{id}/start': {
    patch: {
      tags: ['Audits'],
      summary: 'Start Audit Cycle',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api/audits/{id}/verify': {
    patch: {
      tags: ['Audits'],
      summary: 'Verify Asset in Audit Cycle',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['assetId', 'found', 'condition'],
              properties: { assetId: { type: 'string' }, found: { type: 'boolean' }, condition: { type: 'string', enum: ['GOOD', 'DAMAGED', 'MISSING'] } }
            }
          }
        }
      },
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api/audits/{id}/complete': {
    patch: {
      tags: ['Audits'],
      summary: 'Complete Audit Cycle',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api/notifications': {
    get: {
      tags: ['Notifications'],
      summary: 'Get notifications list',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api/notifications/{id}/read': {
    patch: {
      tags: ['Notifications'],
      summary: 'Mark Notification as Read',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api/notifications/read-all': {
    patch: {
      tags: ['Notifications'],
      summary: 'Mark all notifications as read',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api/notifications/{id}': {
    delete: {
      tags: ['Notifications'],
      summary: 'Delete Notification',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api/activity-logs': {
    get: {
      tags: ['Activity Logs'],
      summary: 'Get Activity Log history',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api/dashboard': {
    get: {
      tags: ['Reports & Dashboard'],
      summary: 'Get Dashboard Summary metrics',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api/reports/assets': {
    get: {
      tags: ['Reports & Dashboard'],
      summary: 'Get Asset report stats',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api/reports/dashboard/export/excel': {
    get: {
      tags: ['Reports & Dashboard'],
      summary: 'Export Dashboard statistics as Excel File',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Excel spreadsheet binary stream' } }
    }
  },
  '/api/reports/dashboard/export/pdf': {
    get: {
      tags: ['Reports & Dashboard'],
      summary: 'Export Dashboard statistics as PDF File',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'PDF document binary stream' } }
    }
  }
};

// Add standard headers/metadata paths dynamically for other Excel & PDF reports
const exportPaths = ['assets', 'allocations', 'transfers', 'maintenance', 'audits'];
exportPaths.forEach(p => {
  swaggerSpec.paths[`/api/reports/${p}/export/excel`] = {
    get: {
      tags: ['Reports & Dashboard'],
      summary: `Export ${p} report as Excel File`,
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Excel spreadsheet binary stream' } }
    }
  };
  swaggerSpec.paths[`/api/reports/${p}/export/pdf`] = {
    get: {
      tags: ['Reports & Dashboard'],
      summary: `Export ${p} report as PDF File`,
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'PDF document binary stream' } }
    }
  };
});

module.exports = {
  swaggerUi,
  swaggerSpec
};
