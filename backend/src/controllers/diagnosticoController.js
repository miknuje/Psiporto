const Diagnostico = require("../models/Diagnostico");

exports.getAllDiagnosticos = async (req, res) => {
  try {
    const diagnosticos = await Diagnostico.findAll();
    res.json(diagnosticos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDiagnosticoById = async (req, res) => {
  try {
    const diagnostico = await Diagnostico.findById(req.params.id);
    if (!diagnostico) {
      return res.status(404).json({ error: "Diagnóstico não encontrado" });
    }
    res.json(diagnostico);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createDiagnostico = async (req, res) => {
  try {
    const newDiagnostico = req.body;
    const result = await Diagnostico.create(newDiagnostico);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateDiagnostico = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;

    const result = await Diagnostico.update(id, updatedData);
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Diagnóstico não encontrado" });
    }
    res.json({ message: "Diagnóstico atualizado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLastDiagnostico = async (req, res) => {
    try {
      const lastDiag = await Diagnostico.findLast();
      if (!lastDiag) {
        return res.json({ cod_diag: 0 });
      }
      res.json(lastDiag);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

exports.deleteDiagnostico = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Diagnostico.delete(id);

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Diagnóstico não encontrado" });
    }

    res.json({ message: "Diagnóstico removido com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};