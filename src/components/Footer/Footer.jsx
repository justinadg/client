import { Container, Grid, Typography } from "@mui/material";
import { LocationOn, Phone, Email } from "@mui/icons-material";
import {
  FooterContainer,
  FooterLink,
  FooterTitle,
  FooterSection,
  FooterBottom,
  FooterIconContainer,
} from "./Footer.styles";

export default function Footer() {
  return (
    <FooterContainer>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <FooterTitle>OPENING HOURS</FooterTitle>
            <FooterSection>
              <Typography variant="body2">
                7:00 - 18:30
              </Typography>
            </FooterSection>
          </Grid>

          <Grid item xs={12} md={3}>
            <FooterTitle>SERVICES</FooterTitle>
            <FooterLink>Basic Maintenance</FooterLink>
            <FooterLink>Diagnostics</FooterLink>
            <FooterLink>Repairs</FooterLink>
          </Grid>

          <Grid item xs={12} md={3}>
            <FooterTitle>ADDITIONAL LINKS</FooterTitle>
            <FooterLink>About us</FooterLink>
            <FooterLink>Terms and conditions</FooterLink>
            <FooterLink>Contact us</FooterLink>
          </Grid>

          <Grid item xs={12} md={3}>
            <FooterTitle>LATEST NEWS</FooterTitle>
            <FooterLink>..</FooterLink>
            
          </Grid>
        </Grid>
      </Container>
      <FooterBottom>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <FooterIconContainer>
                <LocationOn />
                <Typography variant="body2">
                  Sumacab Este, Cabanatuan City
                </Typography>
              </FooterIconContainer>
            </Grid>
            <Grid item xs={12} md={4}>
              <FooterIconContainer>
                <Phone />
                <FooterLink to="tel:+359888888888">+63912 3456 789</FooterLink>
              </FooterIconContainer>
            </Grid>
            <Grid item xs={12} md={4}>
              <FooterIconContainer>
                <Email />
                <FooterLink to="mailto:contact@rasautocare.com">
                  contact@rasautocare.com
                </FooterLink>
              </FooterIconContainer>
            </Grid>
          </Grid>
        </Container>
      </FooterBottom>
    </FooterContainer>
  );
}
