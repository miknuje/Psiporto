const express = require("express");
const areaController = require("../controllers/areaController");

const router = express.Router();

router.get("/", areaController.getAllAreas);
router.get("/:cod_area", areaController.getAreaByCod);
router.post("/", areaController.createArea);
router.put("/:cod_area", areaController.updateArea);
router.delete("/:cod_area", areaController.deleteArea);

module.exports = router;