import { useEffect, useState } from "react";
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
  Rating,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useFetchReviewsQuery,
  useDeleteReviewMutation,
} from "../../services/api/reviewsApi";
import { useFetchServiceByIdQuery } from "../../services/api/servicesApi";
import FadeAlert from "../../components/FadeAlert/FadeAlert";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import ReviewDetailsModal from "./ReviewDetailsModal";

const ReviewsBase = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 15,
  });

  const [deleteReview] = useDeleteReviewMutation();
  const [selectedReview, setSelectedReview] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [alert, setAlert] = useState(null);

  const {
    data: reviewsData,
    isLoading,
    isError,
    refetch,
  } = useFetchReviewsQuery({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
  });

  useEffect(() => {
    if (location.state?.alert) {
      setAlert(location.state.alert);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const handleViewDetails = (review) => {
    setSelectedReview(review);
    setOpenDetailsModal(true);
  };

  const handleOpenDialog = (review) => {
    setSelectedReview(review);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReview(null);
  };

  const handleAlertClose = () => {
    setAlert(null);
  };

  const handleDelete = async () => {
    if (selectedReview) {
      try {
        await deleteReview(selectedReview.id).unwrap();
        setOpenDialog(false);
        refetch();
        setAlert({
          message: "Review deleted successfully!",
          severity: "success",
        });
      } catch (error) {
        setAlert({
          message: `Error deleting review: ${error.message}`,
          severity: "error",
        });
      }
    }
  };

  const columns = [
    {
      field: "name",
      headerName: "Reviewer",
      width: 200,
      renderCell: (params) => params.row.name,
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
      field: "rating",
      headerName: "Rating",
      width: 150,
      renderCell: (params) => (
        <Rating 
          value={params.row.rating} 
          precision={0.5} 
          readOnly 
          size="small" 
        />
      ),
    },
    {
      field: "date",
      headerName: "Review Date",
      width: 150,
      renderCell: (params) =>
        dayjs(params.row.date).format("DD/MM/YYYY"),
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
            onClick={() => user?.role === "admin" ? handleViewDetails(params.row) : navigate(`/reviews/edit/${params.row.id}`)}
            sx={{ mr: 1 }}
          >
            {user?.role === "admin" ? "View" : "Edit"}
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
    return <Typography>Loading...</Typography>;
  }

  if (isError) {
    return <Typography>Error loading reviews</Typography>;
  }

  const filteredReviews =
    user?.role === "admin"
      ? reviewsData?.results || []
      : (reviewsData?.results || []).filter((review) => review.userId === user.id);

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
        {user?.role === "admin" ? "Manage All Reviews" : "My Reviews"}
      </Typography>
      <Box sx={{ height: 650, width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: isSmallScreen ? "flex-start" : "flex-end",
            mb: 2,
          }}
        >
          {user?.role !== "admin" && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/reviews/create")}
            >
              Write a Review
            </Button>
          )}
        </Box>
        <DataGrid
          rows={filteredReviews}
          columns={columns}
          rowCount={reviewsData?.totalResults || 0}
          loading={isLoading}
          paginationMode="server"
          pageSizeOptions={[15, 50, 100]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          disableSelectionOnClick
        />

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Delete Review"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete the review for{" "}
              {selectedReview?.title}?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDelete} color="secondary" autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
        
        <ReviewDetailsModal
          open={openDetailsModal}
          onClose={() => setOpenDetailsModal(false)}
          review={selectedReview}
        />
      </Box>
    </DashboardLayout>
  );
};

export default ReviewsBase;