const { getConnection, execute } = require('../connection/DB');

class IndirizziDAO {
  async aggiungiIndirizzo(userId, nome_destinatario, indirizzo, citta, cap, paese, telefono) {
    const connection = await getConnection();
    const sql = `
      INSERT INTO indirizzi (user_id, nome_destinatario, indirizzo, citta, cap, paese, telefono)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await execute(connection, sql, [userId, nome_destinatario, indirizzo, citta, cap, paese, telefono]);
    connection.done();
    return result[0];
  }
  async aggiornaIndirizzo(id, userId, nome_destinatario, indirizzo, citta, cap, paese, telefono) {
  const connection = await getConnection();
  const sql = `
    UPDATE indirizzi
    SET nome_destinatario = $1, indirizzo = $2, citta = $3, cap = $4, paese = $5, telefono = $6
    WHERE id = $7 AND user_id = $8
    RETURNING *
  `;
  const result = await execute(connection, sql, [nome_destinatario, indirizzo, citta, cap, paese, telefono, id, userId]);
  connection.done();
  return result[0];
}
async eliminaIndirizzo(id, userId) {
  const connection = await getConnection();
  const sql = `DELETE FROM indirizzi WHERE id = $1 AND user_id = $2 RETURNING *`;
  const result = await execute(connection, sql, [id, userId]);
  connection.done();
  return result[0];
}

async setPredefinito(userId, indirizzoId) {
  const connection = await getConnection();
  await execute(connection, 'UPDATE indirizzi SET predefinito = false WHERE user_id = $1', [userId]);
  const sql = 'UPDATE indirizzi SET predefinito = true WHERE id = $1 AND user_id = $2 RETURNING *';
  const result = await execute(connection, sql, [indirizzoId, userId]);
  connection.done();
  return result[0];
}
async trovaIndirizzo(userId, nome_destinatario, indirizzo, citta, cap, paese, telefono) {
  const connection = await getConnection();
  const sql = `
    SELECT * FROM indirizzi
    WHERE user_id = $1
      AND nome_destinatario = $2
      AND indirizzo = $3
      AND citta = $4
      AND cap = $5
      AND paese = $6
      AND telefono = $7
    LIMIT 1
  `;
  const result = await execute(connection, sql, [userId, nome_destinatario, indirizzo, citta, cap, paese, telefono]);
  connection.done();
  return result[0] || null;
}


  async getIndirizziByUser(userId) {
    const connection = await getConnection();
    const sql = `SELECT * FROM indirizzi WHERE user_id = $1`;
    const result = await execute(connection, sql, [userId]);
    connection.done();
    return result;
  }
}

module.exports = new IndirizziDAO();