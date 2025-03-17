const { getDB } = require("../config/db");

class Nucleo {
  static collection() {
    return getDB().collection("Nucleo");
  }

  static async findAll() {
    return await this.collection().find().toArray();
  }

  static async findByCodNucleo(cod_nucleo) {
    return await this.collection().findOne({ cod_nucleo });
  }

  static async create(nucleo) {
    return await this.collection().insertOne(nucleo);
  }

  static async update(cod_nucleo, updatedData) {
    return await this.collection().updateOne({ cod_nucleo }, { $set: updatedData });
  }

  static async delete(cod_nucleo) {
    return await this.collection().updateOne({ cod_nucleo }, { $set: { isDeleted: true } });
  }
}

module.exports = Nucleo;