import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppBar, Container, Box, Toolbar, Stack } from "@mui/material";
//*** components ***
import Breadcrumb from "./breadcrumb";
import AccountDropdown from "./account-dropdown";
//*** icons ***
import { ReactComponent as USPTOLOGO } from "assets/images/uspto-logo.svg";
//*** styles ***
import { createUseStyles } from "react-jss";
import { HeaderStyles } from "assets/styles/layout/mainLayout.styles";
const useStyles = createUseStyles(HeaderStyles);

function Header() {
  const classes = useStyles();
  const location = useLocation();
  const [pathName, setPathName] = useState("");

  useEffect(() => {
    setPathName(location.pathname);
  }, [location]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" className={classes.appbar}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Stack
              sx={{ width: "100%" }}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              {pathName === "/add-exception" || pathName === "/exceptions" ? (
                <div className="LogoWrapper">
                  <a href="/" className="uspto-logo-link">
                    <USPTOLOGO />
                  </a>
                  {/* <Link to="/reports" className="uspto-report-link">
                    Reports
                  </Link> */}
                </div>
              ) : (
                <div className="LogoWrapper">
                  <Link to="/" className="uspto-logo-link">
                    <USPTOLOGO />
                  </Link>
               
                </div>
              )}

              <Stack direction="row" alignItems="center">
                <Breadcrumb />
                <AccountDropdown />
              </Stack>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
}

export default Header;
