import { useParams } from "react-router-dom";
import { useFetchStockByIdQuery } from "../../services/api/stocksApi";
import StockForm from "../../forms/StockForm";
import { CircularProgress, Typography } from "@mui/material";

const EditStock = () => {
  const { stockId } = useParams();
  const {
    data: stockToEdit,
    isLoading,
    isError,
  } = useFetchStockByIdQuery(stockId);

  if (isLoading) {
    return <CircularProgress disableShrink />;
  }

  if (isError || !stockToEdit) {
    return <Typography variant="h6">Stock item not found</Typography>;
  }

  return <StockForm stockToEdit={stockToEdit} />;
};

export default EditStock;