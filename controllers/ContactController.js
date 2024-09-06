const Contact = require('../models/ContactInfo');

// Get contact information
exports.getContactInfo = async (req, res, next) => {
    try {
        const contacts = await Contact.find();
        if (contacts.length === 0) {
            return res.status(404).json({ message: "No contact information found" });
        }

        const contactInfo = contacts.map(contact => ({
            name: contact.name,
            email: contact.email,
            phone: contact.mobileNumber,
            subject: contact.subject,
            message: contact.message,
            createdAt: contact.date
        }));

        res.status(200).json(contactInfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error });
    }
};

// Add contact information
exports.addContactInfo = async (req, res, next) => {
    const { name, email, mobileNumber, subject, message } = req.body;

    try {
        const contact = new Contact({ name, email, mobileNumber, subject, message });
        await contact.save();

        res.status(201).json({ message: "Contact information saved successfully", contact });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Failed to add contact information", error: error });
    }
};
