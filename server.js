const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const superAdminRoutes = require('./routes/superAdmin');
const busRoutes = require('./routes/buses');
const routeRoutes = require('./routes/routes');
const driverRoutes = require('./routes/drivers');
const tripRoutes = require('./routes/trips');
const reportRoutes = require('./routes/reports');
const supervisorRoutes = require('./routes/supervisors');
const maintenanceRoutes = require('./routes/maintenance');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/supervisors', supervisorRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Bus Tracking API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});