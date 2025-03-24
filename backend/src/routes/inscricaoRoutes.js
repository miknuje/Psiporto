const express = require("express");
const inscricaoController = require("../controllers/inscricaoController");

const router = express.Router();

router.get("/", inscricaoController.getAllInscricoes);
router.get("/:id", inscricaoController.getInscricaoById);
router.post("/", inscricaoController.createInscricao);
router.put("/:id", inscricaoController.updateInscricao);
router.delete("/:id", inscricaoController.deleteInscricao);

module.exports = router;