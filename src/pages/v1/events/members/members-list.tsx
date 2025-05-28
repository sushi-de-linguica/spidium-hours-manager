import { Edit, Trash2, Twitch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IMember } from "@/domain";
import { twJoin } from "tailwind-merge";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface MembersListProps {
  members: IMember[];
  onEdit: (member: IMember) => void;
  onDelete: (member: IMember) => void;
}

export function MembersList({ members, onEdit, onDelete }: MembersListProps) {
  const [selectedMembers, setSelectedMembers] = useState<IMember[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleSelectMember = (member: IMember, checked: boolean) => {
    if (checked) {
      setSelectedMembers([...selectedMembers, member]);
    } else {
      setSelectedMembers(selectedMembers.filter((m) => m.id !== member.id));
    }
  };

  const handleDeleteSelected = () => {
    selectedMembers.forEach((member) => onDelete(member));
    setSelectedMembers([]);
    setIsDeleteDialogOpen(false);
  };

  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <p className="text-muted-foreground text-center py-6">
            Não foram encontrados membros.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <div className="p-4 flex justify-between items-center border-b">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedMembers.length === members.length}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedMembers([...members]);
                } else {
                  setSelectedMembers([]);
                }
              }}
            />
            <span className="text-sm text-muted-foreground">
              {selectedMembers.length} selecionados
            </span>
          </div>
          {selectedMembers.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Excluir selecionados
            </Button>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead className="w-[60px]"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Pronome</TableHead>
              <TableHead>Twitchs</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedMembers.some((m) => m.id === member.id)}
                    onCheckedChange={(checked) => handleSelectMember(member, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <Avatar>
                    <AvatarImage
                      src={member.images?.[0]?.file?.base64 || ""}
                      alt={member.name}
                    />
                    <AvatarFallback>
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.gender}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {member.primaryTwitch && (
                      <div className="flex items-center gap-1">
                        <Twitch className="h-4 w-4 text-purple-500" />
                        <span className={twJoin((member.streamAt === "secondary" || member.streamAt === member.primaryTwitch) && "font-bold")}>{member.primaryTwitch}</span>
                        {(member.streamAt === "primary" || member.streamAt === member.primaryTwitch) && (
                          <span className="ml-1 text-xs bg-green-100 text-green-800 px-1 rounded">
                            Stream
                          </span>
                        )}
                      </div>
                    )}
                    {member.secondaryTwitch && (
                      <div className="flex items-center gap-1">
                        <Twitch className="h-4 w-4 text-purple-500" />
                        <span className={twJoin((member.streamAt === "secondary" || member.streamAt === member.secondaryTwitch) && "font-bold")}>{member.secondaryTwitch}</span>
                        {(member.streamAt === "secondary" || member.streamAt === member.secondaryTwitch) && (
                          <span className="ml-1 text-xs bg-green-100 text-green-800 px-1 rounded">
                            Stream
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedMembers([member]);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Deletar</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        data={selectedMembers}
        handleConfirm={handleDeleteSelected}
        handleCancel={() => {
          setIsDeleteDialogOpen(false);
          setSelectedMembers([]);
        }}
        title="Confirmar exclusão"
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmColor="destructive"
      >
        <p>
          {selectedMembers.length === 1
            ? `Tem certeza que deseja excluir o membro ${selectedMembers[0].name}?`
            : `Tem certeza que deseja excluir ${selectedMembers.length} membros?`}
        </p>
      </ConfirmDialog>
    </>
  );
}
