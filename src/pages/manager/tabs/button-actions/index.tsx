import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
} from '@mui/icons-material';
import { useFileStore } from '@/stores';
import { IFileTag } from '@/domain';
import { ActionForm } from '../../components/action-form';
import { toast } from 'react-toastify';

export const ButtonActionsTab = () => {
  const { removeTag, addTag, state: { tags } } = useFileStore();
  const [selectedAction, setSelectedAction] = useState<IFileTag | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenForm = (action?: IFileTag) => {
    setSelectedAction(action || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedAction(null);
    setIsFormOpen(false);
  };

  const handleDelete = (action: IFileTag) => {
    if (confirm(`Tem certeza que deseja remover o botão "${action.label}"?`)) {
      removeTag(action);
      toast.success('Botão removido com sucesso!');
    }
  };

  const handleDuplicate = (action: IFileTag) => {
    const newAction = {
      ...action,
      id: crypto.randomUUID(),
      label: `${action.label} [cópia]`,
    };
    addTag(newAction);
    toast.success('Botão duplicado com sucesso!');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Card>
          <CardHeader
            title="Botões de Ação"
            subheader="Gerencie os botões de ação disponíveis"
            action={
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenForm()}
              >
                Novo Botão
              </Button>
            }
          />
          <CardContent>
            <Grid container spacing={2}>
              {tags.map((action: IFileTag) => (
                <Grid item xs={12} sm={6} md={4} key={action.id}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="h6">{action.label}</Typography>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenForm(action)}
                          title="Editar"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDuplicate(action)}
                          title="Duplicar"
                        >
                          <DuplicateIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(action)}
                          title="Remover"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    {action.description && (
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                    )}
                    <List dense>
                      {action.actions.map((a: any, index: number) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            {a.isEnabled ? (
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: 'success.main',
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: 'error.main',
                                }}
                              />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={a.module.action}
                            secondary={a.module.component}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Stack>

      <Dialog
        open={isFormOpen}
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedAction ? 'Editar Botão' : 'Novo Botão'}
        </DialogTitle>
        <DialogContent>
          <ActionForm
            showEditMode={!!selectedAction}
            action={selectedAction}
            onClose={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}; 