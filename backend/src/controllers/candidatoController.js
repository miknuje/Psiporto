const Candidato = require("../models/Candidato");

exports.getAllCandidatos = async (req, res) => {
  try {
    const candidatos = await Candidato.findAll();
    res.json(candidatos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCandidatoBySigo = async (req, res) => {
  try {
    const candidato = await Candidato.findBySigo(req.params.sigo);
    if (!candidato) {
      return res.status(404).json({ error: "Candidato não encontrado" });
    }
    res.json(candidato);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCandidato = async (req, res) => {
  try {
    const newCandidato = req.body;
    const result = await Candidato.create(newCandidato);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCandidato = async (req, res) => {
  try {
    const sigo = req.params.sigo;
    const updatedData = req.body;

    const result = await Candidato.update(sigo, updatedData);
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Candidato não encontrado" });
    }
    res.json({ message: "Candidato atualizado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCandidato = async (req, res) => {
  try {
    const sigo = req.params.sigo;
    const result = await Candidato.delete(sigo);

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Candidato não encontrado" });
    }

    res.json({ message: "Candidato removido com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};