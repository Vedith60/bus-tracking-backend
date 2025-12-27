const db = require('../db');

const Bus = {
  async create(busData) {
    const { bus_number, admin_id } = busData;
    const query = 'INSERT INTO buses (bus_number, admin_id) VALUES (?, ?)';
    const [result] = await db.execute(query, [bus_number, admin_id]);
    return result;
  },
  
  async findById(id) {
    const query = 'SELECT * FROM buses WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  },
  
  async findByAdminId(admin_id) {
    const query = 'SELECT * FROM buses WHERE admin_id = ?';
    const [rows] = await db.execute(query, [admin_id]);
    return rows;
  },
  
  async update(id, busData) {
    const { bus_number } = busData;
    const query = 'UPDATE buses SET bus_number = ? WHERE id = ?';
    const [result] = await db.execute(query, [bus_number, id]);
    return result;
  },
  
  async delete(id) {
    const query = 'DELETE FROM buses WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result;
  }
};

module.exports = Bus;