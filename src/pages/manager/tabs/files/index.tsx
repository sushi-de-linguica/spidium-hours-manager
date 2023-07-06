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
          Arquivos exportados
        </AccordionSummary>
        <AccordionDetails>
          <FilesTabFiles />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          Configurações de ações
        </AccordionSummary>
        <AccordionDetails>
          <FilesTabTags />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export { FilesTab };
