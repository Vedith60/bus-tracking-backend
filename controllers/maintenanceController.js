const Maintenance = require('../models/maintenance');
const Bus = require('../models/bus');
const Driver = require('../models/driver');

const maintenanceController = {
  // Create a new maintenance record
  async createMaintenance(req, res) {
    try {
      const { bus_id, driver_id, subject, description, cost, maintenance_date } = req.body;
      const admin_id = req.user.admin_id;

      // Validate required fields
      if (!bus_id || !subject || !maintenance_date) {
        return res.status(400).json({ message: 'Bus ID, subject, and maintenance date are required' });
      }

      // Verify that the bus belongs to the admin
      const bus = await Bus.findById(bus_id);
      if (!bus || bus.admin_id !== admin_id) {
        return res.status(404).json({ message: 'Bus not found or does not belong to this admin' });
      }

      // Verify driver if provided
      if (driver_id) {
        const driver = await Driver.findById(driver_id);
        if (!driver || driver.admin_id !== admin_id) {
          return res.status(404).json({ message: 'Driver not found or does not belong to this admin' });
        }
      }

      const result = await Maintenance.create({
        admin_id,
        bus_id,
        driver_id: driver_id || null,
        subject,
        description: description || null,
        cost: cost || null,
        maintenance_date
      });

      res.status(201).json({ 
        message: 'Maintenance record created successfully', 
        maintenanceId: result.insertId 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get all maintenance records for an admin
  async getMaintenance(req, res) {
    try {
      const admin_id = req.user.admin_id;
      
      const maintenanceRecords = await Maintenance.findByAdminId(admin_id);
      
      res.json({ maintenance: maintenanceRecords });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get all maintenance records for a supervisor
  async getMaintenanceForSupervisor(req, res) {
    try {
      const supervisor_id = req.user.id;
      
      const maintenanceRecords = await Maintenance.findBySupervisorId(supervisor_id);
      
      res.json({ maintenance: maintenanceRecords });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get a specific maintenance record
  async getMaintenanceById(req, res) {
    try {
      const { id } = req.params;
      const admin_id = req.user.admin_id;

      const maintenance = await Maintenance.findById(id);
      
      // Verify that the maintenance record belongs to the admin
      if (!maintenance || maintenance.admin_id !== admin_id) {
        return res.status(404).json({ message: 'Maintenance record not found' });
      }

      res.json({ maintenance });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update a maintenance record
  async updateMaintenance(req, res) {
    try {
      const { id } = req.params;
      const { bus_id, driver_id, subject, description, cost, maintenance_date } = req.body;
      const admin_id = req.user.admin_id;

      // Validate required fields
      if (!bus_id || !subject || !maintenance_date) {
        return res.status(400).json({ message: 'Bus ID, subject, and maintenance date are required' });
      }

      const maintenance = await Maintenance.findById(id);
      
      // Verify that the maintenance record belongs to the admin
      if (!maintenance || maintenance.admin_id !== admin_id) {
        return res.status(404).json({ message: 'Maintenance record not found' });
      }

      // Verify that the bus belongs to the admin
      const bus = await Bus.findById(bus_id);
      if (!bus || bus.admin_id !== admin_id) {
        return res.status(404).json({ message: 'Bus not found or does not belong to this admin' });
      }

      // Verify driver if provided
      if (driver_id) {
        const driver = await Driver.findById(driver_id);
        if (!driver || driver.admin_id !== admin_id) {
          return res.status(404).json({ message: 'Driver not found or does not belong to this admin' });
        }
      }

      await Maintenance.update(id, {
        bus_id,
        driver_id: driver_id || null,
        subject,
        description: description || null,
        cost: cost || null,
        maintenance_date
      });

      res.json({ message: 'Maintenance record updated successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Delete a maintenance record
  async deleteMaintenance(req, res) {
    try {
      const { id } = req.params;
      const admin_id = req.user.admin_id;

      const maintenance = await Maintenance.findById(id);
      
      // Verify that the maintenance record belongs to the admin
      if (!maintenance || maintenance.admin_id !== admin_id) {
        return res.status(404).json({ message: 'Maintenance record not found' });
      }

      await Maintenance.delete(id);

      res.json({ message: 'Maintenance record deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Create a new maintenance record for supervisor
  async createMaintenanceForSupervisor(req, res) {
    try {
      const { bus_id, driver_id, subject, description, cost, maintenance_date } = req.body;
      const admin_id = req.user.admin_id; // Supervisor's admin ID

      // Validate required fields
      if (!bus_id || !subject || !maintenance_date) {
        return res.status(400).json({ message: 'Bus ID, subject, and maintenance date are required' });
      }

      // Verify that the bus belongs to the supervisor's admin
      const bus = await Bus.findById(bus_id);
      if (!bus || bus.admin_id !== admin_id) {
        return res.status(404).json({ message: 'Bus not found or does not belong to this admin' });
      }

      // Verify driver if provided
      if (driver_id) {
        const driver = await Driver.findById(driver_id);
        if (!driver || driver.admin_id !== admin_id) {
          return res.status(404).json({ message: 'Driver not found or does not belong to this admin' });
        }
      }

      const result = await Maintenance.create({
        admin_id,
        bus_id,
        driver_id: driver_id || null,
        subject,
        description: description || null,
        cost: cost || null,
        maintenance_date
      });

      res.status(201).json({ 
        message: 'Maintenance record created successfully', 
        maintenanceId: result.insertId 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = maintenanceController;