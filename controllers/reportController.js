const Trip = require('../models/trip');
const Bus = require('../models/bus');
const Driver = require('../models/driver');
const Certificate = require('../models/certificate');

const reportController = {
  // Get trip reports for admin
  async getTripReports(req, res) {
    try {
      const admin_id = req.user.admin_id;
      const { date, bus_id, driver_id, month, year } = req.query;
      
      const filters = {};
      if (date) filters.date = date;
      if (month) filters.month = month;
      if (year) filters.year = year;
      if (bus_id) filters.bus_id = bus_id;
      if (driver_id) filters.driver_id = driver_id;
      
      const trips = await Trip.findByAdminId(admin_id, filters);
      
      // Calculate statistics
      const totalTrips = trips.length;
      const completedTrips = trips.filter(trip => trip.status === 'Completed').length;
      const activeTrips = trips.filter(trip => trip.status === 'Active').length;
      
      res.json({ 
        trips, 
        statistics: {
          total: totalTrips,
          completed: completedTrips,
          active: activeTrips
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Get trip reports for supervisor
  async getSupervisorTripReports(req, res) {
    try {
      const supervisor_id = req.user.id;
      const { date, bus_id, driver_id, month, year } = req.query;
      
      const filters = {};
      if (date) filters.date = date;
      if (month) filters.month = month;
      if (year) filters.year = year;
      if (bus_id) filters.bus_id = bus_id;
      if (driver_id) filters.driver_id = driver_id;
      
      const trips = await Trip.findBySupervisorId(supervisor_id, filters);
      
      // Calculate statistics
      const totalTrips = trips.length;
      const completedTrips = trips.filter(trip => trip.status === 'Completed').length;
      const activeTrips = trips.filter(trip => trip.status === 'Active').length;
      
      res.json({ 
        trips, 
        statistics: {
          total: totalTrips,
          completed: completedTrips,
          active: activeTrips
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Get certificate reports for admin
  async getCertificateReports(req, res) {
    try {
      const admin_id = req.user.admin_id;
      
      // Update certificate statuses based on expiry date
      await Certificate.updateExpiryStatus();
      
      const certificates = await Certificate.findByAdminId(admin_id);
      
      // Calculate statistics
      const totalCertificates = certificates.length;
      const validCertificates = certificates.filter(cert => cert.status === 'Valid').length;
      const expiredCertificates = certificates.filter(cert => cert.status === 'Expired').length;
      
      // Check for certificates expiring soon (within 30 days)
      const soonToExpireCertificates = certificates.filter(cert => {
        if (cert.status === 'Valid') {
          const expiryDate = new Date(cert.expiry_date);
          const today = new Date();
          const diffTime = expiryDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 30 && diffDays >= 0;
        }
        return false;
      });
      
      res.json({ 
        certificates, 
        statistics: {
          total: totalCertificates,
          valid: validCertificates,
          expired: expiredCertificates,
          expiringSoon: soonToExpireCertificates.length
        },
        soonToExpire: soonToExpireCertificates
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Get dashboard statistics for admin
  async getAdminDashboardStats(req, res) {
    try {
      const admin_id = req.user.admin_id;
      
      // Get counts for different entities
      const buses = await Bus.findByAdminId(admin_id);
      const drivers = await Driver.findByAdminId(admin_id);
      
      // Update certificate statuses and get counts
      await Certificate.updateExpiryStatus();
      const certificates = await Certificate.findByAdminId(admin_id);
      
      // Get recent trips
      const recentTrips = await Trip.findByAdminId(admin_id);
      const completedTrips = recentTrips.filter(trip => trip.status === 'Completed').length;
      const activeTrips = recentTrips.filter(trip => trip.status === 'Active').length;
      
      // Get certificates expiring soon
      const soonToExpireCertificates = certificates.filter(cert => {
        if (cert.status === 'Valid') {
          const expiryDate = new Date(cert.expiry_date);
          const today = new Date();
          const diffTime = expiryDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 30 && diffDays >= 0;
        }
        return false;
      });
      
      res.json({
        buses: buses.length,
        drivers: drivers.length,
        certificates: certificates.length,
        activeTrips,
        completedTrips,
        expiredCertificates: certificates.filter(cert => cert.status === 'Expired').length,
        expiringSoonCertificates: soonToExpireCertificates.length
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Get dashboard statistics for supervisor
  async getSupervisorDashboardStats(req, res) {
    try {
      const supervisor_id = req.user.id;
      
      // Get recent trips for this supervisor
      const recentTrips = await Trip.findBySupervisorId(supervisor_id);
      const completedTrips = recentTrips.filter(trip => trip.status === 'Completed').length;
      const activeTrips = recentTrips.filter(trip => trip.status === 'Active').length;
      
      res.json({
        trips: recentTrips.length,
        activeTrips,
        completedTrips
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = reportController;