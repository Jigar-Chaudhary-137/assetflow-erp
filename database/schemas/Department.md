# Schema: Department

## Collection Purpose
The `departments` collection stores organizational units. It defines the department hierarchy, identifies the department heads, and serves as the structural foundation for grouping employees, assets, allocations, and budgets.

---

## Fields & Data Types

| Field Name | Data Type | Required | Default Value | Validation Rules & Constraints |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Yes | Auto-generated | MongoDB standard unique identifier |
| `name` | String | Yes | None | Unique, trimmed, 2 to 100 characters |
| `code` | String | Yes | None | Unique, trimmed, alphanumeric, uppercase, 2 to 10 characters (e.g., "ENG", "MKT") |
| `managerId` | ObjectId | No | null | References `_id` in `users` collection. Represents the Department Head |
| `parentDepartmentId` | ObjectId | No | null | References `_id` in `departments` collection. Supports sub-departments |
| `status` | String | Yes | `ACTIVE` | Enum: `ACTIVE`, `INACTIVE` |
| `createdAt` | Date | Yes | `Date.now` | UTC timestamp of registration |
| `updatedAt` | Date | Yes | `Date.now` | UTC timestamp of last modification |

---

## Relationships
- **managerId**: Links to the `users` collection (`_id`).
  - *Relationship Type*: One-to-One / One-to-Many (A user can manage one department; a department has one head).
- **parentDepartmentId**: Self-referencing link to the `departments` collection (`_id`).
  - *Relationship Type*: Parent-Child (A department can have many sub-departments, but only one parent).

---

## Indexes

| Index Name | Index Key(s) | Type | Unique | Purpose |
| :--- | :--- | :--- | :---: | :--- |
| `idx_departments_name` | `{ name: 1 }` | B-tree | Yes | Prevent duplicate department names |
| `idx_departments_code` | `{ code: 1 }` | B-tree | Yes | Fast lookup by short department code |
| `idx_departments_managerId` | `{ managerId: 1 }` | B-tree | No | Finding which department a user manages |
| `idx_departments_parentId` | `{ parentDepartmentId: 1 }` | B-tree | No | Traversing the department hierarchy |

---

## Business Rules
1. **Manager Role Constraints**: The user referenced by `managerId` should have the role `DEPARTMENT_HEAD` or `ADMIN`.
2. **Circular Reference Prevention**: A department cannot be its own parent. `parentDepartmentId` must not equal `_id`.
3. **Deactivation Behavior**: When a department status is set to `INACTIVE`, all users within that department cannot log in unless reassigned, and no new allocations can be created for that department.

---

## Example Document
```json
{
  "_id": { "$oid": "64b0f3e8c1e2f7b8a5d4e001" },
  "name": "Engineering",
  "code": "ENG",
  "managerId": { "$oid": "64b0f3e8c1e2f7b8a5d4e103" },
  "parentDepartmentId": null,
  "status": "ACTIVE",
  "createdAt": { "$date": "2026-07-12T04:00:00.000Z" },
  "updatedAt": { "$date": "2026-07-12T04:00:00.000Z" }
}
```
