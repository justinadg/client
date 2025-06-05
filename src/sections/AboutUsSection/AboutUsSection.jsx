/* eslint-disable react/no-unescaped-entities */
import {
  Container,
  Typography,
  AccordionSummary,
  AccordionDetails,
  Box,
  Grid,
} from "@mui/material";
import ScrollAnimation from "react-animate-on-scroll";
import {
  AboutUsContainer,
  AccordionItem,
  AccordionIcon,
  AccordionTitle,
  AccordionContent,
  StyledAccordion,
  AboutUsTitle,
  AboutImageContainer,
  AboutImageInnerContainer,
  AboutImage,
} from "./AboutUsSection.styles";

export default function AboutUsSection() {
  return (
    <AboutUsContainer>
      <Container maxWidth="lg">
        <ScrollAnimation animateIn="fadeIn" animateOnce>
          <Grid
            container
            alignItems="start"
            justifyContent="center"
            spacing={3}
          >
            <Grid item xs={12} md={7}>
              <AboutUsTitle variant="h3" component="h3">
                Who We Are
              </AboutUsTitle>
              <Box mt={3}>
                <Typography
                  variant="subtitle1"
                  color="secondary.light"
                  gutterBottom
                >
                  Welcome to RasReserve
                </Typography>
                <AboutImageContainer>
                  <AboutImageInnerContainer>
                    <AboutImage
                      component="img"
                      src=""
                    />
                  </AboutImageInnerContainer>
                </AboutImageContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <AccordionItem>
                <StyledAccordion defaultExpanded>
                  <AccordionSummary expandIcon={<AccordionIcon />}>
                    <AccordionTitle component="h4">
                      1. Our Mission
                    </AccordionTitle>
                  </AccordionSummary>
                  <AccordionDetails>
                    <AccordionContent variant="body1">
                      ...
                    </AccordionContent>
                  </AccordionDetails>
                </StyledAccordion>
              </AccordionItem>
              <AccordionItem>
                <StyledAccordion>
                  <AccordionSummary expandIcon={<AccordionIcon />}>
                    <AccordionTitle variant="h5">
                      2. Our Objectives
                    </AccordionTitle>
                  </AccordionSummary>
                  <AccordionDetails>
                    <AccordionContent variant="body1">
                      ...
                    </AccordionContent>
                  </AccordionDetails>
                </StyledAccordion>
              </AccordionItem>
              <AccordionItem>
                <StyledAccordion>
                  <AccordionSummary expandIcon={<AccordionIcon />}>
                    <AccordionTitle variant="h5">3. Our People</AccordionTitle>
                  </AccordionSummary>
                  <AccordionDetails>
                    <AccordionContent variant="body1">
                      ...
                    </AccordionContent>
                  </AccordionDetails>
                </StyledAccordion>
              </AccordionItem>
            </Grid>
          </Grid>
        </ScrollAnimation>
      </Container>
    </AboutUsContainer>
  );
}
