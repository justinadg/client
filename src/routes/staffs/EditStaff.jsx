import { useParams } from "react-router-dom";
import { useFetchStaffByIdQuery } from "../../services/api/staffsApi";
import StaffForm from "../../forms/StaffForm";
import { CircularProgress, Typography } from "@mui/material";

const EditStaff = () => {
  const { userId } = useParams();
  const {
    data: staffToEdit,
    isLoading,
    isError,
  } = useFetchStaffByIdQuery(userId);

  if (isLoading) {
    return <CircularProgress disableShrink />;
  }

  if (isError || !staffToEdit) {
    return <Typography variant="h6">Staff not found</Typography>;
  }

  return <StaffForm staffToEdit={staffToEdit} />;
};

export default EditStaff;
