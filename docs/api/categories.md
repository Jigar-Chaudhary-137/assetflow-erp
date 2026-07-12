# API: Categories

## 1. List All Categories

* **Endpoint**: `/api/categories`
* **Method**: `GET`
* **Authentication**: Required (Any authenticated user)

### Request
* **Body**: None

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Categories retrieved successfully",
    "data": [
      {
        "_id": "64b0f3e8c1e2f7b8a5d4e201",
        "name": "Laptops",
        "code": "LAP",
        "description": "Company-issued work computers and developer machines",
        "customFields": [
          {
            "fieldName": "processor",
            "label": "Processor (CPU)",
            "fieldType": "STRING",
            "required": true,
            "description": "e.g., Intel Core i7, Apple M2"
          },
          {
            "fieldName": "ramSize",
            "label": "RAM (GB)",
            "fieldType": "NUMBER",
            "required": true,
            "description": "e.g., 16, 32"
          }
        ],
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
* `200 OK`: Categories successfully retrieved.
* `401 Unauthorized`: Token is missing or invalid.

---

## 2. Get Single Category

* **Endpoint**: `/api/categories/:id`
* **Method**: `GET`
* **Authentication**: Required (Any authenticated user)

### Request
* **Body**: None

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Category retrieved successfully",
    "data": {
      "_id": "64b0f3e8c1e2f7b8a5d4e201",
      "name": "Laptops",
      "code": "LAP",
      "description": "Company-issued work computers and developer machines",
      "customFields": [
        {
          "fieldName": "processor",
          "label": "Processor (CPU)",
          "fieldType": "STRING",
          "required": true,
          "description": "e.g., Intel Core i7, Apple M2"
        }
      ],
      "status": "ACTIVE",
      "createdAt": "2026-07-12T04:00:00.000Z",
      "updatedAt": "2026-07-12T04:00:00.000Z"
    }
  }
  ```

### Validation
* Requires valid MongoDB `id` in the URL parameter.

### Status Codes
* `200 OK`: Category retrieved.
* `401 Unauthorized`: Token is missing or invalid.
* `404 Not Found`: Category not found.

---

## 3. Create Category

* **Endpoint**: `/api/categories`
* **Method**: `POST`
* **Authentication**: Required (`ADMIN` or `ASSET_MANAGER`)

### Request
* **Body**:
  ```json
  {
    "name": "Monitors",
    "code": "MON",
    "description": "Desk displays and portable monitors",
    "customFields": [
      {
        "fieldName": "screenSize",
        "label": "Screen Size (inches)",
        "fieldType": "NUMBER",
        "required": true,
        "description": "e.g. 24, 27, 32"
      }
    ]
  }
  ```

### Response
* **Success (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Category created successfully",
    "data": {
      "_id": "64b0f3e8c1e2f7b8a5d4e205",
      "name": "Monitors",
      "code": "MON",
      "description": "Desk displays and portable monitors",
      "customFields": [
        {
          "fieldName": "screenSize",
          "label": "Screen Size (inches)",
          "fieldType": "NUMBER",
          "required": true,
          "description": "e.g. 24, 27, 32"
        }
      ],
      "status": "ACTIVE",
      "createdAt": "2026-07-12T04:42:00.000Z",
      "updatedAt": "2026-07-12T04:42:00.000Z"
    }
  }
  ```

### Validation
| Field | Type | Rules |
| :--- | :--- | :--- |
| `name` | String | Required, unique, 2-50 characters, trimmed |
| `code` | String | Required, unique, uppercase, alphanumeric, 2-5 characters |
| `customFields` | Array | Required, array of custom field definition sub-documents |
| `customFields[].fieldName` | String | Required, camelCase format, unique within this customFields array |
| `customFields[].label` | String | Required |
| `customFields[].fieldType` | String | Required, enum: `STRING`, `NUMBER`, `BOOLEAN`, `DATE` |
| `customFields[].required` | Boolean | Required |

### Status Codes
* `201 Created`: Category successfully created.
* `400 Bad Request`: Validation failure on fields or dynamic rules.
* `401 Unauthorized`: Token is missing or invalid.
* `403 Forbidden`: Insufficient permissions (not ADMIN or ASSET_MANAGER).
* `409 Conflict`: Category Name or Code already exists.

---

## 4. Update Category

* **Endpoint**: `/api/categories/:id`
* **Method**: `PUT`
* **Authentication**: Required (`ADMIN` or `ASSET_MANAGER`)

### Request
* **Body**:
  ```json
  {
    "name": "Laptops & Notebooks",
    "code": "LAP",
    "description": "Work laptops",
    "customFields": [
      {
        "fieldName": "processor",
        "label": "Processor (CPU)",
        "fieldType": "STRING",
        "required": true
      },
      {
        "fieldName": "gpuModel",
        "label": "GPU Model",
        "fieldType": "STRING",
        "required": false
      }
    ],
    "status": "ACTIVE"
  }
  ```

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Category updated successfully",
    "data": {
      "_id": "64b0f3e8c1e2f7b8a5d4e201",
      "name": "Laptops & Notebooks",
      "code": "LAP",
      "description": "Work laptops",
      "customFields": [
        {
          "fieldName": "processor",
          "label": "Processor (CPU)",
          "fieldType": "STRING",
          "required": true
        },
        {
          "fieldName": "gpuModel",
          "label": "GPU Model",
          "fieldType": "STRING",
          "required": false
        }
      ],
      "status": "ACTIVE",
      "createdAt": "2026-07-12T04:00:00.000Z",
      "updatedAt": "2026-07-12T04:42:00.000Z"
    }
  }
  ```

### Validation
* Same schema validations apply as Creation.
* **Schema Integrity Rule**: If there are already assets referencing this category, editing `customFields` is restricted to appending optional fields only. Deletion or modification of existing field definitions will be rejected.

### Status Codes
* `200 OK`: Category successfully updated.
* `400 Bad Request`: Validation failed, or violated category schema integrity rules.
* `401 Unauthorized`: Token is missing or invalid.
* `403 Forbidden`: Insufficient permissions (not ADMIN or ASSET_MANAGER).
* `404 Not Found`: Category not found.
* `409 Conflict`: Name or Code already in use.

---

## 5. Delete Category

* **Endpoint**: `/api/categories/:id`
* **Method**: `DELETE`
* **Authentication**: Required (`ADMIN` only)

### Request
* **Body**: None

### Response
* **Success (204 No Content)**: (Empty response body)

### Validation
* Will fail if there are any assets referencing this category.

### Status Codes
* `204 No Content`: Category deleted.
* `400 Bad Request`: Cannot delete category while assets are linked to it.
* `401 Unauthorized`: Token is missing or invalid.
* `403 Forbidden`: Insufficient permissions (not ADMIN).
* `404 Not Found`: Category not found.
