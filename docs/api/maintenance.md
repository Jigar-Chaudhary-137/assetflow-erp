# API: Maintenance

## 1. List All Maintenance Requests

* **Endpoint**: `/api/maintenance`
* **Method**: `GET`
* **Authentication**: Required (`ADMIN` or `ASSET_MANAGER` only)

### Request
* **Query Parameters (Optional)**:
  * `page`: Integer (default `1`)
  * `limit`: Integer (default `10`)
  * `status`: Filter by status (`PENDING`, `APPROVED`, `REJECTED`, `TECHNICIAN_ASSIGNED`, `IN_PROGRESS`, `RESOLVED`)
  * `priority`: Filter by priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
  * `assetId`: Filter by asset ID

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Maintenance requests retrieved",
    "data": {
      "docs": [
        {
          "_id": "64b0f3e8c1e2f7b8a5d4e501",
          "assetId": "64b0f3e8c1e2f7b8a5d4e301",
          "reportedById": "64b0f3e8c1e2f7b8a5d4e104",
          "reportedDate": "2026-07-12T04:20:00.000Z",
          "issueDescription": "Macbook screen flickers and shows green lines when hot.",
          "priority": "HIGH",
          "status": "APPROVED",
          "approvedById": "64b0f3e8c1e2f7b8a5d4e103",
          "approvalDate": "2026-07-12T04:30:00.000Z",
          "technicianId": "64b0f3e8c1e2f7b8a5d4e109",
          "maintenanceType": "CORRECTIVE",
          "scheduledDate": "2026-07-13T09:00:00.000Z",
          "completionDate": null,
          "resolutionDetails": null,
          "cost": 0,
          "createdAt": "2026-07-12T04:20:00.000Z",
          "updatedAt": "2026-07-12T04:30:00.000Z"
        }
      ],
      "totalDocs": 1,
      "limit": 10,
      "page": 1,
      "totalPages": 1
    }
  }
  ```

### Status Codes
* `200 OK`: Maintenance requests retrieved.
* `401 Unauthorized`: Token is missing.
* `403 Forbidden`: Insufficient permissions.

---

## 2. Get Own Submitted Requests

* **Endpoint**: `/api/maintenance/my`
* **Method**: `GET`
* **Authentication**: Required (Any authenticated user)

### Request
* **Body**: None

### Response
* **Success (200 OK)**: Returns standard paginated list of maintenance requests reported by the logged-in user (`reportedById`).

### Status Codes
* `200 OK`: Requests retrieved.
* `401 Unauthorized`: Token is missing.

---

## 3. Get Single Request

* **Endpoint**: `/api/maintenance/:id`
* **Method**: `GET`
* **Authentication**: Required (Any authenticated user)

### Request
* **Body**: None

### Response
* **Success (200 OK)**: Returns detailed maintenance record.

### Status Codes
* `200 OK`: Request retrieved.
* `401 Unauthorized`: Token missing.
* `404 Not Found`: Request not found.

---

## 4. Raise Maintenance Request

* **Endpoint**: `/api/maintenance`
* **Method**: `POST`
* **Authentication**: Required (Any authenticated user)

### Request
* **Body**:
  ```json
  {
    "assetId": "64b0f3e8c1e2f7b8a5d4e301",
    "issueDescription": "Macbook screen flickers and shows green lines when hot.",
    "priority": "HIGH",
    "maintenanceType": "CORRECTIVE"
  }
  ```

### Response
* **Success (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Maintenance request raised",
    "data": {
      "_id": "64b0f3e8c1e2f7b8a5d4e501",
      "assetId": "64b0f3e8c1e2f7b8a5d4e301",
      "reportedById": "64b0f3e8c1e2f7b8a5d4e104",
      "reportedDate": "2026-07-12T04:20:00.000Z",
      "issueDescription": "Macbook screen flickers and shows green lines when hot.",
      "priority": "HIGH",
      "status": "PENDING",
      "maintenanceType": "CORRECTIVE",
      "cost": 0,
      "createdAt": "2026-07-12T04:20:00.000Z"
    }
  }
  ```

### Validation
| Field | Type | Rules |
| :--- | :--- | :--- |
| `assetId` | ObjectId | Required. References valid asset. |
| `issueDescription`| String | Required. 10–500 characters, trimmed. |
| `priority` | String | Required. Enum: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`. |
| `maintenanceType` | String | Optional. Enum: `PREVENTIVE`, `CORRECTIVE` (default `CORRECTIVE`). |

### Status Codes
* `201 Created`: Request registered.
* `400 Bad Request`: Validation failure.
* `401 Unauthorized`: Token missing.

---

## 5. Approve Request

* **Endpoint**: `/api/maintenance/:id/approve`
* **Method**: `PATCH`
* **Authentication**: Required (`ADMIN`, `ASSET_MANAGER`, or `DEPARTMENT_HEAD`)

### Request
* **Body**: None

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Request approved",
    "data": {
      "_id": "64b0f3e8c1e2f7b8a5d4e501",
      "status": "APPROVED",
      "approvedById": "64b0f3e8c1e2f7b8a5d4e103",
      "approvalDate": "2026-07-12T04:30:00.000Z"
    }
  }
  ```

* **Asset Status Cascade**: Transitioning to `APPROVED` automatically changes the referenced asset's status to `UNDER_MAINTENANCE` and locks the asset from other assignments.

### Status Codes
* `200 OK`: Request approved, asset locked.
* `401 Unauthorized`: Token missing.
* `403 Forbidden`: Insufficient permissions.
* `404 Not Found`: Request not found.

---

## 6. Reject Request

* **Endpoint**: `/api/maintenance/:id/reject`
* **Method**: `PATCH`
* **Authentication**: Required (`ADMIN`, `ASSET_MANAGER`, or `DEPARTMENT_HEAD`)

### Request
* **Body**: None

### Response
* **Success (200 OK)**: Updates request status to `REJECTED`. Asset status remains unchanged.

### Status Codes
* `200 OK`: Request rejected.
* `401 Unauthorized`: Token missing.
* `403 Forbidden`: Insufficient permissions.

---

## 7. Assign Technician

* **Endpoint**: `/api/maintenance/:id/assign`
* **Method**: `PATCH`
* **Authentication**: Required (`ADMIN` or `ASSET_MANAGER`)

### Request
* **Body**:
  ```json
  {
    "technicianId": "64b0f3e8c1e2f7b8a5d4e109",
    "scheduledDate": "2026-07-13T09:00:00.000Z"
  }
  ```

### Response
* **Success (200 OK)**: Updates status to `TECHNICIAN_ASSIGNED`, populates `technicianId` and `scheduledDate`.

### Validation
| Field | Type | Rules |
| :--- | :--- | :--- |
| `technicianId` | ObjectId | Required. Valid User ID. |
| `scheduledDate` | Date | Optional. |

* **Workflow Restriction**: Request must have status `APPROVED` before a technician can be assigned.

### Status Codes
* `200 OK`: Technician assigned successfully.
* `400 Bad Request`: Validation failure or request not approved yet.
* `401 Unauthorized`: Token missing.

---

## 8. Mark Resolved

* **Endpoint**: `/api/maintenance/:id/resolve`
* **Method**: `PATCH`
* **Authentication**: Required (`ADMIN` or `ASSET_MANAGER`)

### Request
* **Body**:
  ```json
  {
    "resolutionDetails": "Replaced the LCD panel and cable.",
    "cost": 150.00,
    "completionDate": "2026-07-13T11:00:00.000Z"
  }
  ```

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Maintenance ticket resolved",
    "data": {
      "_id": "64b0f3e8c1e2f7b8a5d4e501",
      "status": "RESOLVED",
      "resolutionDetails": "Replaced the LCD panel and cable.",
      "cost": 150.00,
      "completionDate": "2026-07-13T11:00:00.000Z"
    }
  }
  ```

### Validation
| Field | Type | Rules |
| :--- | :--- | :--- |
| `resolutionDetails`| String | Required. Details of the fix. |
| `cost` | Number | Required. Must be `>= 0`. |
| `completionDate` | Date | Optional. Defaults to `Date.now` if not provided. |

* **Asset Status Cascade**: Reverts the asset status back to `AVAILABLE` (unless manually flagged for retirement).

### Status Codes
* `200 OK`: Request resolved, asset released.
* `400 Bad Request`: Validation failure.
* `401 Unauthorized`: Token missing.
