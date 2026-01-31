
const { getConnection, execute } = require('../connection/DB');

class UserDao {
  async createUser(user) {
    const connection = await getConnection();
    const sql = `
      INSERT INTO "user" (nome, cognome, email, password, telefono, data_nascita, sesso, ruolo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, nome, cognome, email, telefono, data_nascita, sesso, ruolo
    `;
    const values = [
      user.nome,
      user.cognome,
      user.email,
      user.password,
      user.telefono,
      user.data_nascita,
      user.sesso,
      user.ruolo || 'user'
    ];
    const result = await execute(connection, sql, values);
    connection.done();
    return result[0];
  }

  async findByEmail(email) {
    const connection = await getConnection();
    const sql = 'SELECT * FROM "user" WHERE lower(email) = lower($1)';
    const result = await execute(connection, sql, [email]);
    connection.done();
    return result[0];
  }

  async getUserById(id) {
    const connection = await getConnection();
   const sql = 'SELECT "nome", "cognome", "email" FROM "user" WHERE id = $1';
    const result = await execute(connection, sql, [id]);
    connection.done();
    return result[0];
  }

  async updateUserById(id, dati) {
  const connection = await getConnection();
  const fields = [];
  const values = [];
  let idx = 1;
  for (const key of ['nome', 'cognome', 'email', 'data_nascita', 'sesso', 'telefono', 'password']) {
  if (dati[key]) {
    fields.push(`"${key}" = $${idx++}`);
    values.push(key === 'password' ? await require('bcrypt').hash(dati[key], 10) : dati[key]);
  }
}
  if (!fields.length) {
    connection.done();
    return;
  }
  const sql = `UPDATE "user" SET ${fields.join(', ')} WHERE id = $${idx}`;
  values.push(id);
  await execute(connection, sql, values);
  connection.done();
}


}

module.exports = new UserDao();