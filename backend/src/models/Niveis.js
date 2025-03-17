const { getDB } = require("../config/db");

class Nivel {
  static collection() {
    return getDB().collection("Niveis");
  }

  static async findAll() {
    return await this.collection().find({ isDeleted: false }).toArray();
  }

  static async findByCodNivel(cod_nivel) {
    return await this.collection().findOne({ cod_nivel });
  }

  static async create(nivel) {
    return await this.collection().insertOne(nivel);
  }

  static async update(cod_nivel, updatedData) {
    const result = await this.collection().updateOne(
      { cod_nivel },
      { $set: updatedData }
    );
    return result;
  }

  // Exclui logicamente uma área, marcando isDeleted como true
  static async delete(cod_nivel) {
    return await this.collection().updateOne({ cod_nivel }, { $set: { isDeleted: true } });
  }
}

module.exports = Nivel;
