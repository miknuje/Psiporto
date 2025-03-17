const Nucleo = require("../models/Nucleo");

exports.getAllNucleos = async (req, res) => {
  try {
    const nucleos = await Nucleo.findAll();
    res.json(nucleos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNucleoByCod = async (req, res) => {
  try {
    const nucleo = await Nucleo.findByCodNucleo(req.params.cod_nucleo);
    if (!nucleo) {
      return res.status(404).json({ error: "Núcleo não encontrado" });
    }
    res.json(nucleo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createNucleo = async (req, res) => {
  try {
    const newNucleo = req.body;
    const result = await Nucleo.create(newNucleo);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateNucleo = async (req, res) => {
  try {
    const cod_nucleo = req.params.cod_nucleo;
    const updatedData = req.body;
    const result = await Nucleo.update(cod_nucleo, updatedData);
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Núcleo não encontrado" });
    }
    res.json({ message: "Núcleo atualizado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteNucleo = async (req, res) => {
  try {
    const cod_nucleo = req.params.cod_nucleo;
    // Define os dados para atualização (exclusão lógica)
    const updatedData = { isDeleted: true };

    // Atualiza o campo isDeleted para true
    const result = await Nucleo.update(cod_nucleo, updatedData);

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Nucleo não encontrado" });
    }

    res.json({ message: "Nucleo marcado como excluído com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};