import React, { useState, useContext, useEffect } from "react";
import Stack from "@mui/material/Stack";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";  // Correct imports from @mui/x-date-pickers
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import TextField from "@mui/material/TextField";
import DragAndDrop from "./DragAndDrop";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Button from "@mui/material/Button";
import { LoadingButton } from "@mui/lab";
import AutoFixHighTwoToneIcon from "@mui/icons-material/AutoFixHighTwoTone";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { OrderContext } from "./OrderProvider";
import { toast } from "react-toastify";

dayjs.locale("en-gb");

const OrderSideBar = () => {
  const {
    selectedValues,
    handleProcess,
    handleSubmit,
    isLoading,
    orderType,
    setOrderType,
    isSubmitEnabled,
    setIsSubmitEnabled,
    storeMode,
    setStoreMode,
  } = useContext(OrderContext);

  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateDates = () => {
    let isValid = true;
    if (!startDate) {
      setStartDateError("Start date is required");
      toast.error("Start date is required");
      isValid = false;
    } else if (startDate.isBefore(dayjs(), "day")) {
      setStartDateError("Start date cannot be in the past");
      toast.warning("Start date cannot be in the past");
      isValid = false;
    } else {
      setStartDateError("");
    }
    if (!endDate) {
      setEndDateError("End date is required");
      toast.error("End date is required");
      isValid = false;
    } else if (endDate.isBefore(startDate, "day")) {
      setEndDateError("End date cannot be before the start date");
      toast.warning("End date cannot be before the start date");
      isValid = false;
    } else if (endDate.isAfter(dayjs().add(1, 'year'), 'day')) {
      setEndDateError("End date is too far in the future");
      toast.warning("End date cannot be more than a year in the future");
      isValid = false;
    } else {
      setEndDateError("");
    }
    return isValid;
  };

  useEffect(() => {
    validateDates();
  }, [startDate, endDate]);

  const handleStartDateChange = (newValue) => {
    setStartDate(newValue);
    setIsSubmitEnabled(false);
  };

  const handleEndDateChange = (newValue) => {
    setEndDate(newValue);
    setIsSubmitEnabled(false);
  };

  const handleOrderTypeChange = (event, newOrderType) => {
    setOrderType(newOrderType);
    setIsSubmitEnabled(false);
  };

  const handleStoreModeChange = (event, newStoreMode) => {
    setStoreMode(newStoreMode);
    setIsSubmitEnabled(false);
  };

  const handleProcessData = async () => {
    if (!orderType) {
      toast.error("You must select a company before processing data.");
      return;
    }

    if (!storeMode) {
      toast.error("Please select a mode (Online or In-store) before continuing.");
      return;
    }

    if (validateDates()) {
      if (!Array.isArray(selectedValues?.items) || selectedValues.items.length === 0) {
        toast.error("No items selected. Please add items to process.");
        return;
      }

      handleProcess(startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD"));
      setIsSubmitEnabled(true);
    }
  };

  const handleSubmitData = async () => {
    if (!isSubmitEnabled) {
      toast.error("Please process the data first.");
      return;
    }

    if (!storeMode) {
      toast.error("Please select a mode (Online or In-store) before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      await handleSubmit(startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD"), orderType);
      toast.success("Uploading to database.");
    } catch (error) {
      toast.error("Failed to update the database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack spacing={2}>
        <Typography
          variant="h4"
          className="border-bottom pb-2 border-success d-flex justify-content-between"
          component="div"
          gutterBottom
        >
          Promo Price Uploader
          <a href="Promo-Prices-Sample.csv" download="Promo-Prices-Sample.csv" target="_blank">
            <Tooltip title="Download Sample CSV File">
              <IconButton>
                <DownloadForOfflineIcon />
              </IconButton>
            </Tooltip>
          </a>
        </Typography>

        <Typography variant="body1" color="textSecondary" gutterBottom>
          Welcome to the JEG Promo Uploader. Please select a company and mode to continue.
        </Typography>

        {/* Add Store Mode Selection */}
        <FormControl>
          <FormLabel className="fw-bold">Promo Type</FormLabel>
          <ToggleButtonGroup
            color="primary"
            value={storeMode}
            exclusive
            onChange={handleStoreModeChange}
          >
            <ToggleButton value="online">Online</ToggleButton>
            <ToggleButton value="in-store">In-store</ToggleButton>
          </ToggleButtonGroup>
        </FormControl>

        <FormControl>
          <FormLabel className="fw-bold">Select Company</FormLabel>
          <ToggleButtonGroup
            color="primary"
            value={orderType}
            exclusive
            onChange={handleOrderTypeChange}
          >
            <ToggleButton value="jaycar-au">Jaycar AU</ToggleButton>
            <ToggleButton value="jaycar-nz">Jaycar NZ</ToggleButton>
            <ToggleButton value="rtm">RTM</ToggleButton>
          </ToggleButtonGroup>
        </FormControl>

        <DragAndDrop />

        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={handleStartDateChange}
          renderInput={(params) => (
            <TextField {...params} error={Boolean(startDateError)} helperText={startDateError} />
          )}
          format="YYYY-MM-DD"
        />
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={handleEndDateChange}
          renderInput={(params) => (
            <TextField {...params} error={Boolean(endDateError)} helperText={endDateError} />
          )}
          format="YYYY-MM-DD"
        />

        {isSubmitting && <LinearProgress />}

        <LoadingButton
          onClick={handleProcessData}
          endIcon={<AutoFixHighTwoToneIcon />}
          loading={isLoading}
          loadingPosition="end"
          variant="contained"
          disabled={!storeMode} // Disable button if no mode is selected
        >
          Process Data
        </LoadingButton>

        <Button
          variant="contained"
          disabled={!isSubmitEnabled || isSubmitting || !storeMode} // Disable button if no mode is selected
          onClick={handleSubmitData}
        >
          Submit
        </Button>

        <Button
          variant="outlined"
          color="primary"
          startIcon={<HelpOutlineIcon />}
          href="https://jaycar.atlassian.net/wiki/spaces/SM/pages/3302096898/Promotional+Pricing+Uploader#Questions"
          target="_blank"
        >
          Help Me
        </Button>
      </Stack>
    </LocalizationProvider>
  );
};

export default OrderSideBar;
