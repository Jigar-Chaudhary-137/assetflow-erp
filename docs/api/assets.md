# API: Assets

## 1. List All Assets

* **Endpoint**: `/api/assets`
* **Method**: `GET`
* **Authentication**: Required (Any authenticated user)
  * **Role Access Scope**:
    * `ADMIN` / `ASSET_MANAGER`: Retrieve all assets in the system.
    * `DEPARTMENT_HEAD`: Retrieve assets assigned to their department.
    * `EMPLOYEE`: Retrieve assets allocated to them.

### Request
* **Query Parameters (Optional)**:
  * `page`: Integer (default `1`)
  * `limit`: Integer (default `10`)
  * `status`: Filter by status (`AVAILABLE`, `ALLOCATED`, `UNDER_MAINTENANCE`, etc.)
  * `categoryId`: Filter by category ID
  * `departmentId`: Filter by department ID
  * `search`: Text search matches `name`, `assetTag`, or `serialNumber`

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Assets retrieved successfully",
    "data": {
      "docs": [
        {
          "_id": "64b0f3e8c1e2f7b8a5d4e301",
          "assetTag": "AST-LAP-0001",
          "serialNumber": "MBP2026X901",
          "name": "Developer Macbook Pro",
          "categoryId": "64b0f3e8c1e2f7b8a5d4e201",
          "condition": "NEW",
          "location": {
            "building": "HQ West",
            "floor": 3,
            "room": "Room 304"
          },
          "departmentId": "64b0f3e8c1e2f7b8a5d4e001",
          "status": "AVAILABLE",
          "bookable": false,
          "specs": {
            "processor": "Apple M2 Pro",
            "ramSize": 32,
            "storageSize": 512
          },
          "createdAt": "2026-06-02T09:00:00.000Z",
          "updatedAt": "2026-06-02T09:00:00.000Z"
        }
      ],
      "totalDocs": 1,
      "limit": 10,
      "page": 1,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
  ```

### Validation
* Query parameters `page` and `limit` must be positive integers if provided.

### Status Codes
* `200 OK`: Assets retrieved successfully.
* `401 Unauthorized`: Token is missing or invalid.

---

## 2. Get Single Asset

* **Endpoint**: `/api/assets/:id`
* **Method**: `GET`
* **Authentication**: Required (Any authenticated user)

### Request
* **Body**: None

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Asset retrieved successfully",
    "data": {
      "_id": "64b0f3e8c1e2f7b8a5d4e301",
      "assetTag": "AST-LAP-0001",
      "serialNumber": "MBP2026X901",
      "name": "Developer Macbook Pro",
      "categoryId": "64b0f3e8c1e2f7b8a5d4e201",
      "condition": "NEW",
      "location": {
        "building": "HQ West",
        "floor": 3,
        "room": "Room 304"
      },
      "departmentId": "64b0f3e8c1e2f7b8a5d4e001",
      "status": "AVAILABLE",
      "bookable": false,
      "specs": {
        "processor": "Apple M2 Pro",
        "ramSize": 32,
        "storageSize": 512
      },
      "purchaseInfo": {
        "purchaseDate": "2026-06-01T00:00:00.000Z",
        "purchaseCost": 2499.00,
        "vendor": "Apple Inc.",
        "warrantyExpiration": "2027-06-01T00:00:00.000Z"
      },
      "createdAt": "2026-06-02T09:00:00.000Z",
      "updatedAt": "2026-06-02T09:00:00.000Z"
    }
  }
  ```

### Validation
* Requires valid MongoDB `id` in the URL.

### Status Codes
* `200 OK`: Asset retrieved.
* `401 Unauthorized`: Token is missing or invalid.
* `404 Not Found`: Asset not found.

---

## 3. Register Asset

* **Endpoint**: `/api/assets`
* **Method**: `POST`
* **Authentication**: Required (`ADMIN` or `ASSET_MANAGER`)

### Request
* **Body**:
  ```json
  {
    "assetTag": "AST-LAP-0002",
    "serialNumber": "MBP2026X902",
    "name": "Designer Macbook Pro",
    "categoryId": "64b0f3e8c1e2f7b8a5d4e201",
    "condition": "NEW",
    "location": {
      "building": "HQ West",
      "floor": 3,
      "room": "Room 305"
    },
    "departmentId": "64b0f3e8c1e2f7b8a5d4e001",
    "bookable": false,
    "specs": {
      "processor": "Apple M2 Max",
      "ramSize": 64,
      "storageSize": 1024
    },
    "purchaseInfo": {
      "purchaseDate": "2026-06-15T00:00:00.000Z",
      "purchaseCost": 3499.00,
      "vendor": "Apple Inc.",
      "warrantyExpiration": "2027-06-15T00:00:00.000Z"
    }
  }
  ```

### Response
* **Success (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Asset registered successfully",
    "data": {
      "_id": "64b0f3e8c1e2f7b8a5d4e302",
      "assetTag": "AST-LAP-0002",
      "serialNumber": "MBP2026X902",
      "name": "Designer Macbook Pro",
      "categoryId": "64b0f3e8c1e2f7b8a5d4e201",
      "condition": "NEW",
      "location": {
        "building": "HQ West",
        "floor": 3,
        "room": "Room 305"
      },
      "status": "AVAILABLE",
      "bookable": false,
      "specs": {
        "processor": "Apple M2 Max",
        "ramSize": 64,
        "storageSize": 1024
      },
      "createdAt": "2026-07-12T04:42:00.000Z",
      "updatedAt": "2026-07-12T04:42:00.000Z"
    }
  }
  ```

### Validation
| Field | Type | Rules |
| :--- | :--- | :--- |
| `assetTag` | String | Required, unique, pattern: `AST-[A-Z]+-\d{4}` |
| `serialNumber` | String | Required, unique, 3-100 characters, trimmed |
| `name` | String | Required, 2-100 characters, trimmed |
| `categoryId` | ObjectId | Required, must reference a valid Category ID |
| `condition` | String | Required, enum: `NEW`, `GOOD`, `FAIR`, `POOR`, `DAMAGED` |
| `location.building` | String | Required, trimmed |
| `location.room` | String | Required, trimmed |
| `location.floor` | Number | Optional, integer |
| `specs` | Object | Must match custom fields of parent category |
| `purchaseInfo.purchaseCost` | Number | Optional, non-negative number |
| `purchaseInfo.warrantyExpiration`| Date | Optional, must be future or present date |
| `bookable` | Boolean | Required (default `false`) |
| `departmentId` | ObjectId | Optional, references a valid Department ID |

### Status Codes
* `201 Created`: Asset registered.
* `400 Bad Request`: Validation failed (e.g., incorrect format or missing required specs).
* `401 Unauthorized`: Token is missing or invalid.
* `403 Forbidden`: Insufficient permissions (not ADMIN or ASSET_MANAGER).
* `409 Conflict`: Asset Tag or Serial Number already exists.

---

## 4. Update Asset

* **Endpoint**: `/api/assets/:id`
* **Method**: `PUT`
* **Authentication**: Required (`ADMIN` or `ASSET_MANAGER`)

### Request
* **Body**: Same payload shape as creation.

### Response
* **Success (200 OK)**: Success envelope containing the updated asset.

### Validation
* Same validation rules as registration.

### Status Codes
* `200 OK`: Asset updated successfully.
* `400 Bad Request`: Validation failure.
* `401 Unauthorized`: Token is missing or invalid.
* `403 Forbidden`: Insufficient permissions.
* `404 Not Found`: Asset not found.
* `409 Conflict`: Serial number taken by another asset.

---

## 5. Delete Asset

* **Endpoint**: `/api/assets/:id`
* **Method**: `DELETE`
* **Authentication**: Required (`ADMIN` only)

### Request
* **Body**: None

### Response
* **Success (204 No Content)**: (Empty response body)

### Status Codes
* `204 No Content`: Asset record removed.
* `401 Unauthorized`: Token is missing or invalid.
* `403 Forbidden`: Insufficient permissions.
* `404 Not Found`: Asset not found.

---

## 6. Get Asset History Log

* **Endpoint**: `/api/assets/:id/history`
* **Method**: `GET`
* **Authentication**: Required (`ADMIN` or `ASSET_MANAGER`)

### Request
* **Body**: None

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Asset history retrieved successfully",
    "data": [
      {
        "date": "2026-06-02T09:00:00.000Z",
        "action": "REGISTERED",
        "performedById": "64b0f3e8c1e2f7b8a5d4e101",
        "details": "Asset registered into system inventory."
      }
    ]
  }
  ```

### Status Codes
* `200 OK`: History retrieved successfully.
* `401 Unauthorized`: Token is missing or invalid.
* `403 Forbidden`: Insufficient permissions.
* `404 Not Found`: Asset not found.
