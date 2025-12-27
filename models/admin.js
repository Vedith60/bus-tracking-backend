const db = require('../db');

const Admin = {
  async create(adminData) {
    const { name, email, password, is_super_admin = 0 } = adminData;
    const query = 'INSERT INTO admins (name, email, password, is_super_admin) VALUES (?, ?, ?, ?)';
    const [result] = await db.execute(query, [name, email, password, is_super_admin]);
    return result;
  },
  
  async findByEmail(email) {
    const query = 'SELECT * FROM admins WHERE email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  },
  
  async findById(id) {
    const query = 'SELECT id, name, email, is_super_admin FROM admins WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  },
  
  // Find admin by ID including super admin status
  async findByIdWithSuperStatus(id) {
    const query = 'SELECT id, name, email, is_super_admin FROM admins WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  },
  
  // Get all admins (for super admin use)
  async getAllAdmins() {
    const query = 'SELECT id, name, email, is_super_admin, created_at FROM admins ORDER BY created_at DESC';
    const [rows] = await db.execute(query);
    return rows;
  },
  
  // Delete admin by ID (for super admin use)
  async deleteById(id) {
    const query = 'DELETE FROM admins WHERE id = ? AND is_super_admin = 0'; // Prevent deleting other super admins
    const [result] = await db.execute(query, [id]);
    return result;
  },
  
  // Check if user is super admin
  async isSuperAdmin(id) {
    const query = 'SELECT is_super_admin FROM admins WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0] && rows[0].is_super_admin === 1;
  }
};

module.exports = Admin;