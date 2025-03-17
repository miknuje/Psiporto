const { getDB } = require("../config/db");

class Area {
  static collection() {
    return getDB().collection("Area");
  }

  static async findAll() {
    return await this.collection().find({ isDeleted: false }).toArray();
  }

  static async findByCodArea(cod_area) {
    return await this.collection().findOne({ cod_area });
  }

  static async create(area) {
    return await this.collection().insertOne(area);
  }

  static async update(cod_area, updatedData) {
    return await this.collection().updateOne({ cod_area }, { $set: updatedData });
  }

  // Exclui logicamente uma área, marcando isDeleted como true
  static async delete(cod_area) {
    return await this.collection().updateOne({ cod_area }, { $set: { isDeleted: true } });
  }
}

module.exports = Area;
