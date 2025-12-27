const Trip = require('../models/trip');
const Bus = require('../models/bus');
const Driver = require('../models/driver');
const Route = require('../models/route');
const Supervisor = require('../models/supervisor');

const tripController = {
  // Create a new trip
  async createTrip(req, res) {
    try {
      const { bus_id, driver_id, route_id, temporary_route } = req.body;
      const admin_id = req.user.admin_id;
      const supervisor_id = req.user.id; // Supervisor who is creating the trip
      
      // Validate that the bus belongs to the admin
      const bus = await Bus.findById(bus_id);
      if (!bus || bus.admin_id !== admin_id) {
        return res.status(400).json({ message: 'Invalid bus selection' });
      }
      
      // Validate that the driver belongs to the admin
      const driver = await Driver.findById(driver_id);
      if (!driver || driver.admin_id !== admin_id) {
        return res.status(400).json({ message: 'Invalid driver selection' });
      }
      
      // If using a predefined route, validate that it belongs to the admin
      if (route_id) {
        const route = await Route.findById(route_id);
        if (!route || route.admin_id !== admin_id) {
          return res.status(400).json({ message: 'Invalid route selection' });
        }
      }
      
      // Validate that the supervisor belongs to the admin (for supervisors)
      if (req.user.role === 'supervisor') {
        const supervisor = await Supervisor.findById(supervisor_id);
        if (!supervisor || supervisor.admin_id !== admin_id) {
          return res.status(400).json({ message: 'Invalid supervisor' });
        }
      }
      
      // Set trip date to today if not provided
      const trip_date = req.body.trip_date || new Date().toISOString().split('T')[0];
      
      const result = await Trip.create({ 
        admin_id, 
        supervisor_id, 
        bus_id, 
        driver_id, 
        route_id: route_id || null,
        temporary_route: temporary_route || null,
        trip_date,
        start_time: req.body.start_time || null
      });
      
      res.status(201).json({ 
        message: 'Trip created successfully', 
        tripId: result.insertId 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Get all trips for an admin
  async getTrips(req, res) {
    try {
      const admin_id = req.user.admin_id;
      const { date, bus_id, driver_id } = req.query;
      
      const filters = {};
      if (date) filters.date = date;
      if (bus_id) filters.bus_id = bus_id;
      if (driver_id) filters.driver_id = driver_id;
      
      const trips = await Trip.findByAdminId(admin_id, filters);
      
      res.json({ trips });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Get trips for a supervisor
  async getSupervisorTrips(req, res) {
    try {
      const supervisor_id = req.user.id;
      const { date, bus_id, driver_id } = req.query;
      
      const filters = {};
      if (date) filters.date = date;
      if (bus_id) filters.bus_id = bus_id;
      if (driver_id) filters.driver_id = driver_id;
      
      const trips = await Trip.findBySupervisorId(supervisor_id, filters);
      
      res.json({ trips });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Get a specific trip
  async getTrip(req, res) {
    try {
      const { id } = req.params;
      
      let trip;
      if (req.user.role === 'admin') {
        // Admin can access any trip in their admin_id
        const admin_id = req.user.admin_id;
        trip = await Trip.findById(id);
        if (!trip || trip.admin_id !== admin_id) {
          return res.status(404).json({ message: 'Trip not found' });
        }
      } else if (req.user.role === 'supervisor') {
        // Supervisor can only access trips they created
        const supervisor_id = req.user.id;
        trip = await Trip.findById(id);
        if (!trip || trip.supervisor_id !== supervisor_id) {
          return res.status(404).json({ message: 'Trip not found' });
        }
      }
      
      res.json({ trip });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Update a trip (typically to mark as completed)
  async updateTrip(req, res) {
    try {
      const { id } = req.params;
      const { status, start_time, end_time } = req.body;
      
      let trip;
      if (req.user.role === 'admin') {
        // Admin can update any trip in their admin_id
        const admin_id = req.user.admin_id;
        trip = await Trip.findById(id);
        if (!trip || trip.admin_id !== admin_id) {
          return res.status(404).json({ message: 'Trip not found' });
        }
      } else if (req.user.role === 'supervisor') {
        // Supervisor can only update trips they created
        const supervisor_id = req.user.id;
        trip = await Trip.findById(id);
        if (!trip || trip.supervisor_id !== supervisor_id) {
          return res.status(404).json({ message: 'Trip not found' });
        }
      }
      
      // Ensure trip_date is in the correct format (YYYY-MM-DD)
      let formattedTripDate = trip.trip_date;
      if (trip.trip_date instanceof Date) {
        formattedTripDate = trip.trip_date.toISOString().split('T')[0];
      } else if (typeof trip.trip_date === 'string') {
        // If it's already a string, extract just the date part if it contains time
        formattedTripDate = trip.trip_date.split('T')[0];
      }
      
      await Trip.update(id, { status, start_time, end_time, trip_date: formattedTripDate });
      
      res.json({ message: 'Trip updated successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Delete a trip
  async deleteTrip(req, res) {
    try {
      const { id } = req.params;
      
      let trip;
      if (req.user.role === 'admin') {
        // Admin can delete any trip in their admin_id
        const admin_id = req.user.admin_id;
        trip = await Trip.findById(id);
        if (!trip || trip.admin_id !== admin_id) {
          return res.status(404).json({ message: 'Trip not found' });
        }
      } else if (req.user.role === 'supervisor') {
        // Supervisor can only delete trips they created
        const supervisor_id = req.user.id;
        trip = await Trip.findById(id);
        if (!trip || trip.supervisor_id !== supervisor_id) {
          return res.status(404).json({ message: 'Trip not found' });
        }
      }
      
      await Trip.delete(id);
      
      res.json({ message: 'Trip deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = tripController;