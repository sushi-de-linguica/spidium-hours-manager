import { Theme } from "@emotion/react";
import { Box, SxProps } from "@mui/material";
import { ReactNode } from "react";

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
  boxSx?: SxProps<Theme>;
}

const TabPanel = ({
  children,
  value,
  index,
  boxSx,
  ...other
}: TabPanelProps) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={boxSx}>{children}</Box>}
    </div>
  );
};

export { TabPanel };
