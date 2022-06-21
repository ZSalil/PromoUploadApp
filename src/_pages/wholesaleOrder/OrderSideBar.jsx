import React from "react";
import Stack from "@mui/material/Stack";
import DragAndDrop from "./DragAndDrop";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import TextField from "@mui/material/TextField";
import { OrderContext } from './OrderProvider';
import Button from '@mui/material/Button';
import { LoadingButton } from '@mui/lab';
import AutoFixHighTwoToneIcon from '@mui/icons-material/AutoFixHighTwoTone';
const OrderSideBar = () => {
  const {selectedValues,handleChange,onSubmit,isLoading,handleProcess,dataProcessed } = React.useContext(OrderContext);
//   const handleChange = (event) => {
//     setValue(event.target.value);
//   };
  return (
    <>
      <Stack spacing={2}>
        <DragAndDrop />

        {/* <TextField InputLabelProps={{ shrink: true }}  name="po_number" value={selectedValues?.po_number?.value} id="standard-basic" onChange={handleChange} label="PO Number" variant="standard" />
        <TextField InputLabelProps={{ shrink: true }} name="customer_account" value={selectedValues?.customer_account?.value} id="standard-basic" onChange={handleChange} label="Customer Account" variant="standard" /> */}
        <FormControl>
          <FormLabel id="demo-controlled-radio-buttons-group" className="fw-bold">
            Retail Order Upload
          </FormLabel>
          <FormLabel id="demo-controlled-radio-buttons-group" className="fw-bold">
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
              label="Jaycar AU"
            />
            <FormControlLabel
              value="jrnz"
              control={<Radio />}
              label=" Jaycar NZ"
            />
            <FormControlLabel
              value="nzau"
              control={<Radio />}
              label="Jaycar NZ (supply from Australia)"
            />
             <FormControlLabel
              value="rtau"
              control={<Radio />}
              label="RTM AU"
            />
          </RadioGroup>
        </FormControl>
        {/* <FormControl>
          <FormLabel id="demo-controlled-radio-buttons-group" className="fw-bold">
            SDAU and SDNZ
          </FormLabel>
          <RadioGroup
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="source"
            value={selectedValues?.electus?.sdau}
            onChange={handleChange}
          >
            <FormControlLabel
              value="female"
              control={<Radio />}
              label="Electus Wholesale Au (edau)"
            />
            <FormControlLabel value="male" control={<Radio />} label="Electus Wholesale Nz (tbnz)" />
          </RadioGroup>
        </FormControl> */}
       {dataProcessed ? <LoadingButton
          onClick={handleProcess}
          endIcon={<AutoFixHighTwoToneIcon />}
          loading={isLoading}
          loadingPosition="end"
          variant="contained"
        >
          Process Data
        </LoadingButton> : ''} 
        <Button variant="contained" onClick={onSubmit}>Submit</Button>
      </Stack>
    </>
  );
};

export default OrderSideBar;
