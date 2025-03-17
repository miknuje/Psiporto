const express = require("express");
const nucleoController = require("../controllers/nucleoController");

const router = express.Router();

router.get("/", nucleoController.getAllNucleos);
router.get("/:cod_nucleo", nucleoController.getNucleoByCod);
router.post("/", nucleoController.createNucleo);
router.put("/:cod_nucleo", nucleoController.updateNucleo);
router.delete("/:cod_nucleo", nucleoController.deleteNucleo);

module.exports = router;