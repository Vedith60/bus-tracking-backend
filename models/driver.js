const db = require('../db');

const Driver = {
  async create(driverData) {
    const { admin_id, name, phone_number, license_number, license_expiry_date } = driverData;
    const query = 'INSERT INTO drivers (admin_id, name, phone_number, license_number, license_expiry_date) VALUES (?, ?, ?, ?, ?)';
    const [result] = await db.execute(query, [admin_id, name, phone_number, license_number, license_expiry_date]);
    return result;
  },
  
  async findById(id) {
    const query = 'SELECT * FROM drivers WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  },
  
  async findByAdminId(admin_id) {
    const query = 'SELECT * FROM drivers WHERE admin_id = ? ORDER BY name';
    const [rows] = await db.execute(query, [admin_id]);
    return rows;
  },
  
  async update(id, driverData) {
    const { name, phone_number, license_number, license_expiry_date } = driverData;
    const query = 'UPDATE drivers SET name = ?, phone_number = ?, license_number = ?, license_expiry_date = ? WHERE id = ?';
    const [result] = await db.execute(query, [name, phone_number, license_number, license_expiry_date, id]);
    return result;
  },
  
  async delete(id) {
    const query = 'DELETE FROM drivers WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result;
  }
};

module.exports = Driver;