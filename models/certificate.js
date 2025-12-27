const db = require('../db');

const Certificate = {
  async create(certificateData) {
    const { bus_id, admin_id, certificate_type, certificate_number, expiry_date, status } = certificateData;
    const query = 'INSERT INTO bus_certificates (bus_id, admin_id, certificate_type, certificate_number, expiry_date, status) VALUES (?, ?, ?, ?, ?, ?)';
    const [result] = await db.execute(query, [bus_id, admin_id, certificate_type, certificate_number, expiry_date, status || 'Valid']);
    return result;
  },
  
  async findById(id) {
    const query = 'SELECT * FROM bus_certificates WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  },
  
  async findByBusId(bus_id) {
    const query = 'SELECT * FROM bus_certificates WHERE bus_id = ?';
    const [rows] = await db.execute(query, [bus_id]);
    return rows;
  },
  
  async findByAdminId(admin_id) {
    const query = `
      SELECT bc.*, b.bus_number 
      FROM bus_certificates bc 
      JOIN buses b ON bc.bus_id = b.id 
      WHERE bc.admin_id = ?
      ORDER BY bc.expiry_date
    `;
    const [rows] = await db.execute(query, [admin_id]);
    return rows;
  },
  
  async update(id, certificateData) {
    const { certificate_type, certificate_number, expiry_date, status } = certificateData;
    
    // Ensure no undefined values are passed to the query
    const type = certificate_type !== undefined ? certificate_type : null;
    const number = certificate_number !== undefined ? certificate_number : null;
    const date = expiry_date !== undefined ? expiry_date : null;
    const certStatus = status !== undefined ? status : null;
    
    const query = 'UPDATE bus_certificates SET certificate_type = ?, certificate_number = ?, expiry_date = ?, status = ? WHERE id = ?';
    const [result] = await db.execute(query, [type, number, date, certStatus, id]);
    return result;
  },
  
  async delete(id) {
    const query = 'DELETE FROM bus_certificates WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result;
  },
  
  async updateExpiryStatus() {
    // Update status based on expiry date
    const query = `
      UPDATE bus_certificates 
      SET status = CASE 
        WHEN expiry_date < CURDATE() THEN 'Expired'
        ELSE 'Valid'
      END
    `;
    const [result] = await db.execute(query);
    return result;
  }
};

module.exports = Certificate;