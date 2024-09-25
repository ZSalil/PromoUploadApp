import * as React from "react";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import clsx from 'clsx';
import LinearProgress from '@mui/material/LinearProgress';
import {
  GridRowModes,
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
  GridToolbar
} from "@mui/x-data-grid";
import { randomId } from "@mui/x-data-grid-generator";
import { OrderContext } from "./OrderProvider";
import OrderSideBar from './OrderSideBar';
import { connect } from 'react-redux';
import { Alert } from "@mui/material";
import axios from "axios"; // Import axios to fetch original price

function EditToolbar(props) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = randomId();
    setRows((oldRows) => [
      { id, part_number: "", quantity: "", isNew: true },
      ...oldRows
    ]);
    setRowModesModel((oldModel) => ({
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "part_number" },
      ...oldModel
    }));
  };

  return (
    <GridToolbarContainer className="justify-content-between">
      <GridToolbar />
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Add record
      </Button>
    </GridToolbarContainer>
  );
}

EditToolbar.propTypes = {
  setRowModesModel: PropTypes.func.isRequired,
  setRows: PropTypes.func.isRequired,
};

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const OrderTable = ({ dispatch }) => {
  const { items, setFinalList, message, isLoading, orderType } = React.useContext(OrderContext);
  const [rows, setRows] = React.useState(items);
  const [rowModesModel, setRowModesModel] = React.useState({});

  React.useEffect(() => {
    setRows(items);
  }, [items]);

  React.useEffect(() => {
    setFinalList(rows);
  }, [rows, setFinalList]);

  const handleRowEditStart = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleRowEditStop = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => () => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const fetchOriginalPrice = async (part_number, orderType) => {
    try {
        const response = await axios.get(`http://localhost:5000/api/get-original-price/${orderType}/${part_number}`); // Ensure full URL is used
        return response.data.originalPrice;
    } catch (error) {
        console.error("Error fetching original price:", error);
        return 0; // Return 0 if the price is not found
    }
};

const processRowUpdate = async (newRow) => {
  const originalPrice = await fetchOriginalPrice(newRow.part_number, orderType); // Fetch original price based on orderType

  // If the original price is found and is greater than 0, calculate discount
  const discount = (originalPrice && originalPrice > 0) 
  ? ((originalPrice - parseFloat(newRow.quantity)) / originalPrice * 100).toFixed(2)
  : "0.00"; 

  const updatedRow = {
      ...newRow,
      isNew: false,
      discount: `${discount}%`,  // Append "%" to the discount value
  };

  // Update the rows in the table with the updated row
  setRows((prevRows) => prevRows.map((row) => (row.id === newRow.id ? updatedRow : row)));
  setFinalList((prevList) => prevList.map((row) => (row.id === newRow.id ? updatedRow : row)));

  return updatedRow;
};
  
  

const columns = [
  {
    field: "part_number",
    headerName: "Item",
    align: "center",
    headerAlign: "center",
    width: 180,
    editable: true,
    flex: 1,
  },
  {
    field: "quantity",
    headerName: "Price",
    type: "number",
    align: "center",
    headerAlign: "center",
    editable: true,
    flex: 1,
  },
  {
    field: "discount",
    headerName: "Discount (%)",
    align: "center",
    headerAlign: "center",
    flex: 1,
    valueFormatter: (params) => {
      // Ensure it always shows with percentage and handles missing values
      return params.value ? params.value : "0";
    },
  },
  {
    field: "actions",
    type: "actions",
    align: "right",
    headerAlign: "right",
    headerName: "Actions",
    width: 100,
    cellClassName: "actions",
    flex: 1,
    getActions: ({ id }) => {
      const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

      if (isInEditMode) {
        return [
          <GridActionsCellItem
            icon={<SaveIcon />}
            label="Save"
            onClick={handleSaveClick(id)}
            color="primary"
          />,
          <GridActionsCellItem
            icon={<CancelIcon />}
            label="Cancel"
            className="textPrimary"
            onClick={handleCancelClick(id)}
            color="inherit"
          />,
        ];
      }

      return [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          className="textPrimary"
          onClick={handleEditClick(id)}
          color="inherit"
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={handleDeleteClick(id)}
          color="inherit"
        />,
      ];
    },
  },
];


  return (
    <Grid container className="pb-4" spacing={2}>
      <Grid item xs={8}>
        {isLoading && <LinearProgress />}
        <Item>
          {message && message?.success && (
            <Alert sx={{ width: "100%" }} severity="success" style={{ marginTop: 8, maxHeight: 300, overflow: 'auto' }}>
              <div
                dangerouslySetInnerHTML={{
                  __html: `<ul style="text-align: left;">${message?.success?.join(" ")}</ul>`
                }}
              />
            </Alert>
          )}
          <Box
            sx={{
              height: "80vh",
              width: "100%",
              "& .actions": {
                color: "text.secondary",
              },
              "& .textPrimary": {
                color: "text.primary",
              },
              '& .row-error': {
                bgcolor: '#ff171796',
                "&:hover": {
                  bgcolor: "#ff1717bd !important",
                },
              },
            }}
          >
            <DataGrid
              rows={rows}
              columns={columns}
              editMode="row"
              density='standard'
              rowModesModel={rowModesModel}
              onRowEditStart={handleRowEditStart}
              onRowEditStop={handleRowEditStop}
              rowsPerPageOptions={[]}
              processRowUpdate={processRowUpdate}
              components={{
                Toolbar: EditToolbar,
              }}
              componentsProps={{
                toolbar: { setRows, setRowModesModel },
              }}
              experimentalFeatures={{ newEditingApi: true }}
              getRowClassName={(params) => {
                if (params?.row?.free_stock) {
                  return clsx({ 'row-error': parseInt(params?.row?.quantity) > parseInt(params?.row?.free_stock) });
                }
                return '';
              }}
            />
          </Box>
        </Item>
      </Grid>
      <Grid item xs={4}>
        <OrderSideBar />
      </Grid>
    </Grid>
  );
};

function mapStateToProps(state) {
  const { user } = state.auth;
  return {
    user,
  };
}

export default connect(mapStateToProps)(OrderTable);