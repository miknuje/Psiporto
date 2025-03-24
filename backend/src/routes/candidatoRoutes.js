const express = require("express");
const candidatoController = require("../controllers/candidatoController");

const router = express.Router();

router.get("/", candidatoController.getAllCandidatos);
router.get("/:sigo", candidatoController.getCandidatoBySigo);
router.post("/", candidatoController.createCandidato);
router.put("/:sigo", candidatoController.updateCandidato);
router.delete("/:sigo", candidatoController.deleteCandidato);

module.exports = router;