import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { OrderContext } from "./OrderProvider";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";
import Swal from "sweetalert2";
import moment from "moment";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import ScheduleSendIcon from "@mui/icons-material/ScheduleSend";
import Grid from "@mui/material/Grid";
import { Stack } from "@mui/material";
import redeemOrderService from "../../_services/redeem-order.service";
import CloseIcon from "@mui/icons-material/Close";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};
const OrderModal = (props) => {
  
  const [card, setCard] = React.useState({});
  const { rows, selected,open, setOpen, updateOrderTable } =
    React.useContext(OrderContext);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  React.useEffect(() => {
    setCard(rows.filter((obj) => selected.includes(obj.pk))?.[0]?.order);
  }, [updateOrderTable, rows, selected]);

  const handleScheduleOrderExpiry = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Please select a date to extend Card Expiry date",
      html: '<input id="expiry_date" type="date" class="swal2-input">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Set",
      showLoaderOnConfirm: true,
      preConfirm: () => {
        let expiry_date = document.getElementById("expiry_date").value;

        let payload = {
          expirydate: moment(expiry_date).format("YYYY-MM-DD HH:mm:ss"),
          _method: "PATCH",
        };

        return redeemOrderService
          .updateOrders(card.pk, payload)
          .then(({ data }) => {
            updateOrderTable();
            return data;
          })
          .catch((_res) => {
            console.log(_res);
          });
      },
    });

    if (formValues) {
    }
  };

  const handleSendEmail = async () => {
    await Swal.fire({
      title: "Resend order email?",
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Yes",
      showLoaderOnConfirm: true,
      preConfirm: () => {

        let payload = {
          email_schedule_date: moment().format("YYYY-MM-DD HH:mm:ss"),
          email_sent: 0,
          _method: "PATCH",
        };

        return redeemOrderService
          .updateOrders(card.pk, payload)
          .then(({ data }) => {
            updateOrderTable();
          })
          .catch((_res) => {
            console.log(_res);
          });
      },
    });
  };

  return (
    <div>
      <Button
        variant="contained"
        size="small"
        style={{ whiteSpace: "nowrap" }}
        onClick={handleOpen}
      >
        Update Order
      </Button>

      <Modal
        keepMounted
        open={open}
        onClose={handleClose}
        aria-labelledby="keep-mounted-modal-title"
        aria-describedby="keep-mounted-modal-description"
      >

        <Box sx={style}>
          <Grid
            container
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
          >
            <Stack direction="row" spacing={2}>
              <Box sx={{ display: "flex", alignItems: "flex-end" }}>
                <Typography
                  id="keep-mounted-modal-title"
                  variant="h6"
                  component="h2"
                >
                  Order Information
                </Typography>
              </Box>

              <Tooltip title="Schedule Order Expiry">
                <IconButton onClick={handleScheduleOrderExpiry}>
                  <ScheduleSendIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Send Email">
                <IconButton onClick={handleSendEmail}>
                  <ForwardToInboxIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Send Email">
                <IconButton onClick={()=>handleClose()}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Grid>

          <p>Gift Card Number : {card?.giftcardnumber}</p>
          <p>Value : {card?.cardvalue}</p>
          <p>Created at : {card?.created_at}</p>
          <p>Created By : {card?.created_by}</p>
          <p>Currency : {card?.currency}</p>
          <p>Customer Code : {card?.customer_code}</p>
          <p>Date Email Sent : {card?.email_sent}</p>
          <p>Email Address : {card?.email_address}</p>
          <p>Email Sent : {card?.email_sent}</p>
          <p>Email Schedule Date : {card?.email_schedule_date}</p>
          <p>Expiry Date : {card?.expirydate}</p>
          <p>Updated At : {card?.updated_at}</p>
          <p>Updated By : {card?.updated_by}</p>
        </Box>
      </Modal>
    </div>
  );
};

export default OrderModal;
