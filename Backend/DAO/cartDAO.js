
const { getConnection, execute } = require('../connection/DB');

class CartDao {
  async getCartByUser(userId) {
    const connection = await getConnection();
    const sql = `
      SELECT c.*, p.name, p.price, p.promo, p.sconto, p.image_url, p.disponibilita
      FROM cart c
      JOIN products p ON c.prodotto_id = p.id
      WHERE c.user_id = $1
    `;
    const items = await execute(connection, sql, [userId]);
    connection.done();
    return items;
  }

  async addOrUpdateCartItem(userId, prodottoId, quantita) {
    const connection = await getConnection();
    // Se esiste aggiorna, altrimenti inserisce
    const sql = `
      INSERT INTO cart (user_id, prodotto_id, quantita)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, prodotto_id)
      DO UPDATE SET quantita = cart.quantita + EXCLUDED.quantita
      RETURNING *
    `;
    const result = await execute(connection, sql, [userId, prodottoId, quantita]);
    connection.done();
    return result[0];
  }
  
  async setCartItemQuantity(userId, prodottoId, quantita) {
  const connection = await getConnection();
  const sql = `
    INSERT INTO cart (user_id, prodotto_id, quantita)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, prodotto_id)
    DO UPDATE SET quantita = EXCLUDED.quantita
    RETURNING *
  `;
  const result = await execute(connection, sql, [userId, prodottoId, quantita]);
  connection.done();
  return result[0];
}

  async removeCartItem(userId, prodottoId) {
    const connection = await getConnection();
    const sql = `DELETE FROM cart WHERE user_id = $1 AND prodotto_id = $2`;
    await execute(connection, sql, [userId, prodottoId]);
    connection.done();
  }

  async clearCart(userId) {
    const connection = await getConnection();
    const sql = `DELETE FROM cart WHERE user_id = $1`;
    await execute(connection, sql, [userId]);
    connection.done();
  }
}

module.exports = new CartDao();