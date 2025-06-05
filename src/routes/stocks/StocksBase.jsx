import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  useFetchStocksQuery, 
  useUpdateStockMutation, 
  useDeleteStockMutation,
} from "../../services/api/stocksApi";
import DashboardLayout from "../../layouts/DashboardLayout";
import { ButtonsContainer } from "./StocksBase.styles";
import FadeAlert from "../../components/FadeAlert/FadeAlert";

const StocksBase = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 15,
  });

  const { 
    data: stocksData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useFetchStocksQuery({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
  });
  
  const [updateStock] = useUpdateStockMutation();
  const [deleteStock] = useDeleteStockMutation();
  const [selectedStock, setSelectedStock] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [alert, setAlert] = useState(location.state?.alert || null);

  useEffect(() => {
    if (location.state?.alert) {
      setAlert(location.state.alert);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (isError) {
      setAlert({
        severity: "error",
        message: error?.data?.message || "Failed to load stock items",
      });
    }
  }, [isError, error]);

  const handleEdit = (id) => {
    navigate(`/manage-stocks/edit/${id}`);
  };

  const handleOpenDialog = (stock) => {
    setSelectedStock(stock);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStock(null);
  };

  const handleAlertClose = () => {
    setAlert(null);
  };

  const handleDelete = async () => {
    if (selectedStock) {
      try {
        await deleteStock(selectedStock.id).unwrap();
        setOpenDialog(false);
        setAlert({
          severity: "success",
          message: "Stock item deleted successfully!",
        });
        refetch();
      } catch (error) {
        setAlert({
          severity: "error",
          message: error?.data?.message || "Failed to delete stock item",
        });
      }
    }
  };

  const columns = [
    { 
      field: "type",
      headerName: "Item Name", 
      width: 200 
    },
    { 
      field: "category", 
      headerName: "Category", 
      width: 150 
    },
    { 
      field: "price", 
      headerName: "Price", 
      width: 150,
      renderCell: (params) => (
        <Typography>₱{(params.row.price || 0).toFixed(2)}</Typography>
      )
    },
    { 
      field: "quantity", 
      headerName: "Quantity",
      width: 150,
      renderCell: (params) => (
        <Typography>{params.row.quantity || 0}</Typography>
      )
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleEdit(params.row.id)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={() => handleOpenDialog(params.row)}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
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
        Manage Stock
      </Typography>
      
      <ButtonsContainer>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/manage-stocks/create")}
        >
          Add New Stock Item
        </Button>
      </ButtonsContainer>

      <Box sx={{ height: 650, width: "100%", mt: 2 }}>
        {isError ? (    
          <Alert severity="error" sx={{ mb: 2 }}>
            {error?.data?.message || "Failed to load stock items"}
            <Button onClick={() => refetch()} sx={{ ml: 2 }}>
              Retry
            </Button>
          </Alert>
        ) : (
          <DataGrid
            rows={stocksData?.results || []}
            columns={columns}
            loading={isLoading}
            rowCount={stocksData?.totalResults || 0}
            paginationMode="server"
            pageSizeOptions={[15, 50, 100]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            disableSelectionOnClick
          />
        )}
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Delete Stock Item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the stock item{" "}
            <strong>{selectedStock?.type}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default StocksBase;