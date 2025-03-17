const express = require("express");
const unidadeController = require("../controllers/unidadeController");

const router = express.Router();

router.get("/", unidadeController.getAllUnidades);
router.get("/:cod_unidade", unidadeController.getUnidadeByCod);
router.post("/", unidadeController.createUnidade);
router.put("/:cod_unidade", unidadeController.updateUnidade);
router.delete("/:cod_unidade", unidadeController.deleteUnidade);

module.exports = router;