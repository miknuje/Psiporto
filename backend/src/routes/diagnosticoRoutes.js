const express = require("express");
const diagnosticoController = require("../controllers/diagnosticoController");

const router = express.Router();

router.get("/", diagnosticoController.getAllDiagnosticos);
router.get("/:id", diagnosticoController.getDiagnosticoById);
router.post("/", diagnosticoController.createDiagnostico);
router.put("/:id", diagnosticoController.updateDiagnostico);
router.delete("/:id", diagnosticoController.deleteDiagnostico);

module.exports = router;