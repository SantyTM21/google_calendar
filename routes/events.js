const express = require('express');
const moment = require('moment-timezone');
const { google } = require('googleapis');
const { authorize } = require('../utils/auth');
//  llamar fecha actual
// const { fechaLocalISO } = require('../utils/fecha');

const router = express.Router();


// Obtener todos los eventos
router.get('/events', async (req, res) => {
    try {
        const auth = await authorize();
        const calendar = google.calendar({ version: 'v3', auth });
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        });
        const events = response.data.items;
        if (!events || events.length === 0) {
            res.send('No se encontraron eventos próximos.');
            return;
        }
        res.json(events);
    } catch (error) {
        console.error('Error al obtener eventos:', error);
        res.status(500).send('Error al obtener los eventos.');
    }
});

// Obtener eventos de un día específico
router.get('/events/date/:date', async (req, res) => {
    const { date } = req.params;
    const startOfDay = date + 'T00:00:00.000Z';
    const endOfDay = date + 'T23:59:59.999Z';

    try {
        const auth = await authorize();
        const calendar = google.calendar({ version: 'v3', auth });
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: startOfDay,
            timeMax: endOfDay,
            singleEvents: true,
            orderBy: 'startTime',
        });
        const events = response.data.items;
        if (!events || events.length === 0) {
            res.status(404).send('No se encontraron eventos para la fecha especificada.');
            return;
        }
        res.json(events);
    } catch (error) {
        console.error('Error al obtener eventos:', error);
        res.status(500).send('Error al obtener los eventos.');
    }
});

// Obtener un evento por su ID
router.get('/events/id/:eventId', async (req, res) => {
    const { eventId } = req.params;

    try {
        const auth = await authorize();
        const calendar = google.calendar({ version: 'v3', auth });
        const event = await calendar.events.get({
            calendarId: 'primary',
            eventId: eventId,
        });
        res.json(event.data);
    } catch (error) {
        console.error('Error al obtener el evento:', error);
        if (error.code === 404) {
            res.status(404).send('Evento no encontrado.');
        } else {
            res.status(500).send('Error al obtener el evento.');
        }
    }
});


router.post('/events', async (req, res) => {
    const { summary, description, location, startDateTime, endDateTime, attendees } = req.body;

    // Validar campos obligatorios
    if (!summary || !startDateTime || !endDateTime) {
        return res.status(400).send('Los campos "summary", "startDateTime" y "endDateTime" son obligatorios.');
    }

    // Formatear asistentes si se proporcionan
    let formattedAttendees = [];
    if (attendees && Array.isArray(attendees)) {
        formattedAttendees = attendees.map(email => ({ email }));
    }

    // Crear objeto de evento
    const event = {
        summary,
        location,
        description,
        start: {
            dateTime: moment.tz(startDateTime, 'America/Guayaquil').format(),
            timeZone: 'America/Guayaquil',
        },
        end: {
            dateTime: moment.tz(endDateTime, 'America/Guayaquil').format(),
            timeZone: 'America/Guayaquil',
        },
        attendees: formattedAttendees,
        recurringEventId: 'Lalis 2023 schedule',
    };

    try {
        const auth = await authorize();
        const calendar = google.calendar({ version: 'v3', auth });
        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            sendUpdates: 'all',
        });
        res.status(201).json(response.data);
    } catch (error) {
        console.error('Error al crear el evento:', error);
        res.status(500).send('Error al crear el evento.');
    }
});


module.exports = router;
