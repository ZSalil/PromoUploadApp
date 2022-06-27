import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";

function CustomFooter(props) {
    console.log(props);
  return (
    <React.Fragment>
      {props?.columnData && <Box sx={{ padding: "10px", display: "flex",justifyContent: "space-between" }}> <span><strong>Selected Product :</strong> {props?.columnData?.product_number}</span>  <span><strong>Total: </strong>{props?.columnData?.total} </span></Box>}
    </React.Fragment>
  );
}

CustomFooter.propTypes = {
  total: PropTypes.number,
};

export { CustomFooter };
