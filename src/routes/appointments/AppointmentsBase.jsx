import { useEffect, useState, useMemo, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
  Badge,
  MenuItem,
  Select,
  FormControl,
  IconButton,
  Menu,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  TableFooter,
  TablePagination,
} from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate, useLocation } from "react-router-dom";
import * as XLSX from 'xlsx';
import {
  useFetchAllAppointmentsQuery,
  useFetchAppointmentsByUserQuery,
  useDeleteAppointmentMutation,
  useUpdateAppointmentMutation,
} from "../../services/api/appointmentsApi";
import { useFetchServiceByIdQuery } from "../../services/api/servicesApi";
import FadeAlert from "../../components/FadeAlert/FadeAlert";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import AppointmentDetailsModal from "./AppointmentDetailsModal";

const AppointmentsBase = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const userId = user?.id?.toString();
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const [activeTab, setActiveTab] = useState(0);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 100,
  });
  
  // Pagination for history table
  const [historyPage, setHistoryPage] = useState(0);
  const [historyRowsPerPage, setHistoryRowsPerPage] = useState(50);

  const rowCountRef = useRef(0);
  const [alert, setAlert] = useState(location.state?.alert || null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [statusChangeDialog, setStatusChangeDialog] = useState({
    open: false,
    appointmentId: null,
    newStatus: null,
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentAppointment, setCurrentAppointment] = useState(null);

  // Filter states
  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [bookedDateFilter, setBookedDateFilter] = useState("");
  const [appointmentDateFilter, setAppointmentDateFilter] = useState("");

  const [deleteAppointment] = useDeleteAppointmentMutation();
  const [updateAppointment] = useUpdateAppointmentMutation();

  useEffect(() => {
    if (location.state?.alert) {
      setAlert(location.state.alert);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  let appointmentsQuery;

  switch (user?.role) {
    case "admin":
      appointmentsQuery = useFetchAllAppointmentsQuery({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
      });
      break;
    case "user":
      appointmentsQuery = useFetchAppointmentsByUserQuery({
        userId,
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
      });
      break;
    default:
      appointmentsQuery = {
        data: [],
        isLoading: false,
        isError: true,
        refetch: () => {},
      };
      break;
  }

  const {
    data: appointmentsData,
    isLoading,
    isError,
    refetch,
  } = appointmentsQuery;

  // Filter for current appointments (Upcoming and Rescheduled)
  const currentAppointments = useMemo(
    () =>
      (appointmentsData?.results || [])
        .filter(appt => ["Upcoming", "Rescheduled"].includes(appt.status))
        .sort((a, b) => new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime)),
    [appointmentsData]
  );

  // Filter for history appointments (Completed, Cancelled, No Arrival)
  const filteredHistoryAppointments = useMemo(() => {
    if (!appointmentsData?.results) return [];
    
    let filtered = appointmentsData.results
      .filter(appt => ["Completed", "Cancelled", "No Arrival"].includes(appt.status))
      .sort((a, b) => new Date(b.appointmentDateTime) - new Date(a.appointmentDateTime));

    // Apply filters
    if (user?.role === "admin") {
      if (nameFilter) {
        filtered = filtered.filter(appt => 
          `${appt.firstName} ${appt.lastName}`.toLowerCase().includes(nameFilter.toLowerCase())
        );
      }
      if (emailFilter) {
        filtered = filtered.filter(appt => 
          appt.email.toLowerCase().includes(emailFilter.toLowerCase())
        );
      }
      if (phoneFilter) {
        filtered = filtered.filter(appt => 
          appt.contactNumber.includes(phoneFilter)
        );
      }
    }

    if (statusFilter) {
      filtered = filtered.filter(appt => 
        appt.status === statusFilter
      );
    }
    if (bookedDateFilter) {
      filtered = filtered.filter(appt => 
        dayjs(appt.createdAt).format("YYYY-MM-DD") === bookedDateFilter
      );
    }
    if (appointmentDateFilter) {
      filtered = filtered.filter(appt => 
        dayjs(appt.appointmentDateTime).format("YYYY-MM-DD") === appointmentDateFilter
      );
    }

    return filtered;
  }, [appointmentsData, nameFilter, emailFilter, phoneFilter, statusFilter, bookedDateFilter, appointmentDateFilter, user?.role]);

  const exportToExcel = () => {
    // Prepare the data for export
    const dataForExport = filteredHistoryAppointments.map(appointment => {
      const serviceName = appointment.serviceType; // You might want to fetch the actual service name here
      const servicePrice = appointment.serviceType; // And actual price here
      
      return {
        ...(user?.role === "admin" && {
          'Full Name': `${appointment.firstName} ${appointment.lastName}`,
          'Email': appointment.email,
          'Phone': appointment.contactNumber,
        }),
        'Service': serviceName,
        'Price': servicePrice,
        'Notes': appointment.additionalNotes || "N/A",
        'Rating': appointment.review ? `${appointment.review.rating}/5` : 'N/A',
        'Booked At': dayjs(appointment.bookedAt).format("MMM D, YYYY h:mm A"),
        'Appointment At': dayjs(appointment.appointmentDateTime).format("MMM D, YYYY h:mm A"),
        'Status': appointment.status
      };
    });

    // Create a worksheet
    const ws = XLSX.utils.json_to_sheet(dataForExport);
    
    // Create a workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Appointment History");
    
    // Generate a filename with current date
    const fileName = `AppointmentHistory_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    
    // Export the file
    XLSX.writeFile(wb, fileName);
  };

  const rowCount = useMemo(() => {
    if (appointmentsData?.totalResults !== undefined) {
      rowCountRef.current = appointmentsData.totalResults;
    }
    return rowCountRef.current;
  }, [appointmentsData?.totalResults]);

  const handleHistoryPageChange = (event, newPage) => {
    setHistoryPage(newPage);
  };

  const handleHistoryRowsPerPageChange = (event) => {
    setHistoryRowsPerPage(parseInt(event.target.value, 10));
    setHistoryPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMenuOpen = (event, appointment) => {
    setAnchorEl(event.currentTarget);
    setCurrentAppointment(appointment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentAppointment(null);
  };

  const handleStatusChange = (newStatus) => {
    if (currentAppointment) {
      if (['Completed', 'Cancelled', 'No Arrival'].includes(currentAppointment.status)) {
        setAlert({
          message: `Cannot change status of an appointment that is already ${currentAppointment.status}`,
          severity: "error",
        });
        handleMenuClose();
        return;
      }

      setStatusChangeDialog({
        open: true,
        appointmentId: currentAppointment.id,
        newStatus,
      });
      handleMenuClose();
    }
  };

  const confirmStatusChange = async () => {
    try {
      await updateAppointment({
        id: statusChangeDialog.appointmentId,
        status: statusChangeDialog.newStatus,
      }).unwrap();
      refetch();
      setStatusChangeDialog({ open: false, appointmentId: null, newStatus: null });
    } catch (error) {
      setAlert({
        message: `Error updating status: ${error.message}`,
        severity: "error",
      });
    }
  };

  const cancelStatusChange = () => {
    setStatusChangeDialog({ open: false, appointmentId: null, newStatus: null });
  };

  const handleEdit = (id) => {
    navigate(`/appointments/edit/${id}`);
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenDetailsModal(true);
  };

  const handleOpenDialog = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAppointment(null);
  };

  const handleAlertClose = () => {
    setAlert(null);
  };

  const handleDelete = async () => {
    if (selectedAppointment) {
      try {
        await deleteAppointment(selectedAppointment.id).unwrap();
        setOpenDialog(false);
        refetch();
        setAlert({
          message: "Appointment deleted successfully!",
          severity: "success",
        });
      } catch (error) {
        setAlert({
          message: `Error deleting appointment: ${error.message}`,
          severity: "error",
        });
      }
    }
  };

  const handleCancel = async () => {
    if (selectedAppointment) {
      try {
        await updateAppointment({
          id: selectedAppointment.id,
          status: "Cancelled",
        }).unwrap();
        setOpenDialog(false);
        refetch();
        setAlert({
          message: "Appointment cancelled successfully!",
          severity: "success",
        });
      } catch (error) {
        setAlert({
          message: `Error cancelling appointment: ${error.message}`,
          severity: "error",
        });
      }
    }
  };

  const columns = [
    {
      field: "fullName",
      headerName: "Full Name",
      width: 200,
      renderCell: (params) => `${params.row.firstName} ${params.row.lastName}`,
    },
    {
      field: "serviceType",
      headerName: "Service",
      width: 200,
      renderCell: (params) => {
        const { data: service } = useFetchServiceByIdQuery(params.row.serviceType);
        return service ? service.title : "Loading...";
      },
    },
    {
      field: "price",
      headerName: "Price",
      width: 100,
      renderCell: (params) => {
        const { data: service } = useFetchServiceByIdQuery(params.row.serviceType);
        return service ? `₱${service.price}` : "Loading...";
      },
    },
    {
      field: "appointmentDateTime",
      headerName: "Date & Time",
      width: 150,
      renderCell: (params) =>
        dayjs(params.row.appointmentDateTime).format("DD/MM/YYYY HH:mm"),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Badge
          badgeContent={params.row.status}
          color={
            params.row.status === "Upcoming" ? "primary" : 
            params.row.status === "Rescheduled" ? "warning" : "secondary"
          }
          sx={{ padding: "5px 20px" }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleViewDetails(params.row)}
            sx={{ mr: 1 }}
          >
            View
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleEdit(params.row.id)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          
          <IconButton
            aria-label="more"
            aria-controls="long-menu"
            aria-haspopup="true"
            onClick={(e) => handleMenuOpen(e, params.row)}
          >
            <MoreVertIcon />
          </IconButton>
          
          <Menu
            id="long-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl && currentAppointment?.id === params.row.id)}
            onClose={handleMenuClose}
          >
            {user?.role === "admin" && [
              <MenuItem key="complete" onClick={() => handleStatusChange("Completed")}>
                Mark as Completed
              </MenuItem>,
              <MenuItem key="cancel" onClick={() => handleStatusChange("Cancelled")}>
                Mark as Cancelled
              </MenuItem>,
              <MenuItem key="no-arrival" onClick={() => handleStatusChange("No Arrival")}>
                Mark as No Arrival
              </MenuItem>,
              <MenuItem key="delete" onClick={() => {
                handleMenuClose();
                handleOpenDialog(params.row);
              }}>
                Delete Appointment
              </MenuItem>
            ]}
            {user?.role === "user" && (
              <MenuItem key="user-cancel" onClick={() => {
                handleMenuClose();
                handleOpenDialog(params.row);
              }}>
                Cancel Appointment
              </MenuItem>
            )}
          </Menu>
        </Box>
      ),
    },
  ];

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  if (isError) {
    return <Typography>Error loading appointments</Typography>;
  }

  return (
    <DashboardLayout>
      {alert && (
        <FadeAlert
          message={alert.message}
          severity={alert.severity}
          duration={3000}
          onClose={handleAlertClose}
        />
      )}
      <Typography variant="h4" gutterBottom>
        {user?.role === "admin" ? "Manage All Appointments" : "My Appointments"}
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Current Appointments" />
        <Tab label="Appointment History" />
      </Tabs>

      {activeTab === 0 && (
        <Box sx={{ height: 650, width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: isSmallScreen ? "flex-start" : "flex-end",
              mb: 2,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/appointments/create")}
            >
              Create New Appointment
            </Button>
          </Box>
          <DataGrid
            rows={currentAppointments}
            columns={columns}
            rowCount={currentAppointments.length}
            loading={isLoading}
            paginationMode="client"
            pageSizeOptions={[15, 30, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            disableSelectionOnClick
          />
          
          {/* Delete/Cancel Confirmation Dialog */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {user?.role === "admin"
                ? "Delete Appointment"
                : "Cancel Appointment"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {user?.role === "admin"
                  ? `Are you sure you want to delete the appointment for ${selectedAppointment?.firstName} ${selectedAppointment?.lastName}?`
                  : `Are you sure you want to cancel the appointment for ${selectedAppointment?.firstName} ${selectedAppointment?.lastName}?`}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Cancel
              </Button>
              <Button
                onClick={user?.role === "admin" ? handleDelete : handleCancel}
                color="secondary"
                autoFocus
              >
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
          
          {/* Status Change Confirmation Dialog */}
          <Dialog
            open={statusChangeDialog.open}
            onClose={cancelStatusChange}
            aria-labelledby="status-change-dialog-title"
          >
            <DialogTitle id="status-change-dialog-title">
              Confirm Status Change
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to change this appointment's status to "{statusChangeDialog.newStatus}"?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={cancelStatusChange} color="primary">
                Cancel
              </Button>
              <Button onClick={confirmStatusChange} color="secondary" autoFocus>
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
          
          <AppointmentDetailsModal
            open={openDetailsModal}
            onClose={() => setOpenDetailsModal(false)}
            appointment={selectedAppointment}
          />
        </Box>
      )}

      {activeTab === 1 && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {user?.role === "admin" && (
                <>
                  <TextField
                    label="Filter by Name"
                    variant="outlined"
                    size="small"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Filter by Email"
                    variant="outlined"
                    size="small"
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Filter by Phone"
                    variant="outlined"
                    size="small"
                    value={phoneFilter}
                    onChange={(e) => setPhoneFilter(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </>
              )}
              <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Filter by Status' }}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                  <MenuItem value="No Arrival">No Arrival</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Filter by Booked Date"
                type="date"
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={bookedDateFilter}
                onChange={(e) => setBookedDateFilter(e.target.value)}
              />
              <TextField
                label="Filter by Appointment Date"
                type="date"
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={appointmentDateFilter}
                onChange={(e) => setAppointmentDateFilter(e.target.value)}
              />
              <Button 
                variant="outlined" 
                onClick={() => {
                  setNameFilter("");
                  setEmailFilter("");
                  setPhoneFilter("");
                  setServiceFilter("");
                  setPriceFilter("");
                  setStatusFilter("");
                  setBookedDateFilter("");
                  setAppointmentDateFilter("");
                }}
              >
                Clear Filters
              </Button>
            </Box>
            <Button 
              variant="contained" 
              color="success"
              startIcon={<FileDownloadIcon />}
              onClick={exportToExcel}
              disabled={filteredHistoryAppointments.length === 0}
            >
              Export to Excel
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="appointment history table" size="small">
              <TableHead>
                <TableRow>
                  {user?.role === "admin" && (
                    <>
                      <TableCell sx={{ fontSize: '0.75rem' }}>Full Name</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>Email</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>Phone</TableCell>
                    </>
                  )}
                  <TableCell sx={{ fontSize: '0.75rem' }}>Service</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>Price</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>Notes</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>Rating</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>Booked At</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>Appointment At</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHistoryAppointments
                  .slice(historyPage * historyRowsPerPage, historyPage * historyRowsPerPage + historyRowsPerPage)
                  .map((appointment) => (
                  <TableRow key={appointment.id}>
                    {user?.role === "admin" && (
                      <>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{`${appointment.firstName} ${appointment.lastName}`}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{appointment.email}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{appointment.contactNumber}</TableCell>
                      </>
                    )}
                    <TableCell sx={{ fontSize: '0.75rem' }}>
                      <ServiceName serviceId={appointment.serviceType} />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem' }}>
                      <ServicePrice serviceId={appointment.serviceType} />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem' }}>{appointment.additionalNotes || "N/A"}</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem' }}>
                      {appointment.review ? `${appointment.review.rating}/5` : 'N/A'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem' }}>{dayjs(appointment.bookedAt).format("MMM D, YYYY h:mm A")}</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem' }}>{dayjs(appointment.appointmentDateTime).format("MMM D, YYYY h:mm A")}</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem' }}>
                      <Chip 
                        label={appointment.status} 
                        color={
                          appointment.status === "Completed" ? "success" :
                          appointment.status === "Cancelled" ? "error" : 
                          appointment.status === "No Arrival" ? "warning" : "default"
                        } 
                        size="small"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[15, 30, 50]}
                    colSpan={user?.role === "admin" ? 10 : 7}
                    count={filteredHistoryAppointments.length}
                    rowsPerPage={historyRowsPerPage}
                    page={historyPage}
                    onPageChange={handleHistoryPageChange}
                    onRowsPerPageChange={handleHistoryRowsPerPageChange}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Box>
      )}
    </DashboardLayout>
  );
};

const ServiceName = ({ serviceId }) => {
  const { data: service } = useFetchServiceByIdQuery(serviceId);
  return service ? service.title : "Loading...";
};

const ServicePrice = ({ serviceId }) => {
  const { data: service } = useFetchServiceByIdQuery(serviceId);
  return service ? `₱${service.price}` : "Loading...";
};

export default AppointmentsBase;