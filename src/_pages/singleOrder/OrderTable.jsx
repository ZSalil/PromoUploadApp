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
import {
  randomId,
} from "@mui/x-data-grid-generator";
import { OrderContext } from "./OrderProvider";
import OrderSideBar from './OrderSideBar';
import { connect } from 'react-redux';
import { Alert } from "@mui/material";



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

const OrderTable = ({dispatch}) => {
  const { items, setFinalList,message ,isLoading} = React.useContext(OrderContext);
  const [rows, setRows] = React.useState(items);
  const [rowModesModel, setRowModesModel] = React.useState({});
  React.useEffect(() => {
    setRows(items);
  }, [items]);

  React.useEffect(() => {
    setFinalList(rows);
  }, [rows]);
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
    console.log(id);
    setFinalList(rows)
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

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const columns = [
    {
      field: "part_number",
      headerName: "Part Number",
      align: "center",
      headerAlign: "center",
      width: 180,
      editable: true,
      flex: 1,
    },
    {
      field: "quantity",
      headerName: "Quantity",
      type: "number",
      align: "center",
      headerAlign: "center",
      editable: true,
      flex: 1,
    },
    {
      field: "free_stock",
      headerName: "Available Stock",
      type: "number",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "uom",
      headerName: "Unit",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "location",
      headerName: "Location",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "adn",
      headerName: "ADN",
      align: "center",
      headerAlign: "center",
      flex: 1,
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
            <Alert sx={{width: "100%"}}severity="success" style={{ marginTop: 8,maxHeight: 300,overflow: 'auto'}}>
              <div
                dangerouslySetInnerHTML={{
                  __html: `<ul style="text-align: left;">${message?.success?.toString()}</ul>`
                }}
              />
            </Alert>
          )}
          {message && message?.suggestion && (
            <Alert sx={{width: "100%"}}severity="info" style={{ marginTop: 8,maxHeight: 300,overflow: 'auto'}}>
              <div
                dangerouslySetInnerHTML={{
                  __html: `<ul style="text-align: left;">${message?.suggestion?.toString()}</ul>`
                }}
              />
            </Alert>
          )}
          <Box
            sx={{
              height:"80vh",
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
                if(params?.row?.free_stock)
                {
                  return clsx({'row-error':parseInt(params?.row?.quantity) > parseInt(params?.row?.free_stock)});
                }
               else {
                return '';
               }
              }}
            />
          </Box>
          {message && message?.warning && (
            <Alert sx={{width: "100%"}}severity="warning" style={{ marginTop: 8,maxHeight: 300,overflow: 'auto'}}>
              <div
                dangerouslySetInnerHTML={{
                  __html: `<ul style="text-align: left;">${message?.warning?.toString()}</ul>`
                }}
              />
            </Alert>
          )}
          {message && message?.error && (
            <Alert sx={{width: "100%"}}severity="error" style={{ marginTop: 8,maxHeight: 300,overflow: 'auto'}}>
              <div
                dangerouslySetInnerHTML={{
                  __html: `<ul style="text-align: left;">${message?.error?.toString()}</ul>`
                }}
              />
            </Alert>
          )}
        </Item>
      </Grid>
      <Grid item xs={4}>
        <OrderSideBar/>
        
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