const Driver = require('../models/driver');

const driverController = {
  // Create a new driver
  async createDriver(req, res) {
    try {
      const { name, phone_number, license_number, license_expiry_date } = req.body;
      const admin_id = req.user.admin_id;
      
      // Check if driver with same license number already exists for this admin
      const existingDrivers = await Driver.findByAdminId(admin_id);
      const existingDriver = existingDrivers.find(driver => 
        driver.license_number === license_number
      );
      if (existingDriver) {
        return res.status(400).json({ message: 'Driver with this license number already exists' });
      }
      
      const result = await Driver.create({ 
        admin_id, 
        name, 
        phone_number, 
        license_number, 
        license_expiry_date 
      });
      
      res.status(201).json({ 
        message: 'Driver created successfully', 
        driverId: result.insertId 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Get all drivers for an admin
  async getDrivers(req, res) {
    try {
      const admin_id = req.user.admin_id;
      
      const drivers = await Driver.findByAdminId(admin_id);
      
      res.json({ drivers });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Get a specific driver
  async getDriver(req, res) {
    try {
      const { id } = req.params;
      const admin_id = req.user.admin_id;
      
      // Note: We need to get the driver by ID directly and then check if it belongs to the admin
      const driver = await Driver.findById(id);
      
      // Verify that the driver belongs to the admin
      if (!driver || driver.admin_id !== admin_id) {
        return res.status(404).json({ message: 'Driver not found' });
      }
      
      res.json({ driver });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Update a driver
  async updateDriver(req, res) {
    try {
      const { id } = req.params;
      const { name, phone_number, license_number, license_expiry_date } = req.body;
      const admin_id = req.user.admin_id;
      
      const driver = await Driver.findById(id);
      
      // Verify that the driver belongs to the admin
      if (!driver || driver.admin_id !== admin_id) {
        return res.status(404).json({ message: 'Driver not found' });
      }
      
      await Driver.update(id, { name, phone_number, license_number, license_expiry_date });
      
      res.json({ message: 'Driver updated successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Delete a driver
  async deleteDriver(req, res) {
    try {
      const { id } = req.params;
      const admin_id = req.user.admin_id;
      
      const driver = await Driver.findById(id);
      
      // Verify that the driver belongs to the admin
      if (!driver || driver.admin_id !== admin_id) {
        return res.status(404).json({ message: 'Driver not found' });
      }
      
      await Driver.delete(id);
      
      res.json({ message: 'Driver deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = driverController;