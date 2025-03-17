const Nivel = require("../models/Niveis");

exports.getAllNivel = async (req, res) => {
  try {
    const niveis = await Nivel.findAll();
    res.json(niveis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNivelByCod = async (req, res) => {
  try {
    const nivel = await Nivel.findByCodUnidade(req.params.cod_nivel);
    if (!nivel) {
      return res.status(404).json({ error: "Nivel não encontrado" });
    }
    res.json(nivel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createNivel = async (req, res) => {
  try {
    const newNivel = req.body;
    const result = await Nivel.create(newNivel);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateNivel = async (req, res) => {
  try {
    const cod_nivel = req.params.cod_nivel;
    const updatedData = req.body;
    const result = await Nivel.update(cod_nivel, updatedData);
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Nível não encontrada" });
    }
    res.json({ message: "Nível atualizada com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteNivel = async (req, res) => {
  try {
    const cod_nivel = req.params.cod_nivel;
    const result = await Nivel.delete(cod_nivel);
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Nível não encontrado" });
    }
    res.json({ message: "Nível marcada como excluída com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
