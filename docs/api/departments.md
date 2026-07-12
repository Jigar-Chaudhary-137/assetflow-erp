# API: Departments

## 1. List All Departments

* **Endpoint**: `/api/departments`
* **Method**: `GET`
* **Authentication**: Required (Any authenticated user)

### Request
* **Body**: None

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Departments retrieved successfully",
    "data": [
      {
        "_id": "64b0f3e8c1e2f7b8a5d4e001",
        "name": "Engineering",
        "code": "ENG",
        "managerId": "64b0f3e8c1e2f7b8a5d4e103",
        "parentDepartmentId": null,
        "status": "ACTIVE",
        "createdAt": "2026-07-12T04:00:00.000Z",
        "updatedAt": "2026-07-12T04:00:00.000Z"
      }
    ]
  }
  ```

### Validation
* None

### Status Codes
* `200 OK`: Departments successfully listed.
* `401 Unauthorized`: Token is missing or invalid.

---

## 2. Get Single Department

* **Endpoint**: `/api/departments/:id`
* **Method**: `GET`
* **Authentication**: Required (Any authenticated user)

### Request
* **Body**: None

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Department retrieved successfully",
    "data": {
      "_id": "64b0f3e8c1e2f7b8a5d4e001",
      "name": "Engineering",
      "code": "ENG",
      "managerId": "64b0f3e8c1e2f7b8a5d4e103",
      "parentDepartmentId": null,
      "status": "ACTIVE",
      "createdAt": "2026-07-12T04:00:00.000Z",
      "updatedAt": "2026-07-12T04:00:00.000Z"
    }
  }
  ```

### Validation
* Requires valid MongoDB `id` in the URL parameter.

### Status Codes
* `200 OK`: Department details retrieved.
* `401 Unauthorized`: Token is missing or invalid.
* `404 Not Found`: Department not found.

---

## 3. Create Department

* **Endpoint**: `/api/departments`
* **Method**: `POST`
* **Authentication**: Required (`ADMIN` only)

### Request
* **Body**:
  ```json
  {
    "name": "Marketing",
    "code": "MKT",
    "managerId": "64b0f3e8c1e2f7b8a5d4e110",
    "parentDepartmentId": null
  }
  ```

### Response
* **Success (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Department created successfully",
    "data": {
      "_id": "64b0f3e8c1e2f7b8a5d4e002",
      "name": "Marketing",
      "code": "MKT",
      "managerId": "64b0f3e8c1e2f7b8a5d4e110",
      "parentDepartmentId": null,
      "status": "ACTIVE",
      "createdAt": "2026-07-12T04:42:00.000Z",
      "updatedAt": "2026-07-12T04:42:00.000Z"
    }
  }
  ```

### Validation
| Field | Type | Rules |
| :--- | :--- | :--- |
| `name` | String | Required, unique, 2-100 characters, trimmed |
| `code` | String | Required, unique, uppercase, alphanumeric, 2-10 characters |
| `managerId` | ObjectId | Optional, must hold role `DEPARTMENT_HEAD` or `ADMIN` |
| `parentDepartmentId` | ObjectId | Optional, valid department ID |

### Status Codes
* `201 Created`: Department created.
* `400 Bad Request`: Validation failure.
* `401 Unauthorized`: Token is missing or invalid.
* `403 Forbidden`: Insufficient permissions (not ADMIN).
* `409 Conflict`: Name or Code already exists.

---

## 4. Update Department

* **Endpoint**: `/api/departments/:id`
* **Method**: `PUT`
* **Authentication**: Required (`ADMIN` only)

### Request
* **Body**:
  ```json
  {
    "name": "Global Engineering",
    "code": "ENG",
    "managerId": "64b0f3e8c1e2f7b8a5d4e103",
    "parentDepartmentId": null,
    "status": "ACTIVE"
  }
  ```

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Department updated successfully",
    "data": {
      "_id": "64b0f3e8c1e2f7b8a5d4e001",
      "name": "Global Engineering",
      "code": "ENG",
      "managerId": "64b0f3e8c1e2f7b8a5d4e103",
      "parentDepartmentId": null,
      "status": "ACTIVE",
      "createdAt": "2026-07-12T04:00:00.000Z",
      "updatedAt": "2026-07-12T04:42:00.000Z"
    }
  }
  ```

### Validation
| Field | Type | Rules |
| :--- | :--- | :--- |
| `name` | String | Required, unique, 2-100 characters, trimmed |
| `code` | String | Required, unique, uppercase, alphanumeric, 2-10 characters |
| `managerId` | ObjectId | Optional, must hold role `DEPARTMENT_HEAD` or `ADMIN` |
| `parentDepartmentId` | ObjectId | Optional, must not equal own ID (no circular references) |
| `status` | String | Optional, enum: `ACTIVE`, `INACTIVE` |

### Status Codes
* `200 OK`: Department updated.
* `400 Bad Request`: Validation failure, or circular reference validation failed.
* `401 Unauthorized`: Token is missing or invalid.
* `403 Forbidden`: Insufficient permissions (not ADMIN).
* `404 Not Found`: Department not found.
* `409 Conflict`: Name or Code already taken by another department.

---

## 5. Delete Department

* **Endpoint**: `/api/departments/:id`
* **Method**: `DELETE`
* **Authentication**: Required (`ADMIN` only)

### Request
* **Body**: None

### Response
* **Success (204 No Content)**: (Empty response body)

### Validation
* Requires valid MongoDB `id` in URL. If department has active users, deletion must be blocked or throw an error.

### Status Codes
* `204 No Content`: Department successfully deleted.
* `401 Unauthorized`: Token is missing or invalid.
* `403 Forbidden`: Insufficient permissions (not ADMIN).
* `404 Not Found`: Department not found.
* `400 Bad Request`: Cannot delete department with active users.
