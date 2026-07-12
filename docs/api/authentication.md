# API: Authentication

## 1. Register User

* **Endpoint**: `/api/auth/register`
* **Method**: `POST`
* **Authentication**: Required (`ADMIN` only)

### Request
* **Body**:
  ```json
  {
    "username": "johndoe",
    "email": "john.doe@assetflow.com",
    "password": "Password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "EMPLOYEE",
    "departmentId": "64b0f3e8c1e2f7b8a5d4e001",
    "contactNumber": "+15550101"
  }
  ```

### Response
* **Success (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "_id": "64b0f3e8c1e2f7b8a5d4e105",
      "username": "johndoe",
      "email": "john.doe@assetflow.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "EMPLOYEE",
      "departmentId": "64b0f3e8c1e2f7b8a5d4e001",
      "status": "ACTIVE",
      "contactNumber": "+15550101",
      "createdAt": "2026-07-12T04:40:00.000Z",
      "updatedAt": "2026-07-12T04:40:00.000Z"
    }
  }
  ```

### Validation
| Field | Type | Rules |
| :--- | :--- | :--- |
| `username` | String | Required, unique, alphanumeric (underscores allowed), 3-30 chars |
| `email` | String | Required, unique, lowercase, RFC 5322 pattern |
| `password` | String | Required, 8-72 characters |
| `firstName` | String | Required, 1-50 characters, trimmed |
| `lastName` | String | Required, 1-50 characters, trimmed |
| `role` | String | Required, enum: `ADMIN`, `ASSET_MANAGER`, `DEPARTMENT_HEAD`, `EMPLOYEE` |
| `departmentId` | ObjectId | Required for roles `EMPLOYEE` and `DEPARTMENT_HEAD` |
| `contactNumber` | String | Optional, phone pattern `^\+?[0-9\s\-]{7,15}$` |

### Status Codes
* `201 Created`: User successfully registered.
* `400 Bad Request`: Validation failure (e.g. invalid email format, short password).
* `401 Unauthorized`: Token is missing or invalid.
* `403 Forbidden`: Authenticated user does not have `ADMIN` role.
* `409 Conflict`: Username or Email already exists.

---

## 2. Login

* **Endpoint**: `/api/auth/login`
* **Method**: `POST`
* **Authentication**: Public

### Request
* **Body**:
  ```json
  {
    "email": "david.miller@assetflow.com",
    "password": "Password123"
  }
  ```
  *(Note: Can also use `username` instead of `email` in login payload depending on implementation).*

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "_id": "64b0f3e8c1e2f7b8a5d4e104",
        "username": "david_emp",
        "email": "david.miller@assetflow.com",
        "firstName": "David",
        "lastName": "Miller",
        "role": "EMPLOYEE",
        "departmentId": "64b0f3e8c1e2f7b8a5d4e001",
        "status": "ACTIVE"
      }
    }
  }
  ```

### Validation
| Field | Type | Rules |
| :--- | :--- | :--- |
| `email` | String | Required if `username` not provided |
| `username` | String | Required if `email` not provided |
| `password` | String | Required |

### Status Codes
* `200 OK`: Authentication successful, token returned.
* `400 Bad Request`: Missing login fields.
* `401 Unauthorized`: Invalid credentials, or user status is `INACTIVE` or `SUSPENDED`.

---

## 3. Logout

* **Endpoint**: `/api/auth/logout`
* **Method**: `POST`
* **Authentication**: Required (Authenticated)

### Request
* **Body**: None

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logout successful",
    "data": null
  }
  ```

### Validation
* None

### Status Codes
* `200 OK`: Session successfully invalidated.
* `401 Unauthorized`: Token is missing or invalid.

---

## 4. Get Current User (Me)

* **Endpoint**: `/api/auth/me`
* **Method**: `GET`
* **Authentication**: Required (Authenticated)

### Request
* **Body**: None

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User profile retrieved successfully",
    "data": {
      "_id": "64b0f3e8c1e2f7b8a5d4e104",
      "username": "david_emp",
      "email": "david.miller@assetflow.com",
      "firstName": "David",
      "lastName": "Miller",
      "role": "EMPLOYEE",
      "departmentId": "64b0f3e8c1e2f7b8a5d4e001",
      "status": "ACTIVE",
      "contactNumber": "+15550103",
      "createdAt": "2026-07-12T04:00:00.000Z",
      "updatedAt": "2026-07-12T04:00:00.000Z"
    }
  }
  ```

### Validation
* None

### Status Codes
* `200 OK`: Profile successfully retrieved.
* `401 Unauthorized`: Token is missing or invalid.

---

## 5. Change Password

* **Endpoint**: `/api/auth/change-password`
* **Method**: `PUT`
* **Authentication**: Required (Authenticated)

### Request
* **Body**:
  ```json
  {
    "currentPassword": "OldPassword123",
    "newPassword": "NewPassword123"
  }
  ```

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Password updated successfully",
    "data": null
  }
  ```

### Validation
| Field | Type | Rules |
| :--- | :--- | :--- |
| `currentPassword` | String | Required |
| `newPassword` | String | Required, 8-72 characters |

### Status Codes
* `200 OK`: Password updated successfully.
* `400 Bad Request`: Validation failure on `newPassword` rules.
* `401 Unauthorized`: Invalid current password, or token is missing.
