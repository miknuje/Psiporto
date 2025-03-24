const { getDB } = require("../config/db");

class Diagnostico {
  static collection() {
    return getDB().collection("Diagnostico");
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

  static async create(diagnostico) {
    return await this.collection().insertOne(diagnostico);
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

module.exports = Diagnostico;