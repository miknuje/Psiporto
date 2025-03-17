const { getDB } = require("../config/db");

class Unidade {
  static collection() {
    return getDB().collection("Unidade");
  }

  static async findAll() {
    return await this.collection().find().toArray();
  }

  static async findByCodUnidade(cod_unidade) {
    return await this.collection().findOne({ cod_unidade });
  }

  static async create(unidade) {
    return await this.collection().insertOne(unidade);
  }

  static async update(cod_unidade, updatedData) {
    return await this.collection().updateOne({ cod_unidade }, { $set: updatedData });
  }
  
  static async updateOne(filter, update) {
    return await this.collection().updateOne(filter, update);
  }

  static async delete(cod_unidade) {
    return await this.collection().updateOne({ cod_unidade }, { $set: { isDeleted: true } });
  }

}

module.exports = Unidade;