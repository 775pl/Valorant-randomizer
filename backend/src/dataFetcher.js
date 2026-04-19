const { Pool } = require('pg');
require('dotenv').config(); // Utilisé uniquement pour le développement local
// Vérifiez si DATABASE_URL est défini
if (!process.env.DATABASE_URL) {
  console.error('La variable d\'environnement DATABASE_URL n\'est pas définie.');
  process.exit(1); // Arrêtez l'application si DATABASE_URL n'est pas défini
}
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const fetchAgents = async () => {
  try {
    const query = `
      SELECT name, icon, playable FROM agents;
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Erreur récup données agents:', error);
    throw error;
  }
};
const fetchWeapons = async () => {
  try {
    const query = `
      SELECT name, icon, category, cost FROM weapons;
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Erreur récup données armes:', error);
    throw error;
  }
};
const fetchGears = async () => {
  try {
    const query = `
      SELECT name, icon, category FROM gears;
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Erreur récup données armures:', error);
    throw error;
  }
};
module.exports = {
  fetchAgents,
  fetchWeapons,
  fetchGears,
};