# Schema: Category

## Collection Purpose
The `categories` collection stores asset categories and their corresponding metadata. It supports dynamic schemas for different asset classes (e.g., Laptops require specs like CPU, RAM, and Storage, while Furniture requires Material and Dimensions) using defined custom fields metadata.

---

## Fields & Data Types

| Field Name | Data Type | Required | Default Value | Validation Rules & Constraints |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Yes | Auto-generated | MongoDB standard unique identifier |
| `name` | String | Yes | None | Unique, trimmed, 2 to 50 characters (e.g., "Laptops", "Office Chairs") |
| `code` | String | Yes | None | Unique, trimmed, uppercase, alphanumeric, 2 to 5 characters (e.g., "LAP", "FURN") |
| `description` | String | No | null | Optional text describing the category |
| `customFields` | Array | Yes | `[]` | List of custom fields definitions (see structure below) |
| `status` | String | Yes | `ACTIVE` | Enum: `ACTIVE`, `INACTIVE` |
| `createdAt` | Date | Yes | `Date.now` | UTC timestamp of category registration |
| `updatedAt` | Date | Yes | `Date.now` | UTC timestamp of last modification |

### `customFields` Sub-document Structure
Each object inside the `customFields` array represents a metadata definition:

| Field Name | Data Type | Required | Default Value | Validation Rules & Constraints |
| :--- | :--- | :---: | :--- | :--- |
| `fieldName` | String | Yes | None | Unique within this array, camelCase identifier (e.g., `ramSize`) |
| `label` | String | Yes | None | User-friendly display label (e.g., "RAM Size (GB)") |
| `fieldType` | String | Yes | None | Enum: `STRING`, `NUMBER`, `BOOLEAN`, `DATE` |
| `required` | Boolean | Yes | `false` | Indicates if this spec is mandatory during asset registration |
| `description` | String | No | null | Field description/placeholder helper |

---

## Relationships
- **assets**: Linked indirectly (Assets reference `categoryId`).
  - *Relationship Type*: One-to-Many (A category contains many assets; an asset belongs to one category).

---

## Indexes

| Index Name | Index Key(s) | Type | Unique | Purpose |
| :--- | :--- | :--- | :---: | :--- |
| `idx_categories_name` | `{ name: 1 }` | B-tree | Yes | Ensure category name uniqueness |
| `idx_categories_code` | `{ code: 1 }` | B-tree | Yes | Ensure short category code uniqueness |

---

## Business Rules
1. **Asset Tag Prefixing**: The category `code` is used as a prefix for automatically generating unique asset tags (e.g. Code `LAP` produces tags like `AST-LAP-0001`).
2. **Schema Integrity**: If a category has existing assets, editing `customFields` should be restricted to appending optional fields. Deleting or changing existing field definitions must be handled with care to prevent asset specification corruption.
3. **Field Name Uniqueness**: Every `fieldName` inside the `customFields` array must be unique to avoid model compilation conflicts.

---

## Example Document
```json
{
  "_id": { "$oid": "64b0f3e8c1e2f7b8a5d4e201" },
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
    },
    {
      "fieldName": "storageSize",
      "label": "Storage (GB)",
      "fieldType": "NUMBER",
      "required": true,
      "description": "e.g., 512, 1024"
    }
  ],
  "status": "ACTIVE",
  "createdAt": { "$date": "2026-07-12T04:00:00.000Z" },
  "updatedAt": { "$date": "2026-07-12T04:00:00.000Z" }
}
```
