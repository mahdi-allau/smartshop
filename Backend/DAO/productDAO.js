const { getConnection, execute } = require('../connection/DB');

class ProductDao {
  async getAllProducts() {
    const connection = await getConnection();
    const sql = 'SELECT * FROM products where bloccato = false';
    const products = await execute(connection, sql, []);
    connection.done();
    return products;
  }

  async getProductById(id) {
    const connection = await getConnection();
    const sql = `
    SELECT p.*, b.name AS brand, c.name AS category
    FROM products p
    LEFT JOIN brand b ON p.brand_id = b.id
    LEFT JOIN category c ON p.category_id = c.id
    WHERE p.id = $1
    AND p.bloccato = false
  `;
    const products = await execute(connection, sql, [id]);
    connection.done();
    return products[0];
  }

  async getProductsByCategory(category) {
    const connection = await getConnection();
    const sql = 'SELECT * FROM products WHERE category_id = $1 AND bloccato = false';
    const products = await execute(connection, sql, [category]);
    connection.done();
    return products;
  }

  async getProductsByBrand(brand) {
    const connection = await getConnection();
    const sql = 'SELECT * FROM products WHERE brand_id = $1 AND bloccato = false';
    const products = await execute(connection, sql, [brand]);
    connection.done();
    return products;
  }

  async searchProducts(query) {
    const connection = await getConnection();
    const sql = `SELECT * FROM products WHERE 
      (LOWER(name) LIKE $1 OR LOWER(description) LIKE $1) and bloccato = false`;
    const products = await execute(connection, sql, [`%${query.toLowerCase()}%`]);
    connection.done();
    return products;
  }
  
  async getVetrinaProducts() {
  const connection = await getConnection();
  const sql = 'SELECT * FROM products WHERE in_vetrina = true AND bloccato = false';
  const prodotti = await execute(connection, sql, []);
  connection.done();
  return prodotti;
}

 async getAllCategories() {
    const connection = await getConnection();
    const sql = 'SELECT * FROM category';
    const categories = await execute(connection, sql, []);
    connection.done();
    return categories;
  }

  async getAllBrands() {
    const connection = await getConnection();
    const sql = 'SELECT * FROM brand';
    const brands = await execute(connection, sql, []);
    connection.done();
    return brands;
  }
  
  async updateDisponibilita(prodottoId, nuovaDisponibilita) {
  const connection = await getConnection();
  const sql = 'UPDATE products SET disponibilita = $1 WHERE id = $2';
  await execute(connection, sql, [nuovaDisponibilita, prodottoId]);
  connection.done();
}

}

module.exports = new ProductDao();