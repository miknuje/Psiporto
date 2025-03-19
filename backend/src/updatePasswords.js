require("dotenv").config();
const { connectDB, getDB } = require("./config/db");
const bcrypt = require("bcrypt");

async function updatePasswords() {
  await connectDB();
  const db = getDB();
  const usersCollection = db.collection("Utilizador");

  try {
    const users = await usersCollection.find({}).toArray();
    console.log(`Número de usuários encontrados: ${users.length}`);

    for (const user of users) {
      console.log(`Processando usuário: ${user.Email}`);

      if (user.Password) {
        console.log(`Senha atual: ${user.Password}`);

        // Gera o hash da senha
        const hashedPassword = await bcrypt.hash(user.Password, 10);

        // Atualiza o usuário com a senha hashed
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { Password: hashedPassword } }
        );

        console.log(`Senha atualizada para o usuário: ${user.Email}`);
      } else {
        console.log(`Usuário ${user.Email} não tem campo Password.`);
      }
    }

    console.log("Todas as senhas foram atualizadas com sucesso!");
  } catch (err) {
    console.error("Erro ao atualizar senhas:", err);
  } finally {
    process.exit(); // Encerra o script
  }
}

updatePasswords();