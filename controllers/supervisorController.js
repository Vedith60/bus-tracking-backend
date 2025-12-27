const Supervisor = require('../models/supervisor');
const { hashPassword } = require('../utils/auth');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const supervisorController = {
  // Create supervisor (Admin only)
  async createSupervisor(req, res) {
    try {
      const { name, email, password } = req.body;
      const admin_id = req.user.admin_id; // Get admin_id from token
      
      // Check if supervisor already exists
      const existingSupervisor = await Supervisor.findByEmail(email);
      if (existingSupervisor) {
        return res.status(400).json({ message: 'Supervisor with this email already exists' });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create supervisor
      const result = await Supervisor.create({ 
        name, 
        email, 
        password: hashedPassword, 
        admin_id 
      });
      
      res.status(201).json({ 
        message: 'Supervisor created successfully', 
        supervisorId: result.insertId 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Get all supervisors for an admin
  async getSupervisors(req, res) {
    try {
      const admin_id = req.user.admin_id;
      
      const supervisors = await Supervisor.findByAdminId(admin_id);
      
      res.json({ supervisors });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Get a specific supervisor
  async getSupervisor(req, res) {
    try {
      const { id } = req.params;
      const admin_id = req.user.admin_id;
      
      // Verify that the supervisor belongs to the admin
      const supervisor = await Supervisor.findById(id);
      if (!supervisor || supervisor.admin_id !== admin_id) {
        return res.status(404).json({ message: 'Supervisor not found' });
      }
      
      res.json({ supervisor });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = supervisorController;