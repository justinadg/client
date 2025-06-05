import { useFetchStaffsQuery } from "../../services/api/staffsApi";
import { Container, Grid, Typography } from "@mui/material";
import {
  StaffsContainer,
  StaffCard,
  StaffImage,
  StaffInfo,
  ContactInfo,
  ContactIcon,
  ContactInfoInner,
  StyledLink,
  StyledButton,
} from "./StaffsSection.styles";
import { Call } from "@mui/icons-material";
import GradeIcon from "@mui/icons-material/Grade";
import ScrollAnimation from "react-animate-on-scroll";
import { useHandleSectionLink } from "../../utils/navigationUtils";
import ServerAlert from "../../components/ServerAlert/ServerAlert";

export default function StaffsSection() {
  const { data: staffs } = useFetchStaffsQuery();
  const handleCTAClick = useHandleSectionLink();

  return (
    <StaffsContainer>
      <ScrollAnimation animateIn="fadeIn" animateOnce>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h3" align="center" gutterBottom>
            Our Skilled Staff
          </Typography>
          <Typography variant="subtitle1" align="center" color="textSecondary">
            Combining traditional techniques with modern styles, providing quality services.
          </Typography>
          <Grid container spacing={4} sx={{ marginTop: 4 }}>
            {staffs?.results.length > 0 ? (
              staffs?.results.map((staff) => (
                <Grid item xs={12} md={6} key={staff.id}>
                  <StaffCard>
                    <StaffImage>
                      <img src={staff.image} alt={staff.firstName} />
                    </StaffImage>
                    <StaffInfo>
                      <Typography component="h4" variant="h6" gutterBottom>
                        {staff.firstName} {staff.lastName}
                      </Typography>
                      <Typography variant="subtitle2" color="textSecondary">
                        {staff.title}
                      </Typography>
                      <ContactInfo>
                        <ContactInfoInner>
                          <ContactIcon>
                            <Call />
                          </ContactIcon>
                          <Typography variant="body2" color="textSecondary">
                            <StyledLink to={`tel:${staff.contactNumber}`}>
                              {staff.contactNumber}
                            </StyledLink>
                          </Typography>
                        </ContactInfoInner>
                        <ContactInfoInner>
                          <ContactIcon>
                            <GradeIcon />
                          </ContactIcon>
                          <Typography variant="body2" color="textSecondary">
                            <StyledButton
                              onClick={() =>
                                handleCTAClick("reviews-section", "/staffs")
                              }
                            >
                              Rate & Review
                            </StyledButton>
                          </Typography>
                        </ContactInfoInner>
                      </ContactInfo>
                    </StaffInfo>
                  </StaffCard>
                </Grid>
              ))
            ) : (
              <Grid item>
                <ServerAlert keyword="staffs" />
              </Grid>
            )}
          </Grid>
        </Container>
      </ScrollAnimation>
    </StaffsContainer>
  );
}
