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

interface MembersListProps {
  members: IMember[];
  onEdit: (member: IMember) => void;
  onDelete: (member: IMember) => void;
}

export function MembersList({ members, onEdit, onDelete }: MembersListProps) {
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
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
                          if (
                            confirm(
                              `Tem certeza que deseja remover: ${member.name}?`
                            )
                          ) {
                            onDelete(member);
                          }
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
  );
}
