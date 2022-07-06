import React from "react";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import IconButton from "@mui/material/IconButton";
import PreviewIcon from "@mui/icons-material/Preview";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { DashboardContext } from "./DashboardProvider";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  height: "80vh",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};
const OrderItemTable = () => {
  const columns = [
    {
      field: "vii_reference",
      headerName: "Reference ID",
      align: "center",
      headerAlign: "center",
      width: 180,
      flex: 1,
    },
    {
      field: "vii_custline",
      headerName: "vii_custline",
      type: "number",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "vii_supploc",
      headerName: "vii_supploc",
      type: "number",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "vii_cusprod",
      headerName: "vii_cusprod",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "vii_product",
      headerName: "vii_product",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "vii_quantity",
      headerName: "vii_quantity",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "vii_unit",
      headerName: "vii_unit",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
  ];
  const { setOpen, open, orderItems, isItemTableLoading } =
    React.useContext(DashboardContext);

  const handleClose = () => setOpen(false);
  return (
    <div>
      {" "}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <DataGrid
            columns={columns}
            rows={orderItems}
            components={{ Toolbar: GridToolbar }}
            loading={isItemTableLoading}
            hideFooter
            hideFooterPagination
          />
        </Box>
      </Modal>
    </div>
  );
};

export default OrderItemTable;
