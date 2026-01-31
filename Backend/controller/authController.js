
const bcrypt = require('bcrypt');
const userDAO = require('../DAO/userDAO');
const jwt = require('jsonwebtoken');

// REGISTRAZIONE
exports.register = async (req, res) => {
  try {
    const { nome, cognome, email, password, telefono, data_nascita, sesso, ruolo } = req.body;
    if (!nome || !cognome || !email || !password) {
      return res.status(400).json({ error: 'Campi obbligatori mancanti' });
    }

    const existing = await userDAO.findByEmail(email);
    if (existing) return res.status(409).json({ error: 'Email già registrata' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userDAO.createUser({
      nome,
      cognome,
      email,
      password: hashedPassword,
      telefono,
      data_nascita,
      sesso,
      ruolo
    });

    res.status(201).json({ message: 'Utente registrato', user });
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userDAO.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Credenziali non valide' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Credenziali non valide' });

    // Genera JWT 
    const token = jwt.sign(
      { id: user.id, ruolo: user.ruolo },
      process.env.JWT_SECRET || 'supersecret',
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Login effettuato',
      user: { id: user.id, nome: user.nome, ruolo: user.ruolo },
      token
    });
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
};

exports.getUtente = async (req, res) => {
  const userId = req.user.id;
  try {
    const utente = await userDAO.getUserById(userId);
    if (!utente) return res.status(404).json({ error: 'Utente non trovato' });
    // Restituisci solo i dati necessari
    res.json({
      nome: utente.nome,
      cognome: utente.cognome,
      email: utente.email
    });
  } catch (err) {
    console.error('Errore getUtente:', err);
    res.status(500).json({ error: 'Errore server' });
  }
};

exports.updateUtente = async (req, res) => {
  const userId = req.user.id;
  const { nome, cognome, email, data_nascita, password } = req.body;
  try {
    await userDAO.updateUserById(userId, { nome, cognome, email, data_nascita, password });
    res.json({ message: 'Dati aggiornati' });
  } catch (err) {
    console.error('Errore updateUtente:', err);
    res.status(500).json({ error: 'Errore server' });
  }
};

