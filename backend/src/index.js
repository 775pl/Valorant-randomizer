const app = require('./app');

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});