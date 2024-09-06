const Trip = require('../models/Trip');

// Fetch all trips
exports.getAllTrips = async (req, res) => {
    try {
        const trips = await Trip.find();
        if (trips.length === 0) {
            return res.status(404).json({ message: 'No trips found' });
        }
        res.status(200).json(trips);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Fetch a specific trip by ID
exports.getTripById = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        res.status(200).json(trip);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Create a new trip
exports.createTrip = async (req, res) => {
    const { 
        name, email, phone, destination, vehicleNo, vehicleType, driverName, acType, 
        startingKm, endingKm, reportedTime, releasedTime, price, tollAmount 
    } = req.body;

    // Basic validation
    if (!name || !email || !phone || !destination || !vehicleNo || !vehicleType || !driverName) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const trip = new Trip({ 
            name, email, phone, destination, vehicleNo, vehicleType, driverName, acType, 
            startingKm, endingKm, reportedTime, releasedTime, price, tollAmount 
        });
        await trip.save();
        res.status(201).json({ message: 'Trip created successfully', trip });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to create trip', error: error.message });
    }
};

// Update an existing trip
exports.updateTrip = async (req, res) => {
    const { name, email, vehicleNo, vehicleType, driverName, acType, startingKm, endingKm, reportedTime, releasedTime, price, tollAmount } = req.body;

    // Basic validation
    if (!name || !email || !vehicleNo || !vehicleType || !driverName) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const trip = await Trip.findByIdAndUpdate(req.params.id, { 
            name, email, vehicleNo, vehicleType, driverName, acType, 
            startingKm, endingKm, reportedTime, releasedTime, price, tollAmount 
        }, { new: true });

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        res.status(200).json({ message: 'Trip updated successfully', trip });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to update trip', error: error.message });
    }
};

// Delete a trip
exports.deleteTrip = async (req, res) => {
    try {
        const trip = await Trip.findByIdAndDelete(req.params.id);

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        res.status(200).json({ message: 'Trip deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
