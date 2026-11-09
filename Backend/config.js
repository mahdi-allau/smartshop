require('dotenv').config();//require dotenv per caricare le variabili d'ambiente dal file .env

const config={
	db:{
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		database: process.env.DB_NAME,
	}
}; 

module.exports = config;

