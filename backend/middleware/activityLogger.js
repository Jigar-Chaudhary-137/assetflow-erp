const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

const activityLogger = async (req, res, next) => {
  // Capture request metadata
  const httpMethod = req.method;
  const endpoint = req.originalUrl;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || null;

  // We wait until the response finishes so we can confirm success and get authenticated req.user if populated
  res.on('finish', async () => {
    // Only log write actions, login/logout, and successful queries if desired
    // The requirements specify: Login, Logout, User Update, Category CRUD, Department CRUD, Asset CRUD, Allocation, Transfer, Maintenance, Audit.
    // Usually, read actions (GET) on lists are logged as READ, but writes are key. Let's log all of them except default health checks.
    if (endpoint.includes('/api/health') || httpMethod === 'OPTIONS') {
      return;
    }

    // Determine Module
    let moduleName = 'UNKNOWN';
    if (endpoint.includes('/api/auth')) moduleName = 'AUTH';
    else if (endpoint.includes('/api/users')) moduleName = 'USER';
    else if (endpoint.includes('/api/categories')) moduleName = 'CATEGORY';
    else if (endpoint.includes('/api/departments')) moduleName = 'DEPARTMENT';
    else if (endpoint.includes('/api/assets')) moduleName = 'ASSET';
    else if (endpoint.includes('/api/allocations')) moduleName = 'ALLOCATION';
    else if (endpoint.includes('/api/transfers')) moduleName = 'TRANSFER';
    else if (endpoint.includes('/api/maintenance')) moduleName = 'MAINTENANCE';
    else if (endpoint.includes('/api/audits')) moduleName = 'AUDIT';

    // Determine Action
    let action = 'READ';
    if (httpMethod === 'POST') {
      if (endpoint.includes('/login')) action = 'LOGIN';
      else if (endpoint.includes('/register')) action = 'REGISTER';
      else if (endpoint.includes('/logout')) action = 'LOGOUT';
      else if (endpoint.endsWith('/return')) action = 'RETURN_ASSET';
      else action = 'CREATE';
    } else if (httpMethod === 'PUT') {
      action = 'UPDATE';
    } else if (httpMethod === 'DELETE') {
      action = 'DELETE';
    } else if (httpMethod === 'PATCH') {
      if (endpoint.endsWith('/status')) action = 'STATUS_PATCH';
      else if (endpoint.endsWith('/approve')) action = 'APPROVE';
      else if (endpoint.endsWith('/reject')) action = 'REJECT';
      else if (endpoint.endsWith('/start')) action = 'START';
      else if (endpoint.endsWith('/complete')) action = 'COMPLETE';
      else if (endpoint.endsWith('/cancel')) action = 'CANCEL';
      else if (endpoint.endsWith('/verify')) action = 'VERIFY';
      else action = 'UPDATE';
    }

    // Capture Entity ID if present in the endpoint URL (like 24-character hexadecimal ObjectId)
    const objectIdRegex = /\/([0-9a-fA-F]{24})/;
    const match = endpoint.match(objectIdRegex);
    const entityId = match ? match[1] : null;

    // Get User ID and UserName
    let userId = null;
    let userName = null;

    if (req.user) {
      userId = req.user._id;
      userName = req.user.username;
    } else if (action === 'LOGIN' && res.statusCode === 200 && (req.body.username || req.body.email)) {
      // For successful login, lookup user by username or email to record the user who logged in
      try {
        const identifier = req.body.username || req.body.email;
        const loggedUser = await User.findOne({
          $or: [
            { username: identifier },
            { email: identifier.toLowerCase() }
          ]
        });
        if (loggedUser) {
          userId = loggedUser._id;
          userName = loggedUser.username;
        }
      } catch (err) {
        // Suppress lookup errors to avoid crashing response
      }
    }

    // Only log if response was successful (status code 2xx)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        await ActivityLog.create({
          userId,
          userName,
          action,
          module: moduleName,
          entityId,
          httpMethod,
          endpoint,
          ipAddress,
          userAgent
        });
      } catch (err) {
        // Suppress errors to prevent affecting API responses
      }
    }
  });

  next();
};

module.exports = activityLogger;
