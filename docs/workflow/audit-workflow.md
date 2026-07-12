# Workflow: Audit Workflow

Governs organizational inventory checking and physical asset verification cycles.

## Audit Cycle States

```mermaid
stateDiagram-v2
    [*] --> PLANNED : Create Cycle (POST /audits)
    PLANNED --> ACTIVE : Start Audit (PATCH /:id/start)
    ACTIVE --> COMPLETED : Complete Checks (PATCH /:id/complete)
    COMPLETED --> CLOSED : Close Cycle (PATCH /:id/close)
    CLOSED --> [*]
```

---

## Audit Verification Steps

```mermaid
flowchart TD
    A[Start Audit Cycle: ACTIVE] --> B[Auditor scans/checks asset]
    
    B --> C{Asset Found & Intact?}
    
    C -->|Yes, Intact| D[Verify Asset]
    D --> D1[Add to verifiedAssets]
    D1 --> D2{Location/Condition changed?}
    D2 -->|Yes| D3[Update Asset record in DB]
    D2 -->|No| B
    
    C -->|No, Missing| E[Report Missing]
    E --> E1[Add to missingAssets]
    E1 --> E2[Update Asset status to LOST] --> B
    
    C -->|Yes, but Damaged| F[Report Damaged]
    F --> F1[Add to damagedAssets]
    F1 --> F2[Update Asset status to UNDER_MAINTENANCE]
    F2 --> F3[Trigger PENDING Maintenance ticket] --> B
```

---

## Detailed Rules

1. **Verification Cascade**: When verifying an asset, if the scanned location or condition differs from the current record in the database, the backend automatically updates the `assets` collection.
2. **Missing Cascade**: Flagging an asset as missing sets its status to `LOST`.
3. **Damaged Cascade**: Flagging an asset as damaged changes its status to `UNDER_MAINTENANCE` and automatically inserts a new `PENDING` maintenance work order request.
4. **Closure Lock**: Transitioning an audit cycle to `CLOSED` writes an `endDate` timestamp and locks the verified, missing, and damaged arrays from any further modifications to ensure data integrity.
