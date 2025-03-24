const { getDB } = require("../config/db");

class Candidato {
  static collection() {
    return getDB().collection("Candidato");
  }

  static async findAll() {
    return await this.collection().find({ isDeleted: false }).toArray();
  }

  static async findBySigo(sigo) {
    return await this.collection().findOne({ sigo, isDeleted: false });
  }

  static async create(candidato) {
    candidato.isDeleted = false; // Adiciona o campo isDeleted
    return await this.collection().insertOne(candidato);
  }

  static async update(sigo, updatedData) {
    return await this.collection().updateOne(
      { sigo }, 
      { $set: updatedData }
    );
  }

  static async delete(sigo) {
    // Exclusão lógica
    return await this.collection().updateOne(
      { sigo },
      { $set: { isDeleted: true } }
    );
  }
}

module.exports = Candidato;