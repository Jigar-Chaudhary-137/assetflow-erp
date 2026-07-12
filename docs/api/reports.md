# API: Reports

## 1. Asset Inventory Summary

* **Endpoint**: `/api/reports/assets`
* **Method**: `GET`
* **Authentication**: Required (`ADMIN` or `ASSET_MANAGER` only)

### Request
* **Body**: None

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Asset inventory summary generated",
    "data": {
      "totalAssets": 150,
      "byStatus": {
        "AVAILABLE": 45,
        "ALLOCATED": 85,
        "UNDER_MAINTENANCE": 12,
        "RESERVED": 5,
        "LOST": 3
      },
      "byCondition": {
        "NEW": 20,
        "GOOD": 98,
        "FAIR": 22,
        "POOR": 8,
        "DAMAGED": 2
      }
    }
  }
  ```

### Status Codes
* `200 OK`: Report generated successfully.
* `401 Unauthorized`: Token missing.
* `403 Forbidden`: Insufficient permissions.

---

## 2. Allocation History Report

* **Endpoint**: `/api/reports/allocations`
* **Method**: `GET`
* **Authentication**: Required (`ADMIN` or `ASSET_MANAGER` only)

### Request
* **Query Parameters (Optional)**:
  * `startDate`: ISO Date
  * `endDate`: ISO Date

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Allocation history report generated",
    "data": {
      "totalAllocations": 230,
      "activeAllocations": 85,
      "returnedAllocations": 140,
      "transferredAllocations": 5
    }
  }
  ```

### Status Codes
* `200 OK`: Report generated.
* `401 Unauthorized`: Token missing.

---

## 3. Maintenance Cost & Status Report

* **Endpoint**: `/api/reports/maintenance`
* **Method**: `GET`
* **Authentication**: Required (`ADMIN` or `ASSET_MANAGER` only)

### Request
* **Body**: None

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Maintenance cost report generated",
    "data": {
      "totalRequests": 45,
      "activeTickets": 12,
      "resolvedTickets": 30,
      "rejectedTickets": 3,
      "totalExpenditure": 4500.50,
      "averageCostPerRepair": 150.02
    }
  }
  ```

### Status Codes
* `200 OK`: Cost analysis report generated.
* `401 Unauthorized`: Token missing.

---

## 4. Audit Results Summary

* **Endpoint**: `/api/reports/audits`
* **Method**: `GET`
* **Authentication**: Required (`ADMIN` or `ASSET_MANAGER` only)

### Request
* **Body**: None

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Audit summary retrieved",
    "data": {
      "totalAuditCyclesCompleted": 4,
      "totalVerifiedAssetsAcrossCycles": 320,
      "totalMissingAssetsReported": 12,
      "totalDamagedAssetsReported": 18
    }
  }
  ```

### Status Codes
* `200 OK`: Audit analytics generated.
* `401 Unauthorized`: Token missing.

---

## 5. Department-Level Asset Report

* **Endpoint**: `/api/reports/department/:id`
* **Method**: `GET`
* **Authentication**: Required (`ADMIN`, `ASSET_MANAGER`, or `DEPARTMENT_HEAD` of the target department)

### Request
* **Body**: None

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Department asset report generated",
    "data": {
      "departmentId": "64b0f3e8c1e2f7b8a5d4e001",
      "departmentName": "Engineering",
      "totalAssetsOwned": 64,
      "activeAllocations": 52,
      "assetsUnderRepair": 8,
      "bookableResources": 4
    }
  }
  ```

### Validation
* URL ID parameter must be a valid Department ObjectId.
* If user is `DEPARTMENT_HEAD`, they can only retrieve the report where `:id` matches their own `departmentId`.

### Status Codes
* `200 OK`: Department analytics generated successfully.
* `401 Unauthorized`: Token missing.
* `403 Forbidden`: Insufficient permissions (unauthorized department head).
* `404 Not Found`: Department not found.
