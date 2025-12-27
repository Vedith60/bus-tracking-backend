const Admin = require('../models/admin');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');
const db = require('../db');

const superAdminController = {
  // Super admin login
  async loginSuperAdmin(req, res) {
    try {
      const { email, password } = req.body;
      
      // Find admin by email
      const admin = await Admin.findByEmail(email);
      if (!admin) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
      
      // Check if the admin is a super admin
      if (!admin.is_super_admin) {
        return res.status(403).json({ message: 'Access denied. Super admin privileges required.' });
      }
      
      // Compare password (assuming password is hashed)
      const isMatch = await comparePassword(password, admin.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
      
      // Generate JWT token
      const token = generateToken({ 
        id: admin.id, 
        email: admin.email, 
        role: 'super_admin', 
        admin_id: admin.id 
      });
      
      res.json({ 
        message: 'Super admin login successful', 
        token,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: 'super_admin'
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create a new admin (only super admin can do this)
  async createAdmin(req, res) {
    try {
      // Verify that the current user is a super admin
      if (!req.user || req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied. Super admin privileges required.' });
      }

      const { name, email, password } = req.body;
      
      // Check if admin already exists
      const existingAdmin = await Admin.findByEmail(email);
      if (existingAdmin) {
        return res.status(400).json({ message: 'Admin with this email already exists' });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create admin (not a super admin by default)
      const result = await Admin.create({ 
        name, 
        email, 
        password: hashedPassword,
        is_super_admin: 0  // Regular admin by default
      });
      
      res.status(201).json({ 
        message: 'Admin created successfully', 
        adminId: result.insertId 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Delete an admin (only super admin can do this)
  async deleteAdmin(req, res) {
    try {
      // Verify that the current user is a super admin
      if (!req.user || req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied. Super admin privileges required.' });
      }

      const { adminId } = req.params;
      
      // Prevent super admin from deleting themselves
      if (req.user.id == adminId) {
        return res.status(400).json({ message: 'Super admin cannot delete themselves.' });
      }

      // Delete the admin (only if they are not a super admin)
      const result = await Admin.deleteById(adminId);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Admin not found or is a super admin (cannot delete super admins).' });
      }
      
      res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get all admins (only super admin can do this)
  async getAllAdmins(req, res) {
    try {
      // Verify that the current user is a super admin
      if (!req.user || req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied. Super admin privileges required.' });
      }

      const admins = await Admin.getAllAdmins();
      
      // Format the response to hide sensitive information
      const formattedAdmins = admins.map(admin => ({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        is_super_admin: admin.is_super_admin,
        created_at: admin.created_at
      }));
      
      res.json({ admins: formattedAdmins });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Reset admin password (only super admin can do this)
  async resetAdminPassword(req, res) {
    try {
      // Verify that the current user is a super admin
      if (!req.user || req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied. Super admin privileges required.' });
      }

      const { adminId } = req.params;
      const { password } = req.body;

      // Validate password
      if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
      }

      // Prevent super admin from resetting their own password through this endpoint
      // (they should use the regular change password flow)
      if (req.user.id == adminId) {
        return res.status(400).json({ message: 'Cannot reset own password through this endpoint. Use the profile settings.' });
      }

      // Hash the new password
      const hashedPassword = await hashPassword(password);

      // Update the admin's password in the database
      const query = 'UPDATE admins SET password = ? WHERE id = ? AND is_super_admin = 0'; // Only allow changing non-super admin passwords
      const [result] = await db.execute(query, [hashedPassword, adminId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Admin not found or is a super admin (cannot reset super admin passwords).' });
      }

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = superAdminController;