const Inscricao = require("../models/Inscricao");

exports.getAllInscricoes = async (req, res) => {
  try {
    const inscricoes = await Inscricao.findAll();
    res.json(inscricoes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLastInscricao = async (req, res) => {
    try {
      const lastInscricao = await Inscricao.findLast();
      if (!lastInscricao) {
        return res.json({ cod_inscricao: 0 });
      }
      res.json(lastInscricao);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

exports.getInscricaoById = async (req, res) => {
  try {
    const inscricao = await Inscricao.findById(req.params.id);
    if (!inscricao) {
      return res.status(404).json({ error: "Inscrição não encontrada" });
    }
    res.json(inscricao);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createInscricao = async (req, res) => {
    try {
      const lastInscricao = await Inscricao.findLast();
      const nextCodInscricao = (lastInscricao?.cod_inscricao || 0) + 1;
      
      const newInscricao = {
        ...req.body,
        cod_inscricao: nextCodInscricao
      };
  
      const result = await Inscricao.create(newInscricao);
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

exports.updateInscricao = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;

    const result = await Inscricao.update(id, updatedData);
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Inscrição não encontrada" });
    }
    res.json({ message: "Inscrição atualizada com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteInscricao = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Inscricao.delete(id);

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Inscrição não encontrada" });
    }

    res.json({ message: "Inscrição removida com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};