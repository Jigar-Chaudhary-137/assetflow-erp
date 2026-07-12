# Types: API Response

## Purpose
Defines the standard JSON response envelope used by all AssetFlow REST API endpoints. Every response — success, error, validation failure, or paginated list — must conform to these shapes. This ensures the frontend can process any API response with a single, consistent handler.

---

## Success Response

Used when an operation succeeds and returns data.

### Shape
```json
{
  "success": true,
  "message": "Human-readable success message",
  "data": {}
}
```

### Fields
| Field | Type | Always Present | Description |
| :--- | :--- | :---: | :--- |
| `success` | `boolean` | Yes | Always `true` for successful responses |
| `message` | `string` | Yes | Short, human-readable description of the result |
| `data` | `object \| array \| null` | Yes | The actual response payload (object, array, or null) |

### Example — Single Resource
```json
{
  "success": true,
  "message": "Asset retrieved successfully",
  "data": {
    "_id": "64b0f3e8c1e2f7b8a5d4e301",
    "assetTag": "AST-LAP-0001",
    "name": "Developer Macbook Pro",
    "status": "AVAILABLE"
  }
}
```

### Example — Created Resource
```json
{
  "success": true,
  "message": "Allocation created successfully",
  "data": {
    "_id": "64b0f3e8c1e2f7b8a5d4e004",
    "assetId": "64b0f3e8c1e2f7b8a5d4e301",
    "employeeId": "64b0f3e8c1e2f7b8a5d4e104",
    "status": "ACTIVE"
  }
}
```

---

## Error Response

Used when an operation fails for any reason (auth failure, not found, server error).

### Shape
```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Optional error code or technical detail"
}
```

### Fields
| Field | Type | Always Present | Description |
| :--- | :--- | :---: | :--- |
| `success` | `boolean` | Yes | Always `false` for error responses |
| `message` | `string` | Yes | User-facing error description |
| `error` | `string \| null` | No | Technical detail or error code (omit in production for security) |

### HTTP Status Codes

| Status | Meaning |
| :--- | :--- |
| `200 OK` | Successful GET or PATCH |
| `201 Created` | Successful POST (resource created) |
| `204 No Content` | Successful DELETE |
| `400 Bad Request` | Malformed request or validation failure |
| `401 Unauthorized` | Missing or invalid JWT token |
| `403 Forbidden` | Authenticated but insufficient permissions |
| `404 Not Found` | Resource does not exist |
| `409 Conflict` | Business rule violation (e.g., double allocation) |
| `500 Internal Server Error` | Unexpected server-side failure |

### Example — Not Found
```json
{
  "success": false,
  "message": "Asset not found",
  "error": "ASSET_NOT_FOUND"
}
```

### Example — Forbidden
```json
{
  "success": false,
  "message": "Forbidden: insufficient permissions",
  "error": "FORBIDDEN"
}
```

---

## Validation Error Response

Used specifically for field-level validation failures (HTTP `400`).

### Shape
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email address" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```

### Fields
| Field | Type | Description |
| :--- | :--- | :--- |
| `success` | `boolean` | Always `false` |
| `message` | `string` | Top-level error summary |
| `errors` | `array` | Array of per-field error objects |
| `errors[].field` | `string` | The field that failed validation |
| `errors[].message` | `string` | Human-readable explanation |

---

## Backend Implementation

```js
// utils/ApiResponse.js
class ApiResponse {
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({ success: true, message, data });
  }

  static error(res, message = 'An error occurred', statusCode = 500, error = null) {
    return res.status(statusCode).json({ success: false, message, error });
  }

  static validationError(res, errors) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
}

module.exports = ApiResponse;

// Usage in a controller:
return ApiResponse.success(res, asset, 'Asset retrieved successfully');
return ApiResponse.error(res, 'Asset not found', 404, 'ASSET_NOT_FOUND');
```

---

## Frontend Usage (Axios Interceptor)

```js
// services/axios.js
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
```
