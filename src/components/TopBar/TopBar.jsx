import { useTheme, useMediaQuery, Box, Grid, Container } from "@mui/material";
import Marquee from "react-fast-marquee";
import {
  LocationOnOutlined,
  PhoneOutlined,
  EmailOutlined,
  GitHub,
} from "@mui/icons-material";
import {
  TopBarContainer,
  IconText,
  IconStyled,
  LinkIcon,
  LinkIconContainer,
  HorizontalLine,
  StyledLink,
} from "./TopBar.styles.jsx";

export default function TopBar() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ width: "100%" }}>
      {isSmallScreen ? (
        <TopBarContainer>
          <Grid
            container
            justifyContent="space-between"
            alignItems="center"
            gap={3}
          >
            <Marquee gradient={false} speed={50} pauseOnClick pauseOnHover>
              <Grid item>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <IconText>
                    <IconStyled>
                      <LocationOnOutlined />
                    </IconStyled>
                    Sumacab Este, Cabanatuan City
                    <IconStyled>
                      <PhoneOutlined />
                    </IconStyled>
                    <StyledLink to="tel:+359888888888">
                      +63912 3456 789
                    </StyledLink>
                    <IconStyled>
                      <EmailOutlined />
                    </IconStyled>
                    <StyledLink to="mailto:contact@rasautocare.com">
                      contact@rasautocare.com
                    </StyledLink>
                  </IconText>
                </Box>
              </Grid>
              <Grid item>
               
              </Grid>
            </Marquee>
          </Grid>
        </TopBarContainer>
      ) : (
        <TopBarContainer>
          <Container maxWidth="xl">
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <IconText>
                  <IconStyled>
                    <LocationOnOutlined />
                  </IconStyled>
                  Sumacab Este, Cabanatuan City
                  <IconStyled>
                    <PhoneOutlined />
                  </IconStyled>
                  <StyledLink to="tel:+359888888888">
                    +63912 3456 789
                  </StyledLink>
                  <IconStyled>
                    <EmailOutlined />
                  </IconStyled>
                  <StyledLink to="mailto:contact@rasautocare.com">
                    contact@rasautocare.com
                  </StyledLink>
                </IconText>
              </Grid>
              <Grid item>
                
              </Grid>
            </Grid>
          </Container>
        </TopBarContainer>
      )}
      <HorizontalLine />
    </Box>
  );
}
