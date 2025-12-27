const db = require('../db');

const Route = {
  async create(routeData) {
    const { admin_id, name, start_point, end_point, distance } = routeData;
    const query = 'INSERT INTO routes (admin_id, name, start_point, end_point, distance) VALUES (?, ?, ?, ?, ?)';
    const [result] = await db.execute(query, [admin_id, name, start_point, end_point, distance || null]);
    return result;
  },
  
  async findById(id) {
    const query = 'SELECT * FROM routes WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  },
  
  async findByAdminId(admin_id) {
    const query = 'SELECT * FROM routes WHERE admin_id = ? ORDER BY name';
    const [rows] = await db.execute(query, [admin_id]);
    return rows;
  },
  
  async update(id, routeData) {
    const { name, start_point, end_point, distance } = routeData;
    const query = 'UPDATE routes SET name = ?, start_point = ?, end_point = ?, distance = ? WHERE id = ?';
    const [result] = await db.execute(query, [name, start_point, end_point, distance, id]);
    return result;
  },
  
  async delete(id) {
    const query = 'DELETE FROM routes WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result;
  }
};

module.exports = Route;