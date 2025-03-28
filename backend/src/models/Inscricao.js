const { getDB } = require("../config/db");

class Inscricao {
  static collection() {
    return getDB().collection("Inscricao");
  }

  static async findLast() {
    return await this.collection()
      .find()
      .sort({ cod_inscricao: -1 })
      .limit(1)
      .next();
  }

  static async findAll() {
    return await this.collection().find().toArray();
  }

  static async findById(id) {
    return await this.collection().findOne({ _id: id });
  }

  static async findBySigo(sigo) {
    return await this.collection().findOne({ sigo });
  }

  static async create(inscricao) {
    return await this.collection().insertOne(inscricao);
  }

  static async update(id, updatedData) {
    return await this.collection().updateOne(
      { _id: id },
      { $set: updatedData }
    );
  }

  static async delete(id) {
    return await this.collection().deleteOne({ _id: id });
  }
}

module.exports = Inscricao;