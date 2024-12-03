const express = require('express');
const eventsRouter = require('./routes/events');

const app = express();

// Middleware para analizar JSON
app.use(express.json());

// Middleware para las rutas
app.use('/api', eventsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
