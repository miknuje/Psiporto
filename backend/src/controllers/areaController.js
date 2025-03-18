const Area = require("../models/Area");

exports.getAllAreas = async (req, res) => {
  try {
    const areas = await Area.findAll();
    res.json(areas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAreaByCod = async (req, res) => {
  try {
    const area = await Area.findByCodArea(req.params.cod_area);
    if (!area) {
      return res.status(404).json({ error: "Área não encontrada" });
    }
    res.json(area);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createArea = async (req, res) => {
  try {
    const newArea = req.body;
    const result = await Area.create(newArea);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateArea = async (req, res) => {
  try {
    const cod_area = req.params.cod_area;
    const updatedData = req.body;

    console.log("cod_area:", cod_area);
    console.log("updatedData:", updatedData);

    const result = await Area.update(cod_area, updatedData);
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Área não encontrada" });
    }
    res.json({ message: "Área atualizada com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteArea = async (req, res) => {
  try {
    const cod_area = req.params.cod_area;
    const result = await Area.delete(cod_area); // Usando o método delete do modelo

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Área não encontrada" });
    }

    res.json({ message: "Área marcada como excluída com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
