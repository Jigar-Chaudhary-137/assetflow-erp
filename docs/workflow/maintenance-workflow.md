# Workflow: Maintenance Workflow

Tracks the reporting, approval, and execution of hardware repairs.

## Maintenance Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PENDING : Report Issue (POST /maintenance)
    
    PENDING --> APPROVED : Approve (PATCH /:id/approve)
    PENDING --> REJECTED : Reject (PATCH /:id/reject)
    
    APPROVED --> TECHNICIAN_ASSIGNED : Assign Tech (PATCH /:id/assign)
    
    TECHNICIAN_ASSIGNED --> IN_PROGRESS : Start Repair
    
    IN_PROGRESS --> RESOLVED : Resolve Ticket (PATCH /:id/resolve)
    
    REJECTED --> [*]
    RESOLVED --> [*]
```

---

## Workflow Steps

```mermaid
flowchart TD
    A[Employee / Auditor reports hardware issue] --> B[Ticket status: PENDING]
    B --> C{Manager / Head review?}
    C -->|Reject| D[Status: REJECTED]
    C -->|Approve| E[Status: APPROVED]
    E --> F[Asset status changes to UNDER_MAINTENANCE & Locked]
    F --> G[Assign Technician & Schedule Date]
    G --> H[Technician sets Status to IN_PROGRESS]
    H --> I[Technician performs repairs]
    I --> J[Mark as RESOLVED & Input Cost + Fix details]
    J --> K[Asset status reverts to AVAILABLE]
```

---

## Detailed Rules

1. **Asset status lock**: Once the ticket is `APPROVED` or in `IN_PROGRESS`, the asset is locked (status `UNDER_MAINTENANCE`). No other employee can allocate it or create a booking for it.
2. **Resolution requirement**: Marking a ticket as `RESOLVED` requires providing a description of `resolutionDetails` and a valid decimal `cost` value (even if `0`). On saving, the asset status changes back to `AVAILABLE`.
3. **Approval gate**: Technicians cannot be assigned and repair work cannot begin until the ticket has been formally `APPROVED` by a Manager or Admin.
