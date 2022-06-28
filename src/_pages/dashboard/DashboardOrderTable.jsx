import * as React from "react";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbar,
} from "@mui/x-data-grid";
import { DashboardContext } from "./DashboardProvider";
import { connect } from "react-redux";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import Input from "@mui/material/Input";
import SearchIcon from "@mui/icons-material/Search";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";

import IconButton from "@mui/material/IconButton";
import PreviewIcon from "@mui/icons-material/Preview";
import OrderItemTable from "./OrderItemTable";

function CustomPagination() {
  const { paginateItems, isLoading, update } =
    React.useContext(DashboardContext);
  const [page, sePage] = React.useState(1);
  const handleOnChange = async (value) => {
    let obj = {
      page: value,
    };
    await update(obj);
    sePage(value);

    // console.log(value)
    // apiRef.current.setPage(value - 1);
  };

  return (
    <Pagination
      color="primary"
      variant="outlined"
      shape="rounded"
      page={page}
      count={paginateItems?.last_page ?? 1}
      // @ts-expect-error
      renderItem={(props2) => (
        <PaginationItem {...props2} disableRipple disabled={isLoading} />
      )}
      onChange={(event, value) => handleOnChange(value)}
    />
  );
}

function Toolbar(props) {

  const { handleSearch } = React.useContext(DashboardContext);


  return (
    <GridToolbarContainer className="justify-content-between">
      <GridToolbar />
      <FormControl variant="standard">
        <Input
          id="input-with-icon-adornment"
          placeholder="Search"
          name="search_text"
          onChange={handleSearch}
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          }
        />
      </FormControl>
    </GridToolbarContainer>
  );
}

Toolbar.propTypes = {
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

const DashboardDashboardTable = ({ dispatch }) => {
  const { items, isLoading,setOpen, paginateItems,updateOrderItemTable } =
    React.useContext(DashboardContext);
  const [rowModesModel, setRowModesModel] = React.useState({});

  const handleOpen = (id) => {
    setOpen(true)
    updateOrderItemTable({vii_reference:id});
  };
  const columns = [
    {
      field: "vih_reference",
      headerName: "Reference ID",
      align: "center",
      headerAlign: "center",
      width: 180,
      flex: 1,
    },
    {
      field: "vih_idate",
      headerName: "Date",
      type: "number",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "vih_company",
      headerName: "Company",
      type: "number",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "vih_customer",
      headerName: "Customer",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "vih_cusref",
      headerName: "Customer Ref",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "vih_source",
      headerName: "Source",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "vih_status",
      headerName: "Status",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "vih_order",
      headerName: "No. Order Lines",
      flex: 1,
      renderCell: (params) => (
        <div>
          {params?.row?.order_count}{" "}
          <IconButton
            color="primary"
            onClick={()=>handleOpen(params?.row?.vih_reference)}
            component="span"
          >
            <PreviewIcon />
          </IconButton>
        </div>
      ),
    },
  ];
  return (
    <div>
      <OrderItemTable/>
      {isLoading && <LinearProgress />}
      <Item>
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
          }}
        >
          <DataGrid
            rows={items}
            columns={columns}
            density="standard"
            pageSize={50}
            rowsPerPageOptions={[50]}
            rowModesModel={rowModesModel}
            setPageSize={4}
            components={{
              Toolbar: Toolbar,
              Pagination: CustomPagination,
            }}
            componentsProps={{
              toolbar: { setRowModesModel },
            }}
            loading={isLoading}
            pagination
          />
        </Box>
      </Item>
    </div>
  );
};

function mapStateToProps(state) {
  const { user } = state.auth;
  return {
    user,
  };
}

export default connect(mapStateToProps)(DashboardDashboardTable);
