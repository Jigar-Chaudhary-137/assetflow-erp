const express = require("express");
const {
  allocateAsset,
  returnAsset,
  getActiveAllocations,
  getAllAllocations,
  getAllocationById,
  requestAllocationTransfer,
  approveAllocationTransfer,
  rejectAllocationTransfer,
} = require("../controllers/allocationController");
const {
  createAllocationValidator,
  returnAllocationValidator,
} = require("../validations/allocationValidation");
const validate = require("../middleware/validator");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/rbac");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("Admin", "Manager"),
  createAllocationValidator,
  validate,
  allocateAsset,
);
router.post(
  "/:id/return",
  protect,
  authorize("Admin", "Manager"),
  returnAllocationValidator,
  validate,
  returnAsset,
);
router.get(
  "/active",
  protect,
  authorize("Admin", "Manager", "Staff"),
  getActiveAllocations,
);
router.post(
  "/:id/transfer",
  protect,
  authorize("Admin", "Manager", "Staff"),
  requestAllocationTransfer,
);
router.patch(
  "/:id/transfer/approve",
  protect,
  authorize("Admin", "Manager"),
  approveAllocationTransfer,
);
router.patch(
  "/:id/transfer/reject",
  protect,
  authorize("Admin", "Manager"),
  rejectAllocationTransfer,
);
router.get(
  "/",
  protect,
  authorize("Admin", "Manager", "Staff"),
  getAllAllocations,
);
router.get(
  "/:id",
  protect,
  authorize("Admin", "Manager", "Staff"),
  getAllocationById,
);

// Transfer alias routes (frontend calls /allocations/:id/transfer etc.)
router.post(
  "/:id/transfer",
  protect,
  authorize("Admin", "Manager", "Staff"),
  initiateTransferFromAllocation,
);
router.post(
  "/:id/approve-transfer",
  protect,
  authorize("Admin", "Manager"),
  approveTransferFromAllocation,
);
router.post(
  "/:id/reject-transfer",
  protect,
  authorize("Admin", "Manager"),
  rejectTransferFromAllocation,
);

module.exports = router;
