function toLocalISOString(date) {
    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    const localDate = new Date(date.getTime() - offsetMs);
    const isoString = localDate.toISOString();
    return isoString;
}

// Crear una nueva fecha y ajustar la hora
const fechaActual = new Date();
fechaActual.setHours(fechaActual.getHours() + 1); // Sumar una hora

const fechaLocalISO = toLocalISOString(fechaActual);

module.exports = { fechaLocalISO };
