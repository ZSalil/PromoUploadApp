import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { useNavigate } from 'react-router';
import { logout } from "../_actions/auth";


const pages = [{ name: "Single Order", url: "/order" },{ name: "Multi Order", url: "/multi-order" }];

const ResponsiveMenu = (props) => {

  const {user,dispatch} = props;
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [selectedPage, setSelectedPage] = React.useState(null);
  const navigate = useNavigate();
  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    // navigate('/logout')
    dispatch(logout())

    navigate('/login')
  }

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ mr: 2, display: { xs: "none", md: "flex" } }}
          >
            <Link to={"/"} onClick={()=>setSelectedPage('dashboard')}  className="navbar-brand text-white">
            {process.env.REACT_APP_BRAND_NAME}<sup>{process.env.REACT_APP_VERSION}</sup>
            </Link>
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >

              {user && pages.map((page, index) => (
                <MenuItem key={page}  onClick={handleCloseNavMenu}>
                  <Link to={page.url} onClick={()=>setSelectedPage(page.name)} key={index} className="nav-link">
                    {page.name} 
                  </Link>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}
          >
            <Link onClick={()=>setSelectedPage('dashboard')} to={"/"} className="navbar-brand text-white">
            {process.env.REACT_APP_BRAND_NAME}
            </Link>
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {user && pages.map((page,index) => (
              <Link onClick={()=>setSelectedPage(page.name)} key={index}  to={page.url}  className={"nav-link text-white "+(selectedPage === page?.name ? 'selected-nav' : '') }>
                {page.name}
              </Link>
            ))}
             <Link to={"/"} className="nav-link text-white">
                Dashboard
              </Link>
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {user ? (
              <React.Fragment>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      alt={user.name.toUpperCase()}
                      src="/static/images/avatar/2.jpg"
                    />
                  </IconButton>
                </Tooltip>
                <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
            
                <MenuItem  onClick={handleLogout}>
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              
            </Menu>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Link  to={"/login"} className="nav-link text-white">
                Login
                </Link>
              </React.Fragment>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

function mapStateToProps(state) {
  const { user } = state.auth;
  return {
    user,
  };
}

export default connect(mapStateToProps)(ResponsiveMenu);
