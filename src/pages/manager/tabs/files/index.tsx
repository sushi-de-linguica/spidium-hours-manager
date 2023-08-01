import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { FilesTabFiles } from "./files";
import { FilesTabTags } from "./tags";

const FilesTab = () => {
  return (
    <Box>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          1 - Arquivos para exportar
        </AccordionSummary>
        <AccordionDetails>
          <FilesTabFiles />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          2 - Botões de ação
        </AccordionSummary>
        <AccordionDetails>
          <FilesTabTags />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export { FilesTab };
