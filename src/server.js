require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

if (!process.env.JWT_SECRET) {
  console.error('Defina JWT_SECRET no .env');
  process.exit(1);
}

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // cria as tabelas se não existirem
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`API rodando em http://localhost:${port}`));
  } catch (err) {
    console.error('Falha ao iniciar:', err);
    process.exit(1);
  }
})();
