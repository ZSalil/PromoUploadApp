import React from "react";
import Stack from "@mui/material/Stack";
import DragAndDrop from "./DragAndDrop";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import TextField from "@mui/material/TextField";
import { OrderContext } from "./OrderProvider";
import Button from "@mui/material/Button";
import { LoadingButton } from "@mui/lab";
import AutoFixHighTwoToneIcon from "@mui/icons-material/AutoFixHighTwoTone";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import FormGroup from "@mui/material/FormGroup";
import Switch from "@mui/material/Switch";
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
const OrderSideBar = () => {
  const {
    selectedValues,
    handleChange,
    onSubmit,
    isLoading,
    handleProcess,
    isSubmittable,
    handleHoldPickChange,
    orderType, setOrderType
  } = React.useContext(OrderContext);
  
  const handleOrderTypeChange = (event) => {
    setOrderType(event.target.value);
  };

  return (
    <>
      <Stack spacing={2}>
        <Typography
          variant="h4"
          className="border-bottom pb-2 border-success d-flex justify-content-between"
          component="div"
          gutterBottom
        >
          Single Order

          <a
            href="Single-order-sample.csv"
            target="_blank"
          >
            <Tooltip title="Single Sample File">
              <IconButton>
                <DownloadForOfflineIcon />
              </IconButton>
            </Tooltip>
          </a>
        </Typography>
        <FormControl>
          <FormLabel
            id="demo-controlled-radio-buttons-group"
            className="fw-bold"
          >
            Order Type
          </FormLabel>
          <ToggleButtonGroup
            color="primary"
            value={orderType}
            exclusive
            onChange={handleOrderTypeChange}
          >
            <ToggleButton value="retail">Retail</ToggleButton>
            <ToggleButton value="wholesale">Wholesale</ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
        <DragAndDrop />

        <TextField
          InputLabelProps={{ shrink: true }}
          name="po_number"
          value={selectedValues?.po_number?.value}
          id="standard-basic"
          onChange={handleChange}
          label="PO Number"
          variant="standard"
        />
        <TextField
          InputLabelProps={{ shrink: true }}
          name="customer_account"
          value={selectedValues?.customer_account?.value}
          id="standard-basic"
          onChange={handleChange}
          label="Customer Account"
          variant="standard"
        />
        <FormGroup>
          <FormControlLabel
            onChange={handleHoldPickChange}
            name="holdPick"
            control={<Switch defaultChecked />}
            label="Hold Pick"
          />
        </FormGroup>
        {orderType === "retail" ? (
          <FormControl>
            <FormLabel
              id="demo-controlled-radio-buttons-group"
              className="fw-bold"
            >
              Retail Order Upload
            </FormLabel>
            <FormLabel
              id="demo-controlled-radio-buttons-group"
              className="fw-bold"
            >
              Company To create Order In
            </FormLabel>
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="source"
              value={selectedValues?.source?.value}
              onChange={handleChange}
            >
              <FormControlLabel
                value="jrau"
                control={<Radio />}
                label="Jaycar AU (jrau)"
              />
              <FormControlLabel
                value="jrnz"
                control={<Radio />}
                label=" Jaycar NZ (jrnz)"
              />
              <FormControlLabel
                value="nzau"
                control={<Radio />}
                label="Jaycar NZ (supply from Australia) (nzau)"
              />
              <FormControlLabel
                value="rtau"
                control={<Radio />}
                label="RTM AU (rtau)"
              />
            </RadioGroup>
          </FormControl>
        ) : (
          ""
        )}
        {orderType === "wholesale" ? (
          <FormControl>
            <FormLabel
              id="demo-controlled-radio-buttons-group"
              className="fw-bold"
            >
              Wholesale Order Upload
            </FormLabel>
            <FormLabel
              id="demo-controlled-radio-buttons-group"
              className="fw-bold"
            >
              Company To create Order In
            </FormLabel>
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="source"
              value={selectedValues?.electus?.sdau}
              onChange={handleChange}
            >
              <FormControlLabel
                value="sdau"
                control={<Radio />}
                label="Electus Wholesale Au (sdau)"
              />
              <FormControlLabel
                value="sdnz"
                control={<Radio />}
                label="Electus Wholesale NZ (sdnz)"
              />
            </RadioGroup>
          </FormControl>
        ) : (
          ""
        )}

        <LoadingButton
          onClick={handleProcess}
          endIcon={<AutoFixHighTwoToneIcon />}
          loading={isLoading}
          loadingPosition="end"
          variant="contained"
        >
          Process Data
        </LoadingButton>

        <Button
          variant="contained"
          disabled={!isSubmittable}
          onClick={onSubmit}
        >
          Submit
        </Button>
      </Stack>
    </>
  );
};

export default OrderSideBar;
