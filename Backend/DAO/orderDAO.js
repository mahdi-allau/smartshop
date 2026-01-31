
const { getConnection, execute } = require('../connection/DB');

class OrderDao {
 async createOrder(userId, totale, indirizzoId, stato = 'In elaborazione', dettagli_spedizione = 'in attesa di spedizione') {
  const connection = await getConnection();
  const sql = `
    INSERT INTO ordine (user_id, totale, indirizzo_id, stato, dettagli_spedizione)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const result = await execute(connection, sql, [userId, totale, indirizzoId, stato, dettagli_spedizione]);
  connection.done();
  return result[0];
}

  async addOrderItem(ordineId, prodottoId, quantita, prezzo) {
    const connection = await getConnection();
    const sql = `
      INSERT INTO ordine_item (ordine_id, prodotto_id, quantita, prezzo)
      VALUES ($1, $2, $3, $4)
    `;
    await execute(connection, sql, [ordineId, prodottoId, quantita, prezzo]);
    connection.done();
  }

  async getOrdiniByUser(userId) {
  const connection = await getConnection();
  const sql = `
    SELECT o.*, i.nome_destinatario, i.indirizzo, i.citta, i.cap, i.paese, i.telefono
    FROM ordine o
    JOIN indirizzi i ON o.indirizzo_id = i.id
    WHERE o.user_id = $1
    ORDER BY o.data DESC
  `;
  const result = await execute(connection, sql, [userId]);
  connection.done();
  return result;
}

  async getOrderItems(ordineId) {
    const connection = await getConnection();
    const sql = `
    SELECT oi.*, p.name, p.description, p.image_url
    FROM ordine_item oi
    JOIN products p ON oi.prodotto_id = p.id
    WHERE oi.ordine_id = $1
  `;
    const items = await execute(connection, sql, [ordineId]);
    connection.done();
    return items;
  }

async aggiornaStatoOrdine(orderId, stato, dettagliSpedizione) {
  console.log('Aggiorno nel DB:', { orderId, stato, dettagliSpedizione });
  const connection = await getConnection();
  const sql = 'UPDATE ordine SET stato = $1, dettagli_spedizione = $2 WHERE id = $3';
  await execute(connection, sql, [stato, dettagliSpedizione, orderId]);
  connection.done();
}
  
}


module.exports = new OrderDao();