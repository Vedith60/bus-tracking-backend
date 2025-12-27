const Admin = require('../models/admin');
const Supervisor = require('../models/supervisor');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');
const db = require('../db'); // Added for password change functionality

const authController = {
  // Admin registration
  async registerAdmin(req, res) {
    try {
      const { name, email, password } = req.body;
      
      // Check if admin already exists
      const existingAdmin = await Admin.findByEmail(email);
      if (existingAdmin) {
        return res.status(400).json({ message: 'Admin with this email already exists' });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create admin
      const result = await Admin.create({ name, email, password: hashedPassword });
      
      res.status(201).json({ 
        message: 'Admin registered successfully', 
        adminId: result.insertId 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Admin login
  async loginAdmin(req, res) {
    try {
      const { email, password } = req.body;
      
      // Find admin by email
      const admin = await Admin.findByEmail(email);
      if (!admin) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
      
      // Compare password
      const isMatch = await comparePassword(password, admin.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
      
      // Determine role based on super admin status
      const role = admin.is_super_admin ? 'super_admin' : 'admin';
      
      // Generate JWT token
      const token = generateToken({ 
        id: admin.id, 
        email: admin.email, 
        role: role, 
        admin_id: admin.id 
      });
      
      res.json({ 
        message: 'Login successful', 
        token,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: role
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Supervisor login
  async loginSupervisor(req, res) {
    try {
      const { email, password } = req.body;
      
      // Find supervisor by email
      const supervisor = await Supervisor.findByEmail(email);
      if (!supervisor) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
      
      // Compare password
      const isMatch = await comparePassword(password, supervisor.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
      
      // Generate JWT token
      const token = generateToken({ 
        id: supervisor.id, 
        email: supervisor.email, 
        role: 'supervisor', 
        admin_id: supervisor.admin_id 
      });
      
      res.json({ 
        message: 'Login successful', 
        token,
        user: {
          id: supervisor.id,
          name: supervisor.name,
          email: supervisor.email,
          role: 'supervisor',
          admin_id: supervisor.admin_id
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Get current user profile
  async getProfile(req, res) {
    try {
      if (req.user.role === 'admin' || req.user.role === 'super_admin') {
        const admin = await Admin.findByIdWithSuperStatus(req.user.id);
        if (!admin) {
          return res.status(404).json({ message: 'Admin not found' });
        }
        
        res.json({
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: req.user.role,
          is_super_admin: admin.is_super_admin
        });
      } else if (req.user.role === 'supervisor') {
        const supervisor = await Supervisor.findById(req.user.id);
        if (!supervisor) {
          return res.status(404).json({ message: 'Supervisor not found' });
        }
        
        res.json({
          id: supervisor.id,
          name: supervisor.name,
          email: supervisor.email,
          role: 'supervisor',
          admin_id: supervisor.admin_id
        });
      } else {
        res.status(403).json({ message: 'Unauthorized role' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Change user password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required.' });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
      }

      // Handle different user roles
      if (req.user.role === 'admin' || req.user.role === 'super_admin') {
        // Get the admin details
        const admin = await Admin.findByEmail(req.user.email);
        if (!admin) {
          return res.status(404).json({ message: 'Admin not found' });
        }

        // Verify current password
        const isMatch = await comparePassword(currentPassword, admin.password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Current password is incorrect.' });
        }

        // Hash the new password
        const hashedNewPassword = await hashPassword(newPassword);

        // Update the password in the database
        const query = 'UPDATE admins SET password = ? WHERE id = ?';
        const [result] = await db.execute(query, [hashedNewPassword, req.user.id]);

        if (result.affectedRows === 0) {
          return res.status(500).json({ message: 'Failed to update password.' });
        }

        res.json({ message: 'Password changed successfully.' });
      } else if (req.user.role === 'supervisor') {
        // Get the supervisor details
        const supervisor = await Supervisor.findByEmail(req.user.email);
        if (!supervisor) {
          return res.status(404).json({ message: 'Supervisor not found' });
        }

        // Verify current password
        const isMatch = await comparePassword(currentPassword, supervisor.password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Current password is incorrect.' });
        }

        // Hash the new password
        const hashedNewPassword = await hashPassword(newPassword);

        // Update the password in the database
        const query = 'UPDATE supervisors SET password = ? WHERE id = ?';
        const [result] = await db.execute(query, [hashedNewPassword, req.user.id]);

        if (result.affectedRows === 0) {
          return res.status(500).json({ message: 'Failed to update password.' });
        }

        res.json({ message: 'Password changed successfully.' });
      } else {
        return res.status(403).json({ message: 'Unauthorized role' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = authController;