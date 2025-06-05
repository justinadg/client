import { Link } from "@mui/material";
import {
  HeroSectionContainer,
  ContentContainer,
  MainTitle,
  SubTitle,
  HeroButton,
} from "./HeroSection.styles";
import ScrollAnimation from "react-animate-on-scroll";

export default function HeroSection() {
  return (
    <HeroSectionContainer>
      <ContentContainer maxWidth="md">
        <ScrollAnimation animateIn="fadeIn" animateOnce>
          <MainTitle variant="h1" component="h1">
            Experience the traditional car servicing feels
          </MainTitle>
          <SubTitle variant="h3" component="h3">
            Professional care to maintain your perfect vehicle
          </SubTitle>
          <Link href="#video-section" underline="none">
            <HeroButton variant="outlined">Learn More</HeroButton>
          </Link>
          <Link href="#booking-section" underline="none">
            <HeroButton variant="contained">Book Now</HeroButton>
          </Link>
        </ScrollAnimation>
      </ContentContainer>
    </HeroSectionContainer>
  );
}
