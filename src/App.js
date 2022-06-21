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
import Order from './_pages/retailOrder/index';
import ResponsiveMenu from './_common/ResponsiveMenu';
import Dashboard from './_pages/dashboard/index';
import LogOut from './_components/LogOut';
import Alert from './_common/Alert';
import WholesaleOrder from './_pages/wholesaleOrder/index';

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

  componentDidMount() {
    const user = this.props.user;

    if (user) {
      this.setState({
        currentUser: user,
      });
    }

    EventBus.on("logout", () => {
      this.logOut();
    });
  }

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
        <Alert/>
        <ResponsiveMenu />
        <div className="container mt-3">
          <Routes>
            {/* <Route exact path={["/", "/home"]} component={Home} /> */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
            {/* {/* <Route path="/" element={<Dashboard />} /> */}
            <Route path="/order" element={<Order />} />
            <Route path="/wholesale-order" element={<WholesaleOrder />} />
            <Route path="/logout" element={<LogOut />} />
            {/* <Route exact path="/register" component={Register} />
            <Route exact path="/profile" component={Profile} />
            <Route path="/user" component={BoardUser} />
            <Route path="/mod" component={BoardModerator} />
            <Route path="/admin" component={BoardAdmin} /> */}
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
