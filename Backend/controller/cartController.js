
const cartDAO = require('../DAO/cartDAO');
const productDAO = require('../DAO/productDAO');

exports.getCart = async (req, res) => {
  const userId = req.user.id;
  const items = await cartDAO.getCartByUser(userId);
  res.json(items);
};

exports.addOrUpdateItem = async (req, res) => {
  const userId = req.user.id;
  const { prodottoId, quantita } = req.body;
  // Controlla disponibilità
  const prodotto = await productDAO.getProductById(prodottoId);
  if (!prodotto || quantita > prodotto.disponibilita) {
    return res.status(400).json({ error: 'Quantità non disponibile' });
  }
  const item = await cartDAO.addOrUpdateCartItem(userId, prodottoId, quantita);
  res.json(item);
};

exports.updateItemQuantity = async (req, res) => {
  const userId = req.user.id;
  const { prodottoId, quantita } = req.body;
  const prodotto = await productDAO.getProductById(prodottoId);
  if (!prodotto || quantita > prodotto.disponibilita) {
    return res.status(400).json({ error: 'Quantità non disponibile' });
  }
  const item = await cartDAO.setCartItemQuantity(userId, prodottoId, quantita);
  res.json(item);
};

exports.removeItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const prodottoId = parseInt(req.params.prodottoId, 10);
    if (!userId || isNaN(prodottoId)) {
      return res.status(400).json({ error: 'Parametri mancanti o non validi' });
    }
    await cartDAO.removeCartItem(userId, prodottoId);
    res.json({ success: true });
  } catch (err) {
    console.error('Errore removeItem:', err);
    res.status(500).json({ error: 'Errore interno server' });
  }
};

exports.clearCart = async (req, res) => {
  const userId = req.user.id;
  await cartDAO.clearCart(userId);
  res.json({ message: 'Carrello svuotato' });
};