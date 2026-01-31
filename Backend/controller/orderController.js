
const orderDAO = require('../DAO/orderDAO');
const cartDAO = require('../DAO/cartDAO');
const productDAO = require('../DAO/productDAO');

exports.createOrder = async (req, res) => {
  const userId = req.user.id;
  const indirizzoId  = req.body.spedizione.indirizzo_id;
  const prodotti = req.body.prodotti;

  if (!prodotti || !prodotti.length) return res.status(400).json({ error: 'Nessun prodotto da ordinare' });

  let disponibilitaMap = {};
  let totale = 0;

  for (const item of prodotti) {
   
    let prodottoDb = await productDAO.getProductById(item.prodotto_id);
   
    if (Array.isArray(prodottoDb)) prodottoDb = prodottoDb[0];
 
    if (prodottoDb && prodottoDb.rows) prodottoDb = prodottoDb.rows[0];

    if (!prodottoDb) {
      return res.status(400).json({ error: `Prodotto con id ${item.prodotto_id} non trovato` });
    }
    if (item.quantita > prodottoDb.disponibilita) {
      return res.status(400).json({ error: `Prodotto ${prodottoDb.name} non disponibile in quantità richiesta` });
    }
    totale += item.prezzo_unitario * item.quantita;
    disponibilitaMap[item.prodotto_id] = prodottoDb.disponibilita;
  }


  const ordine = await orderDAO.createOrder(userId, totale, indirizzoId, 'In elaborazione');

  for (const item of prodotti) {
    await orderDAO.addOrderItem(ordine.id, item.prodotto_id, item.quantita, item.prezzo_unitario);
    await productDAO.updateDisponibilita(item.prodotto_id, disponibilitaMap[item.prodotto_id] - item.quantita);
  }

  await cartDAO.clearCart(userId);

  res.json({ message: 'Ordine creato', ordineId: ordine.id });
};

exports.getUserOrders = async (req, res) => {
  const userId = req.user.id;
  const orders = await orderDAO.getOrdiniByUser(userId);
  // Per ogni ordine, aggiungi i prodotti
  for (const ordine of orders) {
    ordine.items = await orderDAO.getOrderItems(ordine.id);
  }
  res.json(orders);
};

exports.getOrderById = async (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;
  // Recupera tutti gli ordini dell'utente
  const orders = await orderDAO.getOrdiniByUser(userId);
  // Trova solo quello richiesto
  const ordine = orders.find(o => o.id == Number(orderId));
  if (!ordine) return res.status(404).json({ error: 'Ordine non trovato' });

  ordine.prodotti = await orderDAO.getOrderItems(ordine.id);
  ordine.indirizzo = [
    ordine.nome_destinatario,
    ordine.indirizzo,
    `${ordine.cap}, ${ordine.citta}, ${ordine.paese}`,
    `Tel: ${ordine.telefono}`
  ].filter(Boolean).join(' - ');

  res.json(ordine);
};
