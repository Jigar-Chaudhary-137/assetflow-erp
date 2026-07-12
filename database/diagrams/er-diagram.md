# Database Diagram: Entity Relationship (ER)

This diagram visualizes the MongoDB database architecture for **AssetFlow**. All connections represent MongoDB `ObjectId` reference relations.

```mermaid
erDiagram
    users {
        ObjectId _id PK
        string username
        string email
        string passwordHash
        string firstName
        string lastName
        string role
        ObjectId departmentId FK
        string status
        string contactNumber
        date createdAt
        date updatedAt
    }

    departments {
        ObjectId _id PK
        string name
        string code
        ObjectId managerId FK "users._id"
        ObjectId parentDepartmentId FK "departments._id"
        string status
        date createdAt
        date updatedAt
    }

    categories {
        ObjectId _id PK
        string name
        string code
        string description
        array customFields
        string status
        date createdAt
        date updatedAt
    }

    assets {
        ObjectId _id PK
        string assetTag
        string serialNumber
        string name
        ObjectId categoryId FK "categories._id"
        string condition
        object location
        ObjectId departmentId FK "departments._id"
        string status
        boolean bookable
        object specs
        object purchaseInfo
        array history
        date createdAt
        date updatedAt
    }

    allocations {
        ObjectId _id PK
        ObjectId assetId FK "assets._id"
        ObjectId employeeId FK "users._id"
        ObjectId allocatedById FK "users._id"
        date allocatedDate
        date expectedReturnDate
        date actualReturnDate
        string status
        string transferStatus
        ObjectId transferRequestedTo FK "users._id"
        string notes
        date createdAt
        date updatedAt
    }

    bookings {
        ObjectId _id PK
        ObjectId resourceId FK "assets._id"
        ObjectId employeeId FK "users._id"
        date startTime
        date endTime
        string status
        string purpose
        date createdAt
        date updatedAt
    }

    maintenances {
        ObjectId _id PK
        ObjectId assetId FK "assets._id"
        ObjectId reportedById FK "users._id"
        date reportedDate
        string issueDescription
        string priority
        string status
        ObjectId approvedById FK "users._id"
        date approvalDate
        ObjectId technicianId FK "users._id"
        string maintenanceType
        date scheduledDate
        date completionDate
        string resolutionDetails
        number cost
        date createdAt
        date updatedAt
    }

    audits {
        ObjectId _id PK
        string auditCycleName
        ObjectId auditorId FK "users._id"
        string status
        date startDate
        date endDate
        ObjectId targetDepartmentId FK "departments._id"
        ObjectId targetCategoryId FK "categories._id"
        array verifiedAssets
        array missingAssets
        array damagedAssets
        date createdAt
        date updatedAt
    }

    notifications {
        ObjectId _id PK
        ObjectId receiverId FK "users._id"
        string type
        string title
        string message
        boolean readStatus
        ObjectId relatedEntityId FK "polymorphic"
        string relatedEntityType
        date createdAt
    }

    activitylogs {
        ObjectId _id PK
        ObjectId userId FK "users._id"
        string action
        string module
        string description
        string ipAddress
        string userAgent
        object metadata
        date timestamp
    }

    departments ||--o| users : "managed by (managerId)"
    departments ||--o{ departments : "parent department (parentDepartmentId)"
    users ||--o{ departments : "belongs to (departmentId)"
    
    categories ||--o{ assets : "groups (categoryId)"
    departments ||--o{ assets : "owns (departmentId)"
    
    assets ||--o{ allocations : "leased in (assetId)"
    users ||--o{ allocations : "assignee (employeeId)"
    users ||--o{ allocations : "allocator (allocatedById)"
    users ||--o{ allocations : "transfer target (transferRequestedTo)"
    
    assets ||--o{ bookings : "reserved in (resourceId)"
    users ||--o{ bookings : "reserved by (employeeId)"
    
    assets ||--o{ maintenances : "repaired in (assetId)"
    users ||--o{ maintenances : "reported by (reportedById)"
    users ||--o{ maintenances : "approved by (approvedById)"
    users ||--o{ maintenances : "repaired by (technicianId)"
    
    users ||--o{ audits : "audited by (auditorId)"
    departments ||--o{ audits : "scopable by (targetDepartmentId)"
    categories ||--o{ audits : "scopable by (targetCategoryId)"
    
    users ||--o{ notifications : "receives (receiverId)"
    users ||--o{ activitylogs : "initiates (userId)"
```

### Relationship Legend
- `||--o{` : One-to-Many relationship (e.g. one department can own zero or many assets).
- `||--o|` : One-to-Zero/One relationship (e.g. one department has zero or one manager).
- `FK` : Foreign Key relationship (represented by reference ObjectIds in MongoDB).
