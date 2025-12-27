const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

const verifySuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Access denied. Super admin privileges required.' });
  }
  next();
};

const verifySupervisor = (req, res, next) => {
  console.log('verifySupervisor - decoded token:', req.user); // Debug logging
  if (req.user.role !== 'supervisor') {
    console.log('verifySupervisor - role mismatch. Expected: supervisor, Got:', req.user.role); // Debug logging
    return res.status(403).json({ message: 'Access denied. Supervisors only.' });
  }
  console.log('verifySupervisor - access granted'); // Debug logging
  next();
};

const verifyAdminOrSupervisor = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'supervisor') {
    return res.status(403).json({ message: 'Access denied. Admins and supervisors only.' });
  }
  next();
};

module.exports = {
  verifyToken,
  verifyAdmin,
  verifySuperAdmin,
  verifySupervisor,
  verifyAdminOrSupervisor
};