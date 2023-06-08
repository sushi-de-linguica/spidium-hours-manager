import { IEvent, IRun } from "@/domain";
import { useEventStore } from "@/stores";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { randomUUID } from "node:crypto";
import styled from "@emotion/styled";

import { toast } from "react-toastify";

const UL = styled.ul`
  display: flex;
  flex-direction: column;
  list-style-type: decimal;

  li {
    user-select: none;
    padding: 6px;
    border: 1px solid gray;
    margin: 2px;
    border-radius: 4px;
  }

  li:nth-of-type(odd) {
    background: #dde2e3;
  }

  li:hover {
    cursor: grabbing;
  }
`;

interface IRunsOrderDialogProps {
  eventId: string | null;
}

const RunsOrderDialog = ({ eventId }: IRunsOrderDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<IEvent | null>(null);
  const { updateFullRunStateToEvent, state } = useEventStore();

  useEffect(() => {
    if (!eventId) {
      setCurrentEvent(null);
      return;
    }

    const event = state.events.find(({ id }) => id === eventId);
    if (!event) {
      setCurrentEvent(null);
      return;
    }

    setCurrentEvent(event);
  }, [eventId]);

  const [tempRuns, setTempRuns] = useState<IRun[]>([]);

  useEffect(() => {
    setTempRuns(currentEvent?.runs ?? []);
  }, [currentEvent, currentEvent?.runs]);

  const draggedItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDrop = () => {
    const copyList = [...tempRuns].filter((run) => run && run.id);
    const dragItemContent = copyList[draggedItem.current!];
    copyList.splice(draggedItem.current!, 1);
    copyList.splice(dragOverItem.current!, 0, dragItemContent);
    draggedItem.current = null;
    dragOverItem.current = null;

    setTempRuns(copyList);
  };

  const handleDragStart = (e: any, position: number) => {
    draggedItem.current = position;
  };
  const handleDragEnter = (e: any, position: number) => {
    dragOverItem.current = position;
  };

  const getRunners = (run: IRun) => {
    if (!run.runners || run.runners?.length === 0) {
      return <Chip size="small" color="info" label="-- sem runner --" />;
    }

    const mappedRunners = run.runners.map((runner) => (
      <Chip key={randomUUID()} size="small" color="info" label={runner.name} />
    ));

    return mappedRunners;
  };

  const handleSave = () => {
    if (!eventId) {
      return;
    }

    updateFullRunStateToEvent({
      eventId,
      runs: [...tempRuns],
    });

    setIsOpen(false);
    toast.success("Ordenação atualizada com sucesso!");
  };

  return (
    <>
      <Button
        disabled={currentEvent?.runs.length === 0}
        onClick={() => setIsOpen(true)}
        variant="outlined"
        color="info"
      >
        Ordenar
      </Button>
      <Dialog fullScreen open={isOpen}>
        <DialogTitle>Ordenar RUNs</DialogTitle>
        <DialogContent>
          <UL>
            {tempRuns.map((run, index) => (
              <li
                draggable
                key={randomUUID()}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDrop}
              >
                {run.estimate} - {run.game} [{run.category}] - {getRunners(run)}
              </li>
            ))}
          </UL>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSave} color="success" variant="contained">
            salvar
          </Button>
          <Button onClick={() => setIsOpen(false)}>fechar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export { RunsOrderDialog };
