const Route = require('../models/route');

const routeController = {
  // Create a new route
  async createRoute(req, res) {
    try {
      const { name, start_point, end_point, distance } = req.body;
      const admin_id = req.user.admin_id;
      
      const result = await Route.create({ 
        admin_id, 
        name, 
        start_point, 
        end_point, 
        distance 
      });
      
      res.status(201).json({ 
        message: 'Route created successfully', 
        routeId: result.insertId 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Get all routes for an admin
  async getRoutes(req, res) {
    try {
      const admin_id = req.user.admin_id;
      
      const routes = await Route.findByAdminId(admin_id);
      
      res.json({ routes });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Get a specific route
  async getRoute(req, res) {
    try {
      const { id } = req.params;
      const admin_id = req.user.admin_id;
      
      const route = await Route.findById(id);
      
      // Verify that the route belongs to the admin
      if (!route || route.admin_id !== admin_id) {
        return res.status(404).json({ message: 'Route not found' });
      }
      
      res.json({ route });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Update a route
  async updateRoute(req, res) {
    try {
      const { id } = req.params;
      const { name, start_point, end_point, distance } = req.body;
      const admin_id = req.user.admin_id;
      
      const route = await Route.findById(id);
      
      // Verify that the route belongs to the admin
      if (!route || route.admin_id !== admin_id) {
        return res.status(404).json({ message: 'Route not found' });
      }
      
      await Route.update(id, { name, start_point, end_point, distance });
      
      res.json({ message: 'Route updated successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Delete a route
  async deleteRoute(req, res) {
    try {
      const { id } = req.params;
      const admin_id = req.user.admin_id;
      
      const route = await Route.findById(id);
      
      // Verify that the route belongs to the admin
      if (!route || route.admin_id !== admin_id) {
        return res.status(404).json({ message: 'Route not found' });
      }
      
      await Route.delete(id);
      
      res.json({ message: 'Route deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = routeController;