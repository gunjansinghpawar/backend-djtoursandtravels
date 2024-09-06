const express = require('express');
const router = express.Router();
const {
    getAllTrips,
    getTripById,
    createTrip,
    updateTrip,
    deleteTrip,
} = require('../controllers/TripController');

router.get('/trips', getAllTrips); // Fetch all trips
router.get('/trips/:id', getTripById); // Fetch trip by ID
router.post('/createTrips', createTrip); // Create a new trip
router.put('/updateTrips/:id', updateTrip); // Update an existing trip
router.delete('/deletetrips/:id', deleteTrip); // Delete a trip by ID

module.exports = router;
