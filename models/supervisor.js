const db = require('../db');

const Supervisor = {
  async create(supervisorData) {
    const { name, email, password, admin_id } = supervisorData;
    const query = 'INSERT INTO supervisors (name, email, password, admin_id) VALUES (?, ?, ?, ?)';
    const [result] = await db.execute(query, [name, email, password, admin_id]);
    return result;
  },
  
  async findByEmail(email) {
    const query = 'SELECT * FROM supervisors WHERE email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  },
  
  async findById(id) {
    const query = 'SELECT id, name, email, admin_id FROM supervisors WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  },
  
  async findByAdminId(admin_id) {
    const query = 'SELECT id, name, email FROM supervisors WHERE admin_id = ?';
    const [rows] = await db.execute(query, [admin_id]);
    return rows;
  }
};

module.exports = Supervisor;