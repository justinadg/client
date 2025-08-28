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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Alert,
  IconButton,
} from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import RefreshIcon from '@mui/icons-material/Refresh';
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
} from 'recharts';
import dayjs from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { useFetchAllAppointmentsQuery } from '../../services/api/appointmentsApi';
import { useFetchServiceByIdQuery } from '../../services/api/servicesApi';
import { openai } from '../../services/api/openaiApi';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFA500'];

const calculateStats = (timeRange, customDate, customStartDate, customEndDate, appointments) => {
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

  // Convert service distribution to array format
  const serviceDistributionData = Object.entries(serviceDistribution).map(([name, value]) => ({
    name,
    value,
    percentage: filteredAppointments.length > 0 
      ? (value / filteredAppointments.length * 100).toFixed(1) 
      : '0'
  }));

  return {
    total: filteredAppointments.length,
    statusCounts,
    serviceDistribution: serviceDistributionData,
    startDate,
    endDate,
    filteredAppointments // Added to access appointments for the clicked bar
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
          appointments: hourAppointments, // Store appointments for this hour
          start: hourStart,
          end: hourEnd
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
          appointments: dayAppointments, // Store appointments for this day
          start: currentDate.startOf('day'),
          end: currentDate.endOf('day')
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
          appointments: weekAppointments, // Store appointments for this week
          start: weekStart,
          end: weekEnd
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
          appointments: monthAppointments, // Store appointments for this month
          start: monthStart,
          end: monthEnd
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

  // Modal state for bar click
  const [selectedBarData, setSelectedBarData] = useState(null);
  const [openBarDetails, setOpenBarDetails] = useState(false);

  // AI Insights state
  const [aiInsights, setAiInsights] = useState({});
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [insightError, setInsightError] = useState(null);

  const { data: allAppointments = { results: [] }, isLoading } = useFetchAllAppointmentsQuery({
    limit: 10000,
    populate: 'serviceType'
  });

  const handleTimeRangeChange = (event, newValue) => {
    setTimeRange(newValue);
  };

  const handleCompareTimeRangeChange = (event, newValue) => {
    setCompareTimeRange(newValue);
  };

  const currentStats = calculateStats(timeRange, customDate, customStartDate, customEndDate, allAppointments.results);
  const chartData = prepareChartData(timeRange, customDate, customStartDate, customEndDate, allAppointments.results);
  
  // Calculate comparison stats
  const comparisonStats = calculateStats(
    compareTimeRange, 
    compareCustomDate, 
    compareCustomStartDate, 
    compareCustomEndDate, 
    allAppointments.results
  );

  // Calculate percentage changes
  const calculateChange = (current, previous) => {
    if (previous === 0) return current === 0 ? 0 : 100;
    return ((current - previous) / previous) * 100;
  };

  const percentageChanges = {
    total: calculateChange(currentStats.total, comparisonStats.total),
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

  // Generate AI insights for each metric
  const generateAiInsights = async () => {
    setIsGeneratingInsights(true);
    setInsightError(null);
    
    try {
      const insights = {};
      
      // Prepare data for AI analysis
      const analysisData = {
        currentPeriod: {
          total: currentStats.total,
          completed: currentStats.statusCounts['Completed'] || 0,
          noArrival: currentStats.statusCounts['No Arrival'] || 0,
          cancelled: currentStats.statusCounts['Cancelled'] || 0,
          serviceDistribution: currentStats.serviceDistribution,
          dateRange: formatDateRange(timeRange, customDate, customStartDate, customEndDate)
        },
        comparisonPeriod: {
          total: comparisonStats.total,
          completed: comparisonStats.statusCounts['Completed'] || 0,
          noArrival: comparisonStats.statusCounts['No Arrival'] || 0,
          cancelled: comparisonStats.statusCounts['Cancelled'] || 0,
          dateRange: formatDateRange(compareTimeRange, compareCustomDate, compareCustomStartDate, compareCustomEndDate)
        },
        percentageChanges
      };
      
      // Generate insights for each metric using OpenAI
      const metrics = ['total', 'completed', 'noArrival', 'cancelled'];
      
      for (const metric of metrics) {
        const prompt = `
          Analyze the following appointment data for a business and provide a concise insight (max 2 sentences) about what happened, why it might have happened, and what action to take.
          
          Metric: ${metric}
          Current Period (${analysisData.currentPeriod.dateRange}): ${analysisData.currentPeriod[metric]}
          Comparison Period (${analysisData.comparisonPeriod.dateRange}): ${analysisData.comparisonPeriod[metric]}
          Change: ${percentageChanges[metric].toFixed(1)}%
          
          Provide your response in this exact format:
          What happened: [description]
          Why it might have happened: [explanation]
          What to do: [recommendation]
        `;
        
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "You are a business analytics assistant that provides concise, actionable insights about appointment data."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            max_tokens: 150,
            temperature: 0.7,
          });
          
          const insightText = response.choices[0].message.content;
          insights[metric] = insightText;
        } catch (error) {
          console.error(`Error generating insight for ${metric}:`, error);
          insights[metric] = "Unable to generate insight at this time. Please try again later.";
        }
      }
      
      setAiInsights(insights);
    } catch (error) {
      console.error("Error generating AI insights:", error);
      setInsightError("Failed to generate insights. Please check your OpenAI API key and try again.");
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // Handle bar click
  const handleBarClick = (data) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedBar = data.activePayload[0].payload;
      setSelectedBarData(clickedBar);
      setOpenBarDetails(true);
    }
  };

  // Calculate service distribution for the clicked bar
  const getBarServiceDistribution = () => {
    if (!selectedBarData || !selectedBarData.appointments) return [];
    
    const serviceDistribution = selectedBarData.appointments.reduce((acc, appointment) => {
      let serviceName = 'Unknown Service';
      
      if (appointment.serviceType && appointment.serviceType.title) {
        serviceName = appointment.serviceType.title;
      } else if (appointment.serviceType) {
        serviceName = `Service ID: ${appointment.serviceType}`;
      }
      
      acc[serviceName] = (acc[serviceName] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(serviceDistribution).map(([name, value]) => ({
      name,
      value,
      percentage: selectedBarData.appointments.length > 0 
        ? (value / selectedBarData.appointments.length * 100).toFixed(1) 
        : '0'
    }));
  };

  // Prepare comparison chart data
  const comparisonChartData = [
    {
      name: 'Total Appointments',
      current: currentStats.total,
      comparison: comparisonStats.total,
      change: percentageChanges.total,
      insightKey: 'total'
    },
    {
      name: 'Completed',
      current: currentStats.statusCounts['Completed'] || 0,
      comparison: comparisonStats.statusCounts['Completed'] || 0,
      change: percentageChanges.completed,
      insightKey: 'completed'
    },
    {
      name: 'No Arrival',
      current: currentStats.statusCounts['No Arrival'] || 0,
      comparison: comparisonStats.statusCounts['No Arrival'] || 0,
      change: percentageChanges.noArrival,
      insightKey: 'noArrival'
    },
    {
      name: 'Cancelled',
      current: currentStats.statusCounts['Cancelled'] || 0,
      comparison: comparisonStats.statusCounts['Cancelled'] || 0,
      change: percentageChanges.cancelled,
      insightKey: 'cancelled'
    }
  ];

  if (isLoading) {
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
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Typography variant="h6" color="text.secondary">
                No Arrival
              </Typography>
              <Typography variant="h3" sx={{ mt: 1 }}>
                {currentStats.statusCounts['No Arrival'] || 0}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                {Math.round(((currentStats.statusCounts['No Arrival'] || 0) / currentStats.total) * 100)}% of total
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
              onClick={handleBarClick}
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

        {/* Bar Details Modal */}
        <Dialog
          open={openBarDetails}
          onClose={() => setOpenBarDetails(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Appointment Details for {selectedBarData?.name}
          </DialogTitle>
          <DialogContent>
            {selectedBarData && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Total Appointments: {selectedBarData.Appointments}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Time Period: {selectedBarData.start.format('MMM D, YYYY h:mm A')} - {selectedBarData.end.format('MMM D, YYYY h:mm A')}
                </Typography>
                
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Service Distribution
                </Typography>
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Service</TableCell>
                        <TableCell align="right">Count</TableCell>
                        <TableCell align="right">Percentage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getBarServiceDistribution().map((service, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {service.name.startsWith('Service ID: ') ? (
                              <ServiceName serviceId={service.name.replace('Service ID: ', '')} />
                            ) : (
                              service.name
                            )}
                          </TableCell>
                          <TableCell align="right">{service.value}</TableCell>
                          <TableCell align="right">{service.percentage}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                  Status Distribution
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedBarData.appointments && Object.entries(
                    selectedBarData.appointments.reduce((acc, appointment) => {
                      acc[appointment.status] = (acc[appointment.status] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([status, count]) => (
                    <Chip
                      key={status}
                      label={`${status}: ${count}`}
                      color={
                        status === "Completed" ? "success" :
                        status === "Cancelled" ? "error" : 
                        status === "No Arrival" ? "warning" : "default"
                      }
                    />
                  ))}
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenBarDetails(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Comparison Analytics Bar Chart */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" gutterBottom>
              Comparison Analytics
            </Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={generateAiInsights}
              disabled={isGeneratingInsights}
            >
              {isGeneratingInsights ? 'Generating Insights...' : 'Generate AI Insights'}
            </Button>
          </Box>
          
          {insightError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {insightError}
            </Alert>
          )}
          
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

          <Box sx={{ height: 400, mb: 3 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonChartData}
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
                <Tooltip 
                  formatter={(value, name) => [`${value} appointments`, name === 'current' ? 'Current Period' : 'Comparison Period']}
                  labelFormatter={(label) => label}
                />
                <Legend />
                <Bar 
                  dataKey="current" 
                  fill="#8884d8" 
                  name={`Current Period (${formatDateRange(timeRange, customDate, customStartDate, customEndDate)})`}
                />
                <Bar 
                  dataKey="comparison" 
                  fill="#82ca9d" 
                  name={`Comparison Period (${formatDateRange(compareTimeRange, compareCustomDate, compareCustomStartDate, compareCustomEndDate)})`}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* Insights Table */}
          <Typography variant="h6" gutterBottom>
            AI-Generated Insights
          </Typography>
          {isGeneratingInsights ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Metric</TableCell>
                    <TableCell>Change (%)</TableCell>
                    <TableCell>Insight</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {comparisonChartData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell sx={{ color: row.change >= 0 ? 'success.main' : 'error.main' }}>
                        {row.change.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        {aiInsights[row.insightKey] || (
                          <Typography variant="body2" color="text.secondary">
                            Click "Generate AI Insights" to get analysis
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default AppointmentAnalytics;