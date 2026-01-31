const adminDAO = require('../DAO/adminDAO');
const orderDAO = require('../DAO/orderDAO');
const fs = require('fs');
const path = require('path');

exports.getAllUsers = async (req, res) => {
  const users = await adminDAO.getAllUsers();
  res.json(users);
};

exports.getOrdersByUser = async (req, res) => {
  const userId = req.params.userId;
  const orders = await orderDAO.getOrdiniByUser(userId);
  res.json(orders);
};

exports.blockUser = async (req, res) => {
  const userId = req.params.userId;
  await adminDAO.blockUser(userId);
  res.json({ message: 'Utente bloccato' });
};

exports.setAdmin = async (req, res) => {
  const userId = req.params.userId;
  const { admin } = req.body;
  await adminDAO.setAdmin(userId, admin);
  res.json({ message: admin ? 'Utente promosso ad admin' : 'Utente declassato a user' });
};

exports.aggiornaStatoOrdine = async (req, res) => {
  const orderId = req.params.orderId;
  const { stato, dettagli_spedizione } = req.body;
  console.log('Ricevuto dal frontend:', { stato, dettagli_spedizione, orderId });
  await orderDAO.aggiornaStatoOrdine(orderId, stato, dettagli_spedizione);
  res.json({ message: 'Stato ordine aggiornato' });
};

exports.rimuoviUtente = async (req, res) => {
  const userId = req.params.userId;
  await adminDAO.rimuoviUtente(userId);
  res.json({ message: 'Utente eliminato' });
};

exports.unblockUser = async (req, res) => {
  const { userId } = req.params;
  try {
    await adminDAO.unblockUser(userId);
    res.status(200).json({ message: 'Utente sbloccato' });
  } catch (err) {
    console.error('Errore nello sblocco utente:', err); 
    res.status(500).json({ error: 'Errore nello sblocco utente' });
  }
};

exports.addProduct = async (req, res) => {
 try {
    if (req.body.imageBase64 && req.body.imageFileName) {
      const buffer = Buffer.from(req.body.imageBase64, 'base64');
      const filePath = path.join(__dirname, '../immagini/prodotti', req.body.imageFileName);
      fs.writeFileSync(filePath, buffer);
      req.body.image_url = req.body.imageFileName;
    }
    delete req.body.imageBase64;
    delete req.body.imageFileName;
    const result = await adminDAO.addProduct(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
try {
    // Salva nuova immagine se presente
    if (req.body.imageBase64 && req.body.imageFileName) {
      const buffer = Buffer.from(req.body.imageBase64, 'base64');
      const filePath = path.join(__dirname, '../immagini/prodotti', req.body.imageFileName);
      fs.writeFileSync(filePath, buffer);
      req.body.image_url = req.body.imageFileName;
    }
    delete req.body.imageBase64;
    delete req.body.imageFileName;
    const result = await adminDAO.updateProduct(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    await adminDAO.deleteProduct(id);
    res.json({ success: true, message: 'Prodotto bloccato' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.setProductBlocked = async (req, res) => {
  try {
    await AdminDAO.setProductBlocked(req.params.id, req.body.bloccato);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProductStock = async (req, res) => {
  try {
    const result = await adminDAO.updateProductStock(req.params.id, req.body.disponibilita);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getCategories = async (req, res) => {
  try {
    const result = await adminDAO.getAllCategories();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBrands = async (req, res) => {
  try {
    const result = await adminDAO.getAllBrands();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const result = await adminDAO.getAllProducts();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



