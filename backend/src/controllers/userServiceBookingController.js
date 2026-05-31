const ServiceBooking = require('../models/ServiceBooking');

exports.createBooking = async (req, res) => {
  try {
    const { serviceId, serviceName, serviceCategoryId, serviceSubcategoryId, scheduledDate, pricing, serviceAddress } = req.body;
    
    // Create the booking with 'searching' status, leaving providerId undefined for now
    const booking = await ServiceBooking.create({
      userId: req.user.id,
      serviceId, // Note: For dynamic categories this might be optional or map to subcategory, but schema requires it. We'll reuse serviceSubcategoryId for serviceId if needed.
      serviceName,
      serviceCategory: serviceName, // Fallback string
      serviceCategoryId,
      serviceSubcategoryId,
      scheduledDate,
      pricing,
      serviceAddress,
      status: 'searching' // Broadcasting
    });

    res.status(201).json({ message: 'Service booking created and searching for vendors', booking });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create service booking', error: error.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await ServiceBooking.find({ userId: req.user.id })
      .populate('providerId', 'name profilePic phone')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
  }
};
