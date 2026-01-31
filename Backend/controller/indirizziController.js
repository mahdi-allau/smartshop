const indirizziDAO = require('../DAO/indirizziDAO');

exports.aggiungiIndirizzo = async (req, res) => {
  const userId = req.user.id;
  const { nome_destinatario, indirizzo, citta, cap, paese, telefono } = req.body;
  const esistente = await indirizziDAO.trovaIndirizzo(userId, nome_destinatario, indirizzo, citta, cap, paese, telefono);
if (esistente) {
  return res.status(409).json({ id: esistente.id, indirizzo: esistente });
}
  if (!nome_destinatario || !indirizzo || !citta || !cap || !paese || !telefono) {
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
  }
  const nuovoIndirizzo = await indirizziDAO.aggiungiIndirizzo(userId, nome_destinatario, indirizzo, citta, cap, paese, telefono);
  res.json(nuovoIndirizzo);
};

exports.aggiornaIndirizzo = async (req, res) => {
  const userId = req.user.id;
  const { id, nome_destinatario, indirizzo, citta, cap, paese, telefono } = req.body;
  if (!id || !nome_destinatario || !indirizzo || !citta || !cap || !paese || !telefono) {
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
  }
  const indirizzoAggiornato = await indirizziDAO.aggiornaIndirizzo(id, userId, nome_destinatario, indirizzo, citta, cap, paese, telefono);
  if (!indirizzoAggiornato) {
    return res.status(404).json({ error: 'Indirizzo non trovato o non autorizzato' });
  }
  res.json(indirizzoAggiornato);
};

exports.eliminaIndirizzo = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const deleted = await indirizziDAO.eliminaIndirizzo(id, userId);
  if (!deleted) {
    return res.status(404).json({ error: 'Indirizzo non trovato o non autorizzato' });
  }
  res.json({ message: 'Indirizzo eliminato' });
};

exports.setIndirizzoPredefinito = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.body;
  const updated = await indirizziDAO.setPredefinito(userId, id);
  if (!updated) return res.status(404).json({ error: 'Indirizzo non trovato' });
  res.json(updated);
};



exports.getIndirizzi = async (req, res) => {
  const userId = req.user.id;
  const indirizzi = await indirizziDAO.getIndirizziByUser(userId);
  res.json(indirizzi);
};