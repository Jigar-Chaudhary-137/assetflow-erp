# API: Audits

## 1. List All Audit Cycles

* **Endpoint**: `/api/audits`
* **Method**: `GET`
* **Authentication**: Required (`ADMIN` or `ASSET_MANAGER` only)

### Request
* **Query Parameters (Optional)**:
  * `page`: Integer (default `1`)
  * `limit`: Integer (default `10`)
  * `status`: Filter by status (`PLANNED`, `ACTIVE`, `COMPLETED`, `CLOSED`)

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Audit cycles retrieved",
    "data": {
      "docs": [
        {
          "_id": "64b0f3e8c1e2f7b8a5d4e601",
          "auditCycleName": "Q3 2026 Annual Asset Audit",
          "auditorId": "64b0f3e8c1e2f7b8a5d4e102",
          "status": "ACTIVE",
          "startDate": "2026-07-01T00:00:00.000Z",
          "endDate": null,
          "targetDepartmentId": "64b0f3e8c1e2f7b8a5d4e001",
          "targetCategoryId": null,
          "verifiedAssets": [],
          "missingAssets": [],
          "damagedAssets": [],
          "createdAt": "2026-07-01T00:00:00.000Z",
          "updatedAt": "2026-07-12T04:40:00.000Z"
        }
      ],
      "totalDocs": 1
    }
  }
  ```

### Status Codes
* `200 OK`: Audit cycles listed.
* `401 Unauthorized`: Token is missing.
* `403 Forbidden`: Insufficient permissions.

---

## 2. Get Single Audit Cycle

* **Endpoint**: `/api/audits/:id`
* **Method**: `GET`
* **Authentication**: Required (`ADMIN` or `ASSET_MANAGER` only)

### Request
* **Body**: None

### Response
* **Success (200 OK)**: Returns detailed audit cycle document including `verifiedAssets`, `missingAssets`, and `damagedAssets` arrays.

### Status Codes
* `200 OK`: Audit details retrieved.
* `401 Unauthorized`: Token missing.
* `403 Forbidden`: Insufficient permissions.
* `404 Not Found`: Audit cycle not found.

---

## 3. Create Audit Cycle

* **Endpoint**: `/api/audits`
* **Method**: `POST`
* **Authentication**: Required (`ADMIN` or `ASSET_MANAGER` only)

### Request
* **Body**:
  ```json
  {
    "auditCycleName": "Q3 2026 Laptop Audit",
    "auditorId": "64b0f3e8c1e2f7b8a5d4e102",
    "startDate": "2026-07-15T00:00:00.000Z",
    "targetDepartmentId": "64b0f3e8c1e2f7b8a5d4e001",
    "targetCategoryId": "64b0f3e8c1e2f7b8a5d4e201"
  }
  ```

### Response
* **Success (201 Created)**: Success envelope containing created audit with status `PLANNED`.

### Validation
| Field | Type | Rules |
| :--- | :--- | :--- |
| `auditCycleName` | String | Required. 3–100 characters, trimmed. |
| `auditorId` | ObjectId | Required. Must reference a user with role `ADMIN` or `ASSET_MANAGER`. |
| `startDate` | Date | Required. Valid date format. |
| `targetDepartmentId`| ObjectId | Optional. Focus scope on a single department. |
| `targetCategoryId` | ObjectId | Optional. Focus scope on a single category. |

### Status Codes
* `201 Created`: Audit cycle created.
* `400 Bad Request`: Validation failure.
* `401 Unauthorized`: Token missing.
* `403 Forbidden`: Insufficient permissions.

---

## 4. Start Audit Cycle

* **Endpoint**: `/api/audits/:id/start`
* **Method**: `PATCH`
* **Authentication**: Required (`ADMIN` or `ASSET_MANAGER` only)

### Request
* **Body**: None

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Audit cycle started",
    "data": {
      "_id": "64b0f3e8c1e2f7b8a5d4e601",
      "status": "ACTIVE"
    }
  }
  ```

### Status Codes
* `200 OK`: Status updated to `ACTIVE`.
* `401 Unauthorized`: Token missing.
* `403 Forbidden`: Insufficient permissions.

---

## 5. Verify Asset

* **Endpoint**: `/api/audits/:id/verify`
* **Method**: `PATCH`
* **Authentication**: Required (`ADMIN` or `ASSET_MANAGER` only)

### Request
* **Body**:
  ```json
  {
    "assetId": "64b0f3e8c1e2f7b8a5d4e301",
    "verifiedCondition": "GOOD",
    "verifiedLocation": {
      "building": "HQ West",
      "floor": 3,
      "room": "Room 304"
    },
    "notes": "Verified in person, in excellent shape."
  }
  ```

### Response
* **Success (200 OK)**: Returns audit document containing verified asset in `verifiedAssets` list.
* **Cascade Behavior**: If verified location or condition differs from active asset registry, those fields in the `assets` collection are updated automatically.

### Validation
| Field | Type | Rules |
| :--- | :--- | :--- |
| `assetId` | ObjectId | Required. References valid asset in target scope. |
| `verifiedCondition` | String | Required. Enum: `NEW`, `GOOD`, `FAIR`, `POOR`, `DAMAGED`. |
| `verifiedLocation` | Object | Required. Building and room properties. |

### Status Codes
* `200 OK`: Asset verified and logged.
* `400 Bad Request`: Validation failure, or audit cycle is not in `ACTIVE` status.
* `401 Unauthorized`: Token missing.

---

## 6. Report Asset Missing

* **Endpoint**: `/api/audits/:id/missing`
* **Method**: `PATCH`
* **Authentication**: Required (`ADMIN` or `ASSET_MANAGER` only)

### Request
* **Body**:
  ```json
  {
    "assetId": "64b0f3e8c1e2f7b8a5d4e301",
    "notes": "Not present in office, coworker says it was taken home."
  }
  ```

### Response
* **Success (200 OK)**: Logs in `missingAssets` list.
* **Cascade Behavior**: Automatically changes the asset's status in `assets` collection to `LOST`.

### Status Codes
* `200 OK`: Asset reported missing.
* `400 Bad Request`: Validation failure or audit not `ACTIVE`.
* `401 Unauthorized`: Token missing.

---

## 7. Report Asset Damaged

* **Endpoint**: `/api/audits/:id/damaged`
* **Method**: `PATCH`
* **Authentication**: Required (`ADMIN` or `ASSET_MANAGER` only)

### Request
* **Body**:
  ```json
  {
    "assetId": "64b0f3e8c1e2f7b8a5d4e301",
    "damageDescription": "Liquid spill on keyboard, device refuses to boot.",
    "notes": "Reported during standard quarterly check."
  }
  ```

### Response
* **Success (200 OK)**: Logs in `damagedAssets` list.
* **Cascade Behavior**: Automatically sets the asset's status in `assets` collection to `UNDER_MAINTENANCE` and triggers a new `PENDING` maintenance work order.

### Status Codes
* `200 OK`: Asset logged as damaged, maintenance ticket auto-triggered.
* `400 Bad Request`: Validation failure or audit not `ACTIVE`.
* `401 Unauthorized`: Token missing.

---

## 8. Complete Audit Cycle

* **Endpoint**: `/api/audits/:id/complete`
* **Method**: `PATCH`
* **Authentication**: Required (`ADMIN` or `ASSET_MANAGER` only)

### Request
* **Body**: None

### Response
* **Success (200 OK)**: Status updated to `COMPLETED`.

### Status Codes
* `200 OK`: Audit marked as completed.
* `401 Unauthorized`: Token missing.

---

## 9. Close Audit Cycle

* **Endpoint**: `/api/audits/:id/close`
* **Method**: `PATCH`
* **Authentication**: Required (`ADMIN` or `ASSET_MANAGER` only)

### Request
* **Body**: None

### Response
* **Success (200 OK)**: Updates status to `CLOSED` and stamps `endDate` to current date.
* **Closure Lock Rule**: On closing, the audit lists (`verifiedAssets`, `missingAssets`, `damagedAssets`) become read-only and cannot be modified.

### Status Codes
* `200 OK`: Audit closed.
* `401 Unauthorized`: Token missing.
