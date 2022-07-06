import * as React from "react";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import clsx from "clsx";
import "./OrderTable.css";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbar,
} from "@mui/x-data-grid";
import { randomId } from "@mui/x-data-grid-generator";
import { OrderContext } from "./OrderProvider";
import OrderSideBar from "./OrderSideBar";
import { connect } from "react-redux";
import { CustomFooter } from "./CustomFooter";
import LinearProgress from '@mui/material/LinearProgress';
function EditToolbar(props) {



  return (
    <GridToolbarContainer className="justify-content-between">
      <GridToolbar />
      {/* <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Add record
      </Button> */}
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
  const { items, setFinalList, message,isLoading, columns, setColumns } =
    React.useContext(OrderContext);
  const [rows, setRows] = React.useState(items);

  const [columnData, setColumnData] = React.useState();
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

  const redRowClass = (prams) => {
    let inValid = false;
    if (parseInt(prams?.total) < 1) {
      inValid = true;
    }
    if (parseInt(prams?.total) > parseInt(prams?.free_stock)) {
      inValid = true;
    }
    return inValid;
  };

  const handleOnCellClick = (params, event) => {
    console.log(params);
    console.log(event);
    setColumnData(params?.row);
  };



  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  // const columns = [
  //   {
  //     field: "part_number",
  //     headerName: "Part Number",
  //     align: "center",
  //     headerAlign: "center",
  //     width: 180,
  //     editable: true,
  //     flex: 1,
  //   },
  //   {
  //     field: "free_stock",
  //     headerName: "Available Stock",
  //     type: "number",
  //     align: "center",
  //     headerAlign: "center",
  //     editable: true,
  //     flex: 1,
  //   },
  //   {
  //     field: "uom",
  //     headerName: "Unit",
  //     align: "center",
  //     headerAlign: "center",
  //     editable: true,
  //     flex: 1,
  //   },
  //   {
  //     field: "location",
  //     headerName: "Location",
  //     align: "center",
  //     headerAlign: "center",
  //     editable: true,
  //     flex: 1,
  //   },
  //   {
  //     field: "adn",
  //     headerName: "ADN",
  //     align: "center",
  //     headerAlign: "center",
  //     editable: true,
  //     flex: 1,
  //   },
  //   {
  //     field: "actions",
  //     type: "actions",
  //     align: "right",
  //     headerAlign: "right",
  //     headerName: "Actions",
  //     width: 100,
  //     cellClassName: "actions",
  //     flex: 1,
  //     getActions: ({ id }) => {
  //       const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

  //       if (isInEditMode) {
  //         return [
  //           <GridActionsCellItem
  //             icon={<SaveIcon />}
  //             label="Save"
  //             onClick={handleSaveClick(id)}
  //             color="primary"
  //           />,
  //           <GridActionsCellItem
  //             icon={<CancelIcon />}
  //             label="Cancel"
  //             className="textPrimary"
  //             onClick={handleCancelClick(id)}
  //             color="inherit"
  //           />,
  //         ];
  //       }

  //       return [
  //         <GridActionsCellItem
  //           icon={<EditIcon />}
  //           label="Edit"
  //           className="textPrimary"
  //           onClick={handleEditClick(id)}
  //           color="inherit"
  //         />,
  //         <GridActionsCellItem
  //           icon={<DeleteIcon />}
  //           label="Delete"
  //           onClick={handleDeleteClick(id)}
  //           color="inherit"
  //         />,
  //       ];
  //     },
  //   },
  // ];
  return (
    <Grid container className="pb-4" spacing={2}>
      
      <Grid item xs={8}>
     {isLoading && <LinearProgress />} 
        <Item>
        {message && message?.success && (
            <Alert sx={{width: "100%"}}severity="success" style={{ marginTop: 8,maxHeight: 300,overflow: 'auto'}}>
              <div
                dangerouslySetInnerHTML={{
                  __html: `<ul style="text-align: left;">${message?.success?.join(" ")}</ul>`
                }}
              />
            </Alert>
          )}
          {message && message?.suggestion && (
            <Alert sx={{width: "100%"}}severity="info" style={{ marginTop: 8,maxHeight: 300,overflow: 'auto'}}>
              <div
                dangerouslySetInnerHTML={{
                  __html: `<ul style="text-align: left;">${message?.suggestion?.join(" ")}</ul>`
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
              "& .row-error": {
                bgcolor: "#ff171796",
                "&:hover": {
                  bgcolor: "#ff1717bd !important",
                },
              },
              "& .Mui-selected": {
                bgcolor: "#bdffbd !important",
              },
            }}
          >
            <DataGrid
              rows={rows}
              columns={columns}
              editMode="row"
              density="standard"
              rowModesModel={rowModesModel}
              onCellClick={handleOnCellClick}
              onRowEditStart={handleRowEditStart}
              onRowEditStop={handleRowEditStop}
              rowsPerPageOptions={[]}
              processRowUpdate={processRowUpdate}
              components={{
                Toolbar: EditToolbar,
                Footer: CustomFooter,
              }}
              componentsProps={{
                toolbar: { setRows, setRowModesModel },
                footer: { columnData },
              }}
              experimentalFeatures={{ newEditingApi: true }}
              getRowClassName={(params) => {
                if (params?.row?.total) {
                  return clsx({
                    "row-error": redRowClass(params?.row),
                  });
                } else {
                  return "";
                }
              }}
            />
          </Box>
          {message && message?.warning && (
            <Alert sx={{width: "100%"}}severity="warning" style={{ marginTop: 8,maxHeight: 300,overflow: 'auto'}}>
              <div
                dangerouslySetInnerHTML={{
                  __html: `<ul style="text-align: left;">${message?.warning?.join(" ")}</ul>`
                }}
              />
            </Alert>
          )}
          {message && message?.error && (
            <Alert sx={{width: "100%"}}severity="error" style={{ marginTop: 8,maxHeight: 300,overflow: 'auto'}}>
              <div
                dangerouslySetInnerHTML={{
                  __html: `<ul style="text-align: left;">${message?.error?.join(" ")}</ul>`
                }}
              />
            </Alert>
          )}
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
