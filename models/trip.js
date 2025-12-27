const db = require('../db');

const Trip = {
  async create(tripData) {
    const { admin_id, supervisor_id, bus_id, driver_id, route_id, temporary_route, trip_date, start_time } = tripData;
    let query, params;
    
    // Format start_time as a full datetime if it's provided as just time
    let formattedStartTime = start_time;
    let formattedStartTime12h = null;
    if (start_time && typeof start_time === 'string' && start_time.match(/^\d{2}:\d{2}$/)) {
      // If it's in HH:MM format, combine with trip_date to create full datetime
      formattedStartTime = `${trip_date} ${start_time}:00`;
      // Convert to 12-hour format
      const [hours, minutes] = start_time.split(':');
      let hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      formattedStartTime12h = `${hour}:${minutes} ${ampm}`;
    } else if (start_time && start_time.toString && start_time.toString().includes('GMT')) {
      // If it's a Date object that got converted to string, extract the time part
      const dateObj = new Date(start_time);
      // Get local time values to avoid timezone conversion
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      formattedStartTime = `${trip_date} ${hours}:${minutes}:00`;
      // Convert to 12-hour format
      let hour = dateObj.getHours();
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      formattedStartTime12h = `${hour}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
    }
    
    if (route_id) {
      // Using predefined route
      query = 'INSERT INTO trips (admin_id, supervisor_id, bus_id, driver_id, route_id, trip_date, start_time, start_time_12h) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      params = [admin_id, supervisor_id, bus_id, driver_id, route_id, trip_date, formattedStartTime || null, formattedStartTime12h];
    } else {
      // Using temporary route
      query = 'INSERT INTO trips (admin_id, supervisor_id, bus_id, driver_id, temporary_route, trip_date, start_time, start_time_12h) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      params = [admin_id, supervisor_id, bus_id, driver_id, temporary_route, trip_date, formattedStartTime || null, formattedStartTime12h];
    }
    
    const [result] = await db.execute(query, params);
    return result;
  },
  
  async findById(id) {
    const query = `
      SELECT t.*, b.bus_number, d.name as driver_name, s.name as supervisor_name, 
             r.name as route_name, r.start_point, r.end_point
      FROM trips t
      LEFT JOIN buses b ON t.bus_id = b.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      LEFT JOIN supervisors s ON t.supervisor_id = s.id
      LEFT JOIN routes r ON t.route_id = r.id
      WHERE t.id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  },
  
  async findByAdminId(admin_id, filters = {}) {
    let query = `
      SELECT t.*, b.bus_number, d.name as driver_name, s.name as supervisor_name, 
             r.name as route_name, r.start_point, r.end_point
      FROM trips t
      LEFT JOIN buses b ON t.bus_id = b.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      LEFT JOIN supervisors s ON t.supervisor_id = s.id
      LEFT JOIN routes r ON t.route_id = r.id
      WHERE t.admin_id = ?
    `;
    const params = [admin_id];
    
    // Apply filters
    if (filters.date) {
      query += ' AND DATE(t.trip_date) = ?';
      params.push(filters.date);
    }
    if (filters.month && filters.year) {
      // Filter by month and year
      query += ' AND MONTH(t.trip_date) = ? AND YEAR(t.trip_date) = ?';
      params.push(filters.month, filters.year);
    } else if (filters.month) {
      // Filter by month only
      query += ' AND MONTH(t.trip_date) = ?';
      params.push(filters.month);
    } else if (filters.year) {
      // Filter by year only
      query += ' AND YEAR(t.trip_date) = ?';
      params.push(filters.year);
    }
    if (filters.bus_id) {
      query += ' AND t.bus_id = ?';
      params.push(filters.bus_id);
    }
    if (filters.driver_id) {
      query += ' AND t.driver_id = ?';
      params.push(filters.driver_id);
    }
    
    query += ' ORDER BY t.trip_date DESC, t.start_time DESC';
    
    const [rows] = await db.execute(query, params);
    return rows;
  },

  async findBySupervisorId(supervisor_id, filters = {}) {
    let query = `
      SELECT t.*, b.bus_number, d.name as driver_name, s.name as supervisor_name, 
             r.name as route_name, r.start_point, r.end_point
      FROM trips t
      LEFT JOIN buses b ON t.bus_id = b.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      LEFT JOIN supervisors s ON t.supervisor_id = s.id
      LEFT JOIN routes r ON t.route_id = r.id
      WHERE t.supervisor_id = ?
    `;
    const params = [supervisor_id];
    
    // Apply filters
    if (filters.date) {
      query += ' AND DATE(t.trip_date) = ?';
      params.push(filters.date);
    }
    if (filters.month && filters.year) {
      // Filter by month and year
      query += ' AND MONTH(t.trip_date) = ? AND YEAR(t.trip_date) = ?';
      params.push(filters.month, filters.year);
    } else if (filters.month) {
      // Filter by month only
      query += ' AND MONTH(t.trip_date) = ?';
      params.push(filters.month);
    } else if (filters.year) {
      // Filter by year only
      query += ' AND YEAR(t.trip_date) = ?';
      params.push(filters.year);
    }
    if (filters.bus_id) {
      query += ' AND t.bus_id = ?';
      params.push(filters.bus_id);
    }
    if (filters.driver_id) {
      query += ' AND t.driver_id = ?';
      params.push(filters.driver_id);
    }
    
    query += ' ORDER BY t.trip_date DESC, t.start_time DESC';
    
    const [rows] = await db.execute(query, params);
    return rows;
  },
  
  async update(id, tripData) {
    const { status, start_time, end_time, trip_date } = tripData;
    
    // Format start_time and end_time as full datetime if they're provided as just time
    let formattedStartTime = start_time;
    let formattedStartTime12h = null;
    if (start_time && typeof start_time === 'string' && start_time.match(/^\d{2}:\d{2}$/)) {
      // If it's in HH:MM format, combine with trip_date to create full datetime
      formattedStartTime = `${trip_date || new Date().toISOString().split('T')[0]} ${start_time}:00`;
      // Convert to 12-hour format
      const [hours, minutes] = start_time.split(':');
      let hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      formattedStartTime12h = `${hour}:${minutes} ${ampm}`;
    }
    
    let formattedEndTime = end_time;
    let formattedEndTime12h = null;
    if (end_time && typeof end_time === 'string' && end_time.match(/^\d{2}:\d{2}$/)) {
      // If it's in HH:MM format, combine with trip_date to create full datetime
      formattedEndTime = `${trip_date || new Date().toISOString().split('T')[0]} ${end_time}:00`;
      // Convert to 12-hour format
      const [hours, minutes] = end_time.split(':');
      let hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      formattedEndTime12h = `${hour}:${minutes} ${ampm}`;
    } else if (end_time && end_time.toString && end_time.toString().includes('GMT')) {
      // If it's a Date object that got converted to string, extract the time part
      const dateObj = new Date(end_time);
      // Get local time values to avoid timezone conversion
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      formattedEndTime = `${trip_date || new Date().toISOString().split('T')[0]} ${hours}:${minutes}:00`;
      // Convert to 12-hour format
      let hour = dateObj.getHours();
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      formattedEndTime12h = `${hour}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
    }
    
    // Build dynamic query based on which fields are provided
    const updates = [];
    const params = [];
    
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    
    if (start_time !== undefined) {
      updates.push('start_time = ?');
      params.push(formattedStartTime);
      if (formattedStartTime12h !== null) {
        updates.push('start_time_12h = ?');
        params.push(formattedStartTime12h);
      }
    }
    
    if (end_time !== undefined) {
      updates.push('end_time = ?');
      params.push(formattedEndTime);
      if (formattedEndTime12h !== null) {
        updates.push('end_time_12h = ?');
        params.push(formattedEndTime12h);
      }
    }
    
    if (updates.length === 0) {
      throw new Error('No fields to update');
    }
    
    params.push(id);
    
    const query = `UPDATE trips SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await db.execute(query, params);
    return result;
  },
  
  async delete(id) {
    const query = 'DELETE FROM trips WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result;
  }
};

module.exports = Trip;