import React, { Component } from "react";
import { connect } from "react-redux";
import { Router, Route, Link, Routes } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "react-toastify/ReactToastify.min.css";
// import Register from "./components/register.component";
// import Home from "./components/home.component";
// import Profile from "./components/profile.component";
// import BoardUser from "./components/board-user.component";
// import BoardModerator from "./components/board-moderator.component";
// import BoardAdmin from "./components/board-admin.component";

import { logout } from "./_actions/auth";
import { clearMessage } from "./_actions/message";

import { history } from './_helpers/history';

// import AuthVerify from "./common/auth-verify";
import EventBus from "./_common/EventBus";
import Login from './_components/login.component';
import Order from './_pages/singleOrder/index';
import ResponsiveMenu from './_common/ResponsiveMenu';
import Dashboard from './_pages/dashboard/index';
import LogOut from './_components/LogOut';
import Alert from './_common/Alert';
import WholesaleOrder from './_pages/multiOrder/index';


import axios from 'axios';
import { Navigate } from "react-router-dom";
import ProtectedRoute from "./_common/ProtectedRoute";
// For GET requests
axios.interceptors.request.use(
  (req) => {
    // Add configurations here
    return req;
  },
  (err) => {
    console.log(err)
    return Promise.reject(err);
  }
);

// For POST requests
axios.interceptors.response.use(
  (res) => {
    // Add configurations here
    //  if (res.status === 201) {
    //  }
    return res;
  },
  (err) => {
    if (err.response.status === 401) {
      <Navigate to="promo-uploader/login" />
    }

    return Promise.reject(err);
  }
);
class App extends Component {
  constructor(props) {
    super(props);
    this.logOut = this.logOut.bind(this);

    this.state = {
      showModeratorBoard: false,
      showAdminBoard: false,
      currentUser: undefined,
    };

    history.listen((location) => {
      props.dispatch(clearMessage()); // clear message when changing location
    });
  }

  // componentDidMount() {
  //   const user = this.props.user;

  //   if (user) {
  //     this.setState({
  //       currentUser: user,
  //     });
  //   }

  //   EventBus.on("logout", () => {
  //     this.logOut();
  //   });
  // }

  componentWillUnmount() {
    EventBus.remove("logout");
  }

  logOut() {
    this.props.dispatch(logout());
    this.setState({
      showModeratorBoard: false,
      showAdminBoard: false,
      currentUser: undefined,
    });
  }



  render() {
    const { currentUser, showModeratorBoard, showAdminBoard } = this.state;

    return (
      <div>
        <Alert />
        <ResponsiveMenu />
        <div className="container mt-3">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} /> 
            <Route path="/order" element={<Order />} />
            <Route path="/multi-order" element={<ProtectedRoute><WholesaleOrder /></ProtectedRoute>} />
            <Route path="/logout" element={<LogOut />} />
          </Routes>
        </div>

        {/* <AuthVerify logOut={this.logOut}/> */}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { user } = state.auth;
  return {
    user,
  };
}

export default connect(mapStateToProps)(App);
