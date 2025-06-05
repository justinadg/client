import { Container } from "@mui/material";
import { Face, ContentCut, InsertEmoticon, History } from "@mui/icons-material";
import {
  StatsContainer,
  StatItem,
  StatNumber,
  StatLabel,
  StatItemInner,
  StatIcon,
} from "./StatsSection.styles";

export default function StatsSection() {
  return (
    <Container maxWidth="lg">
      <StatsContainer>
        <StatItem>
          <StatIcon as={ContentCut} />
          <StatItemInner>
            <StatNumber>10</StatNumber>
            <StatLabel>Skilled Staffs</StatLabel>
          </StatItemInner>
        </StatItem>
        <StatItem>
          <StatIcon as={InsertEmoticon} />
          <StatItemInner>
            <StatNumber>120</StatNumber>
            <StatLabel>Happy Clients</StatLabel>
          </StatItemInner>
        </StatItem>
        <StatItem>
          <StatIcon as={Face} />
          <StatItemInner>
            <StatNumber>30</StatNumber>
            <StatLabel>Unique Services</StatLabel>
          </StatItemInner>
        </StatItem>
        <StatItem>
          <StatIcon as={History} />
          <StatItemInner>
            <StatNumber>15</StatNumber>
            <StatLabel>Years Experience</StatLabel>
          </StatItemInner>
        </StatItem>
      </StatsContainer>
    </Container>
  );
}
