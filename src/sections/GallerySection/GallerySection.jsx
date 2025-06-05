import { Grid, Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import {
  GalleryContainer,
  GalleryItem,
  GalleryImage,
} from "./GallerySection.styles";
import ScrollAnimation from "react-animate-on-scroll";

const images = [
];

export default function GallerySection() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <GalleryContainer>
      <Box sx={{ textAlign: "center", marginBottom: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Latest trends
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="textSecondary"
          gutterBottom
        >
          Traditional car services, providing a comfortable vehicle maintenance for clients.
        </Typography>
      </Box>
      <ScrollAnimation
        animateIn={isSmallScreen ? "fadeIn" : "fadeInLeftBig"}
        animateOnce
      >
        <Grid container spacing={2}>
          {images.map((image, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <GalleryItem>
                <GalleryImage src={image} alt={`Gallery image ${index + 1}`} />
              </GalleryItem>
            </Grid>
          ))}
        </Grid>
      </ScrollAnimation>
    </GalleryContainer>
  );
}
