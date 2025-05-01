import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IMember } from "@/domain";
import { MembersList } from "./members-list";
import { MemberDialog } from "./member-dialog";
import { useMembers } from "@/hooks/use-members";
import { useToast } from "@/hooks/use-toast";

export const MembersPage = () => {
  const [members, setMembers] = useState<IMember[]>([]);
  const { membersStore, addMember, updateMember, removeMember } = useMembers();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<IMember | null>(null);

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.primaryTwitch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.secondaryTwitch?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loadData = () => {
    setMembers([]);

    if (membersStore?.members?.length > 0) {
      setMembers(membersStore.members);
    }
  };

  useEffect(() => {
    loadData();
  }, [membersStore?.members]);

  const handleAddMember = () => {
    setCurrentMember(null);
    setIsDialogOpen(true);
  };

  const handleEditMember = (member: IMember) => {
    setCurrentMember(member);
    setIsDialogOpen(true);
  };

  const handleDeleteMember = (member: IMember) => {
    removeMember(member);
  };

  const handleSaveMember = (member: IMember) => {
    if (member.id) {
      updateMember(member);
      toast({
        title: "Membro atualizado",
        description: "O membro foi atualizado com sucesso.",
        variant: "default",
      });
    } else {
      addMember(member);
      toast({
        title: "Membro adicionado",
        description: "O membro foi adicionado com sucesso.",
        variant: "default",
      });
    }

    setIsDialogOpen(false);
  };
  return (
    <div className="container mx-auto gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold">Membros</h1>
        <div className="flex w-full sm:w-auto gap-4">
          <Input
            placeholder="Buscar por membros..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={handleAddMember}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar membro
          </Button>
        </div>
      </div>

      <MembersList
        members={filteredMembers}
        onEdit={handleEditMember}
        onDelete={handleDeleteMember}
      />

      <MemberDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        member={currentMember}
        onSave={handleSaveMember}
      />
    </div>
  );
};
