# API: Allocations

## 1. List All Allocations

* **Endpoint**: `/api/allocations`
* **Method**: `GET`
* **Authentication**: Required (`ADMIN` or `ASSET_MANAGER` only)

### Request
* **Query Parameters (Optional)**:
  * `page`: Integer (default `1`)
  * `limit`: Integer (default `10`)
  * `status`: Filter by status (`ACTIVE`, `RETURNED`, `TRANSFERRED`)
  * `transferStatus`: Filter by transfer status (`NONE`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED`)
  * `employeeId`: Filter by employee ID

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Allocations retrieved successfully",
    "data": {
      "docs": [
        {
          "_id": "64b0f3e8c1e2f7b8a5d4e004",
          "assetId": "64b0f3e8c1e2f7b8a5d4e301",
          "employeeId": "64b0f3e8c1e2f7b8a5d4e104",
          "allocatedById": "64b0f3e8c1e2f7b8a5d4e103",
          "allocatedDate": "2026-07-12T04:10:00.000Z",
          "expectedReturnDate": "2027-07-12T00:00:00.000Z",
          "actualReturnDate": null,
          "status": "ACTIVE",
          "transferStatus": "NONE",
          "transferRequestedTo": null,
          "notes": "Standard developer setup",
          "createdAt": "2026-07-12T04:10:00.000Z",
          "updatedAt": "2026-07-12T04:10:00.000Z"
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

### Status Codes
* `200 OK`: Allocations retrieved.
* `401 Unauthorized`: Token is missing or invalid.
* `403 Forbidden`: Insufficient permissions.

---

## 2. Get Single Allocation

* **Endpoint**: `/api/allocations/:id`
* **Method**: `GET`
* **Authentication**: Required (`ADMIN`, `ASSET_MANAGER`, or `DEPARTMENT_HEAD` of the department owning the asset)

### Request
* **Body**: None

### Response
* **Success (200 OK)**: Success envelope containing single allocation details.

### Status Codes
* `200 OK`: Allocation retrieved.
* `401 Unauthorized`: Token is missing.
* `403 Forbidden`: Insufficient permissions to view.
* `404 Not Found`: Allocation not found.

---

## 3. Create Allocation

* **Endpoint**: `/api/allocations`
* **Method**: `POST`
* **Authentication**: Required (`ADMIN` or `ASSET_MANAGER`)

### Request
* **Body**:
  ```json
  {
    "assetId": "64b0f3e8c1e2f7b8a5d4e301",
    "employeeId": "64b0f3e8c1e2f7b8a5d4e104",
    "expectedReturnDate": "2027-07-12T00:00:00.000Z",
    "notes": "Standard developer setup"
  }
  ```

### Response
* **Success (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Allocation created successfully",
    "data": {
      "_id": "64b0f3e8c1e2f7b8a5d4e004",
      "assetId": "64b0f3e8c1e2f7b8a5d4e301",
      "employeeId": "64b0f3e8c1e2f7b8a5d4e104",
      "allocatedById": "64b0f3e8c1e2f7b8a5d4e103",
      "allocatedDate": "2026-07-12T04:10:00.000Z",
      "expectedReturnDate": "2027-07-12T00:00:00.000Z",
      "actualReturnDate": null,
      "status": "ACTIVE",
      "transferStatus": "NONE",
      "notes": "Standard developer setup",
      "createdAt": "2026-07-12T04:10:00.000Z"
    }
  }
  ```

### Validation
| Field | Type | Rules |
| :--- | :--- | :--- |
| `assetId` | ObjectId | Required. Must reference an asset with status `AVAILABLE` |
| `employeeId` | ObjectId | Required. Must reference an user with status `ACTIVE` |
| `expectedReturnDate`| Date | Optional. Must be in the future |
| `notes` | String | Optional |

* **Asset Status Cascade**: Creating an active allocation sets the referenced asset's status to `ALLOCATED`.

### Status Codes
* `201 Created`: Allocation registered successfully.
* `400 Bad Request`: Validation failure.
* `401 Unauthorized`: Token is missing or invalid.
* `403 Forbidden`: Insufficient permissions.
* `409 Conflict`: Asset is already allocated (violates "no double allocation" constraint).

---

## 4. Return Allocated Asset

* **Endpoint**: `/api/allocations/:id/return`
* **Method**: `PATCH`
* **Authentication**: Required (`ADMIN` or `ASSET_MANAGER`)

### Request
* **Body**: None

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Asset returned successfully",
    "data": {
      "_id": "64b0f3e8c1e2f7b8a5d4e004",
      "status": "RETURNED",
      "actualReturnDate": "2026-07-12T06:00:00.000Z"
    }
  }
  ```

* **Asset Status Cascade**: Updates the referenced asset status back to `AVAILABLE`.

### Status Codes
* `200 OK`: Allocation updated to `RETURNED`.
* `401 Unauthorized`: Token is missing.
* `403 Forbidden`: Insufficient permissions.
* `404 Not Found`: Allocation not found.

---

## 5. Request Allocation Transfer

* **Endpoint**: `/api/allocations/:id/transfer`
* **Method**: `POST`
* **Authentication**: Required (`EMPLOYEE` holding the asset, or `DEPARTMENT_HEAD`)

### Request
* **Body**:
  ```json
  {
    "transferRequestedTo": "64b0f3e8c1e2f7b8a5d4e108",
    "notes": "Handing over laptop for team transfer"
  }
  ```

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Transfer requested successfully",
    "data": {
      "_id": "64b0f3e8c1e2f7b8a5d4e004",
      "transferStatus": "PENDING_APPROVAL",
      "transferRequestedTo": "64b0f3e8c1e2f7b8a5d4e108"
    }
  }
  ```

### Validation
| Field | Type | Rules |
| :--- | :--- | :--- |
| `transferRequestedTo`| ObjectId | Required. Must reference an `ACTIVE` user |

* Note: `transferStatus` transitions from `NONE` to `PENDING_APPROVAL`.

### Status Codes
* `200 OK`: Transfer request successfully registered.
* `400 Bad Request`: Validation failure.
* `401 Unauthorized`: Token missing.
* `403 Forbidden`: User is not the current assignee/holder or department head.

---

## 6. Approve Allocation Transfer

* **Endpoint**: `/api/allocations/:id/transfer/approve`
* **Method**: `PATCH`
* **Authentication**: Required (`ADMIN`, `ASSET_MANAGER`, or `DEPARTMENT_HEAD` of the department)

### Request
* **Body**: None

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Transfer approved successfully",
    "data": {
      "previousAllocation": {
        "_id": "64b0f3e8c1e2f7b8a5d4e004",
        "status": "TRANSFERRED",
        "transferStatus": "APPROVED"
      },
      "newAllocation": {
        "_id": "64b0f3e8c1e2f7b8a5d4e015",
        "assetId": "64b0f3e8c1e2f7b8a5d4e301",
        "employeeId": "64b0f3e8c1e2f7b8a5d4e108",
        "status": "ACTIVE",
        "transferStatus": "NONE"
      }
    }
  }
  ```

* **Asset Status Cascade**: The asset status remains `ALLOCATED` but its owner is updated. The previous allocation becomes `TRANSFERRED`, and a new allocation is automatically created with status `ACTIVE`.

### Status Codes
* `200 OK`: Transfer approved, allocation shifted.
* `401 Unauthorized`: Token missing.
* `403 Forbidden`: Insufficient permissions.

---

## 7. Reject Allocation Transfer

* **Endpoint**: `/api/allocations/:id/transfer/reject`
* **Method**: `PATCH`
* **Authentication**: Required (`ADMIN`, `ASSET_MANAGER`, or `DEPARTMENT_HEAD`)

### Request
* **Body**: None

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Transfer request rejected",
    "data": {
      "_id": "64b0f3e8c1e2f7b8a5d4e004",
      "transferStatus": "NONE",
      "transferRequestedTo": null
    }
  }
  ```

* **Status Cascade**: `transferStatus` resets to `NONE` and `transferRequestedTo` is cleared. Allocation remains `ACTIVE`.

### Status Codes
* `200 OK`: Request rejected.
* `401 Unauthorized`: Token missing.
* `403 Forbidden`: Insufficient permissions.
