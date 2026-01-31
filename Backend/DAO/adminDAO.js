const { getConnection, execute } = require('../connection/DB');

class AdminDAO {
  async getAllUsers() {
    const connection = await getConnection();
    const sql = 'SELECT id, email, ruolo, is_blocked FROM "user"';
    const result = await execute(connection, sql, []);
    connection.done();
    return result;
  }

  async blockUser(userId) {
    const connection = await getConnection();
    const sql = 'UPDATE "user" SET is_blocked = true WHERE id = $1';
    await execute(connection, sql, [userId]);
    connection.done();
  }
  
   async unblockUser(userId) {
    const connection = await getConnection();
    const sql = 'UPDATE "user" SET is_blocked = false WHERE id = $1';
    await execute(connection, sql, [userId]);
    connection.done();
  }

  async setAdmin(userId, admin) {
    const connection = await getConnection();
    const ruolo = admin ? 'admin' : 'user';
    const sql = 'UPDATE "user" SET ruolo = $1 WHERE id = $2';
    await execute(connection, sql, [ruolo, userId]);
    connection.done();
  }

  async rimuoviUtente(userId) {
    const connection = await getConnection();
    const sql = 'DELETE FROM "user" WHERE id = $1';
    await execute(connection, sql, [userId]);
    connection.done();
  }

  async addProduct(product) {
    const connection = await getConnection();
    const sql = `
  INSERT INTO products
    (name, brand_id, category_id, description, price, promo, image_url, bloccato, in_vetrina, disponibilita, sconto)
  VALUES
    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  RETURNING *`;
const params = [
  product.name,
  product.brand_id,
  product.category_id,
  product.description,
  product.price,
  product.promo,
  product.image_url,
  product.bloccato || false,
  product.in_vetrina || false,
  product.disponibilita || 0,
  product.sconto || 0
];
    const result = await execute(connection, sql, params);
    connection.done();
    return result;
  }


  async updateProduct(id, product) {
    const connection = await getConnection();
   const sql = `
  UPDATE products SET
    name = $1,
    brand_id = $2,
    category_id = $3,
    description = $4,
    price = $5,
    promo = $6,
    image_url = $7,
    bloccato = $8,
    in_vetrina = $9,
    disponibilita = $10,
    sconto = $11
  WHERE id = $12
  RETURNING *`;
const params = [
  product.name,
  product.brand_id,
  product.category_id,
  product.description,
  product.price,
  product.promo,
  product.image_url,
  product.bloccato,
  product.in_vetrina,
  product.disponibilita,
  product.sconto || 0,
  id
];
    const result = await execute(connection, sql, params);
    connection.done();
    return result;
  }
  // elimina prodotto
 async deleteProduct(id) {
  const connection = await getConnection();
  try {
    const sql = 'UPDATE products SET bloccato = true WHERE id = $1';
    await execute(connection, sql, [id]);
    connection.done();
  } catch (err) {
    connection.done();
    throw err;
  }
}

  // Blocca/Sblocca prodotto
  async setProductBlocked(id, blocked) {
    const connection = await getConnection();
    const sql = 'UPDATE products SET bloccato = $1 WHERE id = $2';
    await execute(connection, sql, [blocked, id]);
    connection.done();
  }

  // Aggiorna disponibilità magazzino
  async updateProductStock(id, disponibilita) {
    const connection = await getConnection();
    const sql = 'UPDATE products SET disponibilita = $1 WHERE id = $2 RETURNING *';
    const result = await execute(connection, sql, [disponibilita, id]);
    connection.done();
    return result;
  }

 

  async getAllCategories() {
  const connection = await getConnection();
  const sql = 'SELECT id, name FROM category';
  const result = await execute(connection, sql, []);
  connection.done();
  return result;
}

async getAllBrands() {
  const connection = await getConnection();
  const sql = 'SELECT id, name FROM brand';
  const result = await execute(connection, sql, []);
  connection.done();
  return result;
}
async getAllProducts() {
  const connection = await getConnection();
  const sql = `
    SELECT p.*, c.name AS category_name, b.name AS brand_name
    FROM products p
    LEFT JOIN category c ON p.category_id = c.id
    LEFT JOIN brand b ON p.brand_id = b.id
  `;
  const result = await execute(connection, sql, []);
  connection.done();
  return result;
}

}

module.exports = new AdminDAO();