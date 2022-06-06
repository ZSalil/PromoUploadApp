import React, { useEffect } from 'react'
import { connect } from 'react-redux';
import { logout } from "../_actions/auth";

const LogOut = ({dispatch}) => {

    useEffect(() => {
        
      dispatch(logout())

      }, [])

  return (
    <div>Log Out</div>
  )
}

function mapStateToProps(state) {

}

export default connect(mapStateToProps)(LogOut);
