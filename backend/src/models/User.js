const { getDB } = require("../config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { ObjectId } = require("mongodb");

class User {
  static collection() {
    return getDB().collection("Utilizador"); // Nome da coleção de usuários
  }

  // Busca um usuário pelo ID
  static async findById(id) {
    return await this.collection().findOne({ _id: new ObjectId(id) }, { projection: { Password: 0 } });
  }

  static async findByIdChange(id) {
    return await this.collection().findOne({ _id: new ObjectId(id) }, { projection: { Password: 1 } });
  }
  // Atualiza um usuário pelo ID e retorna o documento atualizado
  static async findByIdAndUpdate(id, updateData) {
    return await this.collection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" } // Retorna o documento atualizado
    );
  }

  // Busca um usuário pelo e-mail
  static async findByEmail(Email) {
    return await this.collection().findOne({ Email });
  }

  // Valida a senha do usuário
  static async validatePassword(Email, Password) {
    const user = await this.findByEmail(Email);
    if (!user) {
      return false; // Usuário não encontrado
    }
    return await bcrypt.compare(Password, user.Password); // Compara a senha com o hash
  }

  // Gera um token de redefinição de senha
  static async generatePasswordResetToken(Email) {
    const user = await this.findByEmail(Email);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hora

    await this.collection().updateOne(
      { Email },
      { $set: { resetToken, resetTokenExpiry } }
    );

    return resetToken;
  }

  // Redefine a senha do usuário
  static async resetPassword(Email, token, newPassword) {
    const user = await this.findByEmail(Email);
    if (!user || user.resetToken !== token || user.resetTokenExpiry < Date.now()) {
      throw new Error("Token inválido ou expirado");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.collection().updateOne(
      { Email },
      { $set: { Password: hashedPassword }, $unset: { resetToken: "", resetTokenExpiry: "" } }
    );
  }
}

module.exports = User;