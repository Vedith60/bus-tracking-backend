const db = require('../db');

const Maintenance = {
  async create(maintenanceData) {
    const { admin_id, bus_id, driver_id, subject, description, cost, maintenance_date } = maintenanceData;
    const query = `
      INSERT INTO maintenance (admin_id, bus_id, driver_id, subject, description, cost, maintenance_date) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [admin_id, bus_id, driver_id, subject, description, cost, maintenance_date]);
    return result;
  },

  async findAll() {
    const query = `
      SELECT m.*, b.bus_number, d.name as driver_name
      FROM maintenance m
      LEFT JOIN buses b ON m.bus_id = b.id
      LEFT JOIN drivers d ON m.driver_id = d.id
      ORDER BY m.maintenance_date DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  },

  async findByAdminId(admin_id) {
    const query = `
      SELECT m.*, b.bus_number, d.name as driver_name
      FROM maintenance m
      LEFT JOIN buses b ON m.bus_id = b.id
      LEFT JOIN drivers d ON m.driver_id = d.id
      WHERE m.admin_id = ?
      ORDER BY m.maintenance_date DESC
    `;
    const [rows] = await db.execute(query, [admin_id]);
    return rows;
  },

  async findBySupervisorId(supervisor_id) {
    const query = `
      SELECT m.*, b.bus_number, d.name as driver_name
      FROM maintenance m
      LEFT JOIN buses b ON m.bus_id = b.id
      LEFT JOIN drivers d ON m.driver_id = d.id
      WHERE b.admin_id = (
        SELECT admin_id FROM supervisors WHERE id = ?
      )
      ORDER BY m.maintenance_date DESC
    `;
    const [rows] = await db.execute(query, [supervisor_id]);
    return rows;
  },

  async findById(id) {
    const query = `
      SELECT m.*, b.bus_number, d.name as driver_name
      FROM maintenance m
      LEFT JOIN buses b ON m.bus_id = b.id
      LEFT JOIN drivers d ON m.driver_id = d.id
      WHERE m.id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  },

  async update(id, maintenanceData) {
    const { bus_id, driver_id, subject, description, cost, maintenance_date } = maintenanceData;
    const query = `
      UPDATE maintenance 
      SET bus_id = ?, driver_id = ?, subject = ?, description = ?, cost = ?, maintenance_date = ?
      WHERE id = ?
    `;
    const [result] = await db.execute(query, [bus_id, driver_id, subject, description, cost, maintenance_date, id]);
    return result;
  },

  async delete(id) {
    const query = 'DELETE FROM maintenance WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result;
  }
};

module.exports = Maintenance;