const express = require("express");
const nivelController = require("../controllers/nivelController");

const router = express.Router();

router.get("/", nivelController.getAllNivel);
router.get("/:cod_nivel", nivelController.getNivelByCod);
router.post("/", nivelController.createNivel);
router.put("/:cod_nivel", nivelController.updateNivel);
router.delete("/:cod_nivel", nivelController.deleteNivel);

module.exports = router;