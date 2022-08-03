import { connect } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children,user }) => {
    console.log(user)
  if (!user) {
    // user is not authenticated
    return <Navigate to="login" />;
  }
  return children;
};


function mapStateToProps(state) {
    const { user } = state.auth;
    return {
      user,
    };
  }
  
  export default connect(mapStateToProps)(ProtectedRoute);
  