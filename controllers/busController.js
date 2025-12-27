const Bus = require('../models/bus');
const Certificate = require('../models/certificate');

const busController = {
  // Create a new bus
  async createBus(req, res) {
    try {
      const { bus_number } = req.body;
      const admin_id = req.user.admin_id;
      
      // Check if bus number already exists for this admin
      const existingBuses = await Bus.findByAdminId(admin_id);
      const existingBus = existingBuses.find(bus => bus.bus_number === bus_number);
      if (existingBus) {
        return res.status(400).json({ message: 'Bus with this number already exists' });
      }
      
      const result = await Bus.create({ bus_number, admin_id });
      
      res.status(201).json({ 
        message: 'Bus created successfully', 
        busId: result.insertId 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Get all buses for an admin
  async getBuses(req, res) {
    try {
      const admin_id = req.user.admin_id;
      
      const buses = await Bus.findByAdminId(admin_id);
      
      // Get certificates for each bus
      const busesWithCertificates = await Promise.all(buses.map(async (bus) => {
        const certificates = await Certificate.findByBusId(bus.id);
        return {
          ...bus,
          certificates
        };
      }));
      
      res.json({ buses: busesWithCertificates });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Get a specific bus
  async getBus(req, res) {
    try {
      const { id } = req.params;
      const admin_id = req.user.admin_id;
      
      const bus = await Bus.findById(id);
      
      // Verify that the bus belongs to the admin
      if (!bus || bus.admin_id !== admin_id) {
        return res.status(404).json({ message: 'Bus not found' });
      }
      
      // Get certificates for the bus
      const certificates = await Certificate.findByBusId(bus.id);
      
      res.json({ 
        bus: {
          ...bus,
          certificates
        } 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Update a bus
  async updateBus(req, res) {
    try {
      const { id } = req.params;
      const { bus_number } = req.body;
      const admin_id = req.user.admin_id;
      
      const bus = await Bus.findById(id);
      
      // Verify that the bus belongs to the admin
      if (!bus || bus.admin_id !== admin_id) {
        return res.status(404).json({ message: 'Bus not found' });
      }
      
      await Bus.update(id, { bus_number });
      
      res.json({ message: 'Bus updated successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Delete a bus
  async deleteBus(req, res) {
    try {
      const { id } = req.params;
      const admin_id = req.user.admin_id;
      
      const bus = await Bus.findById(id);
      
      // Verify that the bus belongs to the admin
      if (!bus || bus.admin_id !== admin_id) {
        return res.status(404).json({ message: 'Bus not found' });
      }
      
      await Bus.delete(id);
      
      res.json({ message: 'Bus deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Create a certificate for a bus
  async createCertificate(req, res) {
    try {
      const { id } = req.params; // bus id
      const { certificate_type, certificate_number, expiry_date } = req.body;
      const admin_id = req.user.admin_id;
      
      // Verify that the bus belongs to the admin
      const bus = await Bus.findById(id);
      if (!bus || bus.admin_id !== admin_id) {
        return res.status(404).json({ message: 'Bus not found' });
      }
      
      // Check if certificate already exists for this bus and type
      const existingCertificates = await Certificate.findByBusId(id);
      const existingCert = existingCertificates.find(cert => 
        cert.certificate_type === certificate_type && cert.certificate_number === certificate_number
      );
      if (existingCert) {
        return res.status(400).json({ message: 'Certificate of this type with this number already exists for this bus' });
      }
      
      const result = await Certificate.create({
        bus_id: id,
        admin_id,
        certificate_type,
        certificate_number,
        expiry_date
      });
      
      res.status(201).json({ 
        message: 'Certificate created successfully', 
        certificateId: result.insertId 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Get certificates for an admin
  async getCertificates(req, res) {
    try {
      const admin_id = req.user.admin_id;
      
      // Update certificate statuses based on expiry date
      await Certificate.updateExpiryStatus();
      
      const certificates = await Certificate.findByAdminId(admin_id);
      
      res.json({ certificates });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Update a certificate
  async updateCertificate(req, res) {
    try {
      const { id } = req.params;
      const { certificate_type, certificate_number, expiry_date } = req.body;
      const admin_id = req.user.admin_id;
      
      // Verify that the certificate belongs to the admin
      const certificates = await Certificate.findByAdminId(admin_id);
      const cert = certificates.find(c => c.id == id);
      if (!cert) {
        return res.status(404).json({ message: 'Certificate not found' });
      }
      
      await Certificate.update(id, {
        certificate_type,
        certificate_number,
        expiry_date
      });
      
      res.json({ message: 'Certificate updated successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Delete a certificate
  async deleteCertificate(req, res) {
    try {
      const { id } = req.params;
      const admin_id = req.user.admin_id;
      
      // Verify that the certificate belongs to the admin
      const certificates = await Certificate.findByAdminId(admin_id);
      const cert = certificates.find(c => c.id == id);
      if (!cert) {
        return res.status(404).json({ message: 'Certificate not found' });
      }
      
      await Certificate.delete(id);
      
      res.json({ message: 'Certificate deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = busController;