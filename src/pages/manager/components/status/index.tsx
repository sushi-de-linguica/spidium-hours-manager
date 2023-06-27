import styled from "@emotion/styled";
import { Chip } from "@mui/material";

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  background: #fff;
  padding: 12px 24px;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 5;
  border-radius: 45px;
`;

type TStatusConnection = "error" | "success";

interface IStatusProps {
  obs?: TStatusConnection;
  nightbot?: TStatusConnection;
  twitch?: TStatusConnection;
}

const Status = ({ obs, nightbot, twitch }: IStatusProps) => {
  return (
    <StyledContainer>
      <Chip size="small" color={obs} label="OBS" />
      <Chip size="small" color={nightbot} label="NightBot" />
      <Chip size="small" color={twitch} label="Twitch" />
    </StyledContainer>
  );
};

export { Status };
