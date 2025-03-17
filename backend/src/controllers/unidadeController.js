const Unidade = require("../models/Unidade");

exports.getAllUnidades = async (req, res) => {
  try {
    const unidades = await Unidade.findAll();
    res.json(unidades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUnidadeByCod = async (req, res) => {
  try {
    const unidade = await Unidade.findByCodUnidade(req.params.cod_unidade);
    if (!unidade) {
      return res.status(404).json({ error: "Unidade não encontrada" });
    }
    res.json(unidade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUnidade = async (req, res) => {
  try {
    const newUnidade = req.body;
    const result = await Unidade.create(newUnidade);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUnidade = async (req, res) => {
  try {
    const cod_unidade = req.params.cod_unidade;
    const updatedData = req.body;
    const result = await Unidade.update(cod_unidade, updatedData);
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Unidade não encontrada" });
    }
    res.json({ message: "Unidade atualizada com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUnidade = async (req, res) => {
  try {
    const cod_unidade = req.params.cod_unidade;

    // Atualiza o campo isDeleted para true
    const result = await Unidade.updateOne(
      { cod_unidade },
      { $set: { isDeleted: true } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Unidade não encontrada" });
    }

    res.json({ message: "Unidade marcada como excluída com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
