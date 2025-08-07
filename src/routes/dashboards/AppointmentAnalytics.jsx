import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper,
  CircularProgress,
  Tabs,
  Tab,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import dayjs from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { useFetchAllAppointmentsQuery } from '../../services/api/appointmentsApi';
import { useFetchServiceByIdQuery, useFetchServicesQuery } from '../../services/api/servicesApi';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFA500'];

const calculateStats = (timeRange, customDate, customStartDate, customEndDate, appointments, services) => {
  let startDate, endDate;
  
  switch (timeRange) {
    case 'day':
      startDate = customDate.startOf('day');
      endDate = customDate.endOf('day');
      break;
    case 'week':
      startDate = customStartDate.startOf('day');
      endDate = customEndDate.endOf('day');
      break;
    case 'month':
      startDate = customDate.startOf('month');
      endDate = customDate.endOf('month');
      break;
    case 'year':
      startDate = customDate.startOf('year');
      endDate = customDate.endOf('year');
      break;
    default:
      startDate = dayjs().startOf('day');
      endDate = dayjs().endOf('day');
  }
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = dayjs(appointment.appointmentDateTime);
    return appointmentDate.isSameOrAfter(startDate) && appointmentDate.isSameOrBefore(endDate);
  });

  // Status counts
  const statusCounts = filteredAppointments.reduce((acc, appointment) => {
    acc[appointment.status] = (acc[appointment.status] || 0) + 1;
    return acc;
  }, {});

  // Service type distribution
  const serviceDistribution = filteredAppointments.reduce((acc, appointment) => {
    let serviceName = 'Unknown Service';
    
    if (appointment.serviceType && appointment.serviceType.title) {
      serviceName = appointment.serviceType.title;
    } else if (appointment.serviceType) {
      serviceName = `Service ID: ${appointment.serviceType}`;
    }
    
    acc[serviceName] = (acc[serviceName] || 0) + 1;
    return acc;
  }, {});

  // Convert service distribution to array format for PieChart
  const serviceDistributionData = Object.entries(serviceDistribution).map(([name, value]) => ({
    name,
    value,
    percentage: filteredAppointments.length > 0 
      ? (value / filteredAppointments.length * 100).toFixed(1) 
      : '0'
  }));

  return {
    total: filteredAppointments.length,
    totalServices: services.length,
    statusCounts,
    serviceDistribution: serviceDistributionData,
    startDate,
    endDate
  };
};

const prepareChartData = (timeRange, customDate, customStartDate, customEndDate, appointments) => {
  let startDate, endDate;
  let data = [];
  
  switch (timeRange) {
    case 'day':
      startDate = customDate.startOf('day');
      endDate = customDate.endOf('day');
      // Group by hour for day view
      for (let hour = 0; hour < 24; hour++) {
        const hourStart = startDate.add(hour, 'hour');
        const hourEnd = startDate.add(hour + 1, 'hour');
        
        const hourAppointments = appointments.filter(appointment => {
          const appointmentDate = dayjs(appointment.appointmentDateTime);
          return appointmentDate.isSameOrAfter(hourStart) && appointmentDate.isSameOrBefore(hourEnd);
        });
        
        data.push({
          name: hourStart.format('h A'),
          Appointments: hourAppointments.length,
        });
      }
      break;
    case 'week':
      startDate = customStartDate.startOf('day');
      endDate = customEndDate.endOf('day');
      // Group by day for week view
      let currentDate = startDate;
      while (currentDate.isSameOrBefore(endDate)) {
        const dayAppointments = appointments.filter(appointment => {
          const appointmentDate = dayjs(appointment.appointmentDateTime);
          return appointmentDate.isSame(currentDate, 'day');
        });
        
        data.push({
          name: currentDate.format('ddd'),
          Appointments: dayAppointments.length,
        });
        
        currentDate = currentDate.add(1, 'day');
      }
      break;
    case 'month':
      startDate = customDate.startOf('month');
      endDate = customDate.endOf('month');
      // Group by week for month view
      const weeksInMonth = Math.ceil(endDate.diff(startDate, 'week') + 1);
      for (let week = 0; week < weeksInMonth; week++) {
        const weekStart = startDate.add(week, 'week');
        const weekEnd = week === weeksInMonth - 1 ? endDate : weekStart.endOf('week');
        
        const weekAppointments = appointments.filter(appointment => {
          const appointmentDate = dayjs(appointment.appointmentDateTime);
          return appointmentDate.isSameOrAfter(weekStart) && appointmentDate.isSameOrBefore(weekEnd);
        });
        
        data.push({
          name: `Week ${week + 1}`,
          Appointments: weekAppointments.length,
        });
      }
      break;
    case 'year':
      startDate = customDate.startOf('year');
      endDate = customDate.endOf('year');
      // Group by month for year view
      for (let month = 0; month < 12; month++) {
        const monthStart = startDate.add(month, 'month');
        const monthEnd = monthStart.endOf('month');
        
        const monthAppointments = appointments.filter(appointment => {
          const appointmentDate = dayjs(appointment.appointmentDateTime);
          return appointmentDate.isSameOrAfter(monthStart) && appointmentDate.isSameOrBefore(monthEnd);
        });
        
        data.push({
          name: monthStart.format('MMM'),
          Appointments: monthAppointments.length,
        });
      }
      break;
    default:
      startDate = dayjs().startOf('day');
      endDate = dayjs().endOf('day');
  }

  return data;
};

const formatDateRange = (timeRange, date, startDate, endDate) => {
  switch (timeRange) {
    case 'day':
      return date.format('MMMM D, YYYY');
    case 'week':
      return `${startDate.format('MMM D')} - ${endDate.format('MMM D, YYYY')}`;
    case 'month':
      return date.format('MMMM YYYY');
    case 'year':
      return date.format('YYYY');
    default:
      return date.format('MMMM D, YYYY');
  }
};

const generateMetricInsight = (metric, currentValue, comparisonValue, percentageChange) => {
  if (currentValue === 0 && comparisonValue === 0) {
    return "No data in both periods";
  }

  if (currentValue === 0) {
    return "No data in current period";
  }

  if (comparisonValue === 0) {
    return "No data in comparison period";
  }

  const absChange = Math.abs(percentageChange);
  if (absChange < 10) {
    return "No significant change";
  }

  const direction = percentageChange > 0 ? 'increase' : 'decrease';
  const metricName = metric === 'total' ? 'appointments' : metric.toLowerCase();
  
  return `${metricName} ${direction}d by ${absChange.toFixed(1)}%`;
};

const ServiceName = ({ serviceId }) => {
  const { data: service } = useFetchServiceByIdQuery(serviceId);
  return service ? service.title : `Service ID: ${serviceId}`;
};

const AppointmentAnalytics = () => {
  const [timeRange, setTimeRange] = useState('day');
  const [customDate, setCustomDate] = useState(dayjs());
  const [customStartDate, setCustomStartDate] = useState(dayjs().startOf('week'));
  const [customEndDate, setCustomEndDate] = useState(dayjs().endOf('week'));
  
  // Comparison analytics state
  const [compareTimeRange, setCompareTimeRange] = useState('day');
  const [compareCustomDate, setCompareCustomDate] = useState(dayjs().subtract(1, 'day'));
  const [compareCustomStartDate, setCompareCustomStartDate] = useState(dayjs().subtract(1, 'week').startOf('week'));
  const [compareCustomEndDate, setCompareCustomEndDate] = useState(dayjs().subtract(1, 'week').endOf('week'));

  const { data: allAppointments = { results: [] }, isLoading: isLoadingAppointments } = useFetchAllAppointmentsQuery({
    limit: 10000,
    populate: 'serviceType'
  });

  const { data: services = [], isLoading: isLoadingServices } = useFetchServicesQuery();

  const handleTimeRangeChange = (event, newValue) => {
    setTimeRange(newValue);
  };

  const handleCompareTimeRangeChange = (event, newValue) => {
    setCompareTimeRange(newValue);
  };

  const currentStats = calculateStats(
    timeRange, 
    customDate, 
    customStartDate, 
    customEndDate, 
    allAppointments.results,
    services
  );
  
  const chartData = prepareChartData(
    timeRange, 
    customDate, 
    customStartDate, 
    customEndDate, 
    allAppointments.results
  );

  // Calculate comparison stats
  const comparisonStats = calculateStats(
    compareTimeRange, 
    compareCustomDate, 
    compareCustomStartDate, 
    compareCustomEndDate, 
    allAppointments.results,
    services
  );

  // Calculate percentage changes
  const calculateChange = (current, previous) => {
    if (previous === 0) return current === 0 ? 0 : 100;
    return ((current - previous) / previous) * 100;
  };

  const percentageChanges = {
    total: calculateChange(currentStats.total, comparisonStats.total),
    totalServices: calculateChange(currentStats.totalServices, comparisonStats.totalServices),
    completed: calculateChange(
      currentStats.statusCounts['Completed'] || 0,
      comparisonStats.statusCounts['Completed'] || 0
    ),
    noArrival: calculateChange(
      currentStats.statusCounts['No Arrival'] || 0,
      comparisonStats.statusCounts['No Arrival'] || 0
    ),
    cancelled: calculateChange(
      currentStats.statusCounts['Cancelled'] || 0,
      comparisonStats.statusCounts['Cancelled'] || 0
    ),
  };

  // Generate insights for each metric
  const metricInsights = {
    total: generateMetricInsight('total', currentStats.total, comparisonStats.total, percentageChanges.total),
    totalServices: generateMetricInsight('totalServices', currentStats.totalServices, comparisonStats.totalServices, percentageChanges.totalServices),
    completed: generateMetricInsight('completed', currentStats.statusCounts['Completed'] || 0, comparisonStats.statusCounts['Completed'] || 0, percentageChanges.completed),
    noArrival: generateMetricInsight('noArrival', currentStats.statusCounts['No Arrival'] || 0, comparisonStats.statusCounts['No Arrival'] || 0, percentageChanges.noArrival),
    cancelled: generateMetricInsight('cancelled', currentStats.statusCounts['Cancelled'] || 0, comparisonStats.statusCounts['Cancelled'] || 0, percentageChanges.cancelled),
  };

  if (isLoadingAppointments || isLoadingServices) {
    return <CircularProgress disableShrink />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography
          component="h1"
          variant="h3"
          color="inherit"
          noWrap
          sx={{ flexGrow: 1, mb: 4 }}
        >
          <AnalyticsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Appointment Analytics
        </Typography>
        
        {/* Time range selector */}
        <Box sx={{ mb: 3 }}>
          <Tabs 
            value={timeRange} 
            onChange={handleTimeRangeChange} 
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Day" value="day" />
            <Tab label="Week" value="week" />
            <Tab label="Month" value="month" />
            <Tab label="Year" value="year" />
          </Tabs>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {timeRange === 'day' && (
              <DatePicker
                label="Select Date"
                value={customDate}
                onChange={(newValue) => setCustomDate(newValue)}
                renderInput={(params) => <TextField {...params} />}
              />
            )}
            
            {timeRange === 'week' && (
              <>
                <DatePicker
                  label="Start Date"
                  value={customStartDate}
                  onChange={(newValue) => setCustomStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
                <DatePicker
                  label="End Date"
                  value={customEndDate}
                  onChange={(newValue) => setCustomEndDate(newValue)}
                  minDate={customStartDate}
                  renderInput={(params) => <TextField {...params} />}
                />
              </>
            )}
            
            {(timeRange === 'month' || timeRange === 'year') && (
              <DatePicker
                label={`Select ${timeRange === 'month' ? 'Month' : 'Year'}`}
                value={customDate}
                onChange={(newValue) => setCustomDate(newValue)}
                views={timeRange === 'month' ? ['year', 'month'] : ['year']}
                openTo={timeRange === 'month' ? 'month' : 'year'}
                renderInput={(params) => <TextField {...params} />}
              />
            )}
          </Box>
        </Box>

        {/* Combined Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" color="text.secondary">
                Total Appointments
              </Typography>
              <Typography variant="h3" sx={{ mt: 1 }}>
                {currentStats.total}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                {formatDateRange(timeRange, customDate, customStartDate, customEndDate)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" color="text.secondary">
                Total Services
              </Typography>
              <Typography variant="h3" sx={{ mt: 1 }}>
                {currentStats.totalServices}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                Available services
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Typography variant="h6" color="text.secondary">
                Completed
              </Typography>
              <Typography variant="h3" sx={{ mt: 1 }}>
                {currentStats.statusCounts['Completed'] || 0}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                {Math.round(((currentStats.statusCounts['Completed'] || 0) / currentStats.total) * 100)}% of total
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Typography variant="h6" color="text.secondary">
                Cancelled
              </Typography>
              <Typography variant="h3" sx={{ mt: 1 }}>
                {currentStats.statusCounts['Cancelled'] || 0}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                {Math.round(((currentStats.statusCounts['Cancelled'] || 0) / currentStats.total) * 100)}% of total
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Bar Chart */}
        <Paper elevation={3} sx={{ p: 3, mb: 4, height: 400 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Appointments by {timeRange === 'day' ? 'Hour' : 
                          timeRange === 'week' ? 'Day' : 
                          timeRange === 'month' ? 'Week' : 'Month'}
          </Typography>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="Appointments" 
                fill="#8884d8" 
                name="Appointments"
              />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Service Distribution Pie Chart */}
        <Paper elevation={3} sx={{ p: 3, mb: 4, height: 400 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Service Distribution
          </Typography>
          {currentStats.serviceDistribution && currentStats.serviceDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={currentStats.serviceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percentage }) => {
                    if (name.startsWith('Service ID: ')) {
                      const serviceId = name.replace('Service ID: ', '');
                      return <ServiceName serviceId={serviceId} />;
                    }
                    return `${name} (${percentage}%)`;
                  }}
                >
                  {currentStats.serviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} appointments`, 
                    `${props.payload.percentage}% of total`
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Typography variant="body1" color="text.secondary">
                No service data available for the selected period
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Comparison Analytics Table */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Comparison Analytics
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Tabs 
              value={compareTimeRange} 
              onChange={handleCompareTimeRangeChange} 
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 2 }}
            >
              <Tab label="Day" value="day" />
              <Tab label="Week" value="week" />
              <Tab label="Month" value="month" />
              <Tab label="Year" value="year" />
            </Tabs>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {compareTimeRange === 'day' && (
                <DatePicker
                  label="Comparison Date"
                  value={compareCustomDate}
                  onChange={(newValue) => setCompareCustomDate(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
              )}
              
              {compareTimeRange === 'week' && (
                <>
                  <DatePicker
                    label="Comparison Start Date"
                    value={compareCustomStartDate}
                    onChange={(newValue) => setCompareCustomStartDate(newValue)}
                    renderInput={(params) => <TextField {...params} />}
                  />
                  <DatePicker
                    label="Comparison End Date"
                    value={compareCustomEndDate}
                    onChange={(newValue) => setCompareCustomEndDate(newValue)}
                    minDate={compareCustomStartDate}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </>
              )}
              
              {(compareTimeRange === 'month' || compareTimeRange === 'year') && (
                <DatePicker
                  label={`Comparison ${compareTimeRange === 'month' ? 'Month' : 'Year'}`}
                  value={compareCustomDate}
                  onChange={(newValue) => setCompareCustomDate(newValue)}
                  views={compareTimeRange === 'month' ? ['year', 'month'] : ['year']}
                  openTo={compareTimeRange === 'month' ? 'month' : 'year'}
                  renderInput={(params) => <TextField {...params} />}
                />
              )}
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Metric</TableCell>
                  <TableCell>
                    Current Period
                    <Typography variant="caption" display="block">
                      {formatDateRange(timeRange, customDate, customStartDate, customEndDate)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    Comparison Period
                    <Typography variant="caption" display="block">
                      {formatDateRange(compareTimeRange, compareCustomDate, compareCustomStartDate, compareCustomEndDate)}
                    </Typography>
                  </TableCell>
                  <TableCell>Change (%)</TableCell>
                  <TableCell>Insight</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Total Appointments</TableCell>
                  <TableCell>{currentStats.total}</TableCell>
                  <TableCell>{comparisonStats.total}</TableCell>
                  <TableCell sx={{ color: percentageChanges.total >= 0 ? 'success.main' : 'error.main' }}>
                    {percentageChanges.total.toFixed(1)}%
                  </TableCell>
                  <TableCell>{metricInsights.total}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Total Services</TableCell>
                  <TableCell>{currentStats.totalServices}</TableCell>
                  <TableCell>{comparisonStats.totalServices}</TableCell>
                  <TableCell sx={{ color: percentageChanges.totalServices >= 0 ? 'success.main' : 'error.main' }}>
                    {percentageChanges.totalServices.toFixed(1)}%
                  </TableCell>
                  <TableCell>{metricInsights.totalServices}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Completed</TableCell>
                  <TableCell>{currentStats.statusCounts['Completed'] || 0}</TableCell>
                  <TableCell>{comparisonStats.statusCounts['Completed'] || 0}</TableCell>
                  <TableCell sx={{ color: percentageChanges.completed >= 0 ? 'success.main' : 'error.main' }}>
                    {percentageChanges.completed.toFixed(1)}%
                  </TableCell>
                  <TableCell>{metricInsights.completed}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>No Arrival</TableCell>
                  <TableCell>{currentStats.statusCounts['No Arrival'] || 0}</TableCell>
                  <TableCell>{comparisonStats.statusCounts['No Arrival'] || 0}</TableCell>
                  <TableCell sx={{ color: percentageChanges.noArrival >= 0 ? 'error.main' : 'success.main' }}>
                    {percentageChanges.noArrival.toFixed(1)}%
                  </TableCell>
                  <TableCell>{metricInsights.noArrival}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default AppointmentAnalytics;