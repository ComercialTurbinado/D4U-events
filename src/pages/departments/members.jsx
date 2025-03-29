import React, { useState, useEffect } from "react";
import { TeamMember } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/components/ui/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import TeamMemberForm from "@/components/team/TeamMemberForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TeamMembersPage() {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const data = await TeamMember.list();
      setMembers(data);
    } catch (error) {
      console.error("Error loading team members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMember = async (memberData) => {
    await TeamMember.create(memberData);
    setShowForm(false);
    loadMembers();
  };

  const handleUpdateMember = async (id, memberData) => {
    await TeamMember.update(id, memberData);
    setShowForm(false);
    setEditingMember(null);
    loadMembers();
  };

  const handleDeleteMember = async (id) => {
    await TeamMember.delete(id);
    loadMembers();
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const getDepartmentLabel = (department) => {
    const departments = {
      administrativo: "Administrativo",
      comercial: "Comercial",
      operacional: "Operacional",
      marketing: "Marketing",
      financeiro: "Financeiro",
      rh: "Recursos Humanos",
      ti: "Tecnologia da Informação",
      outro: "Outro"
    };
    return departments[department] || department;
  };

  return (
    <div className="container mx-auto py-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/departments">
              Departamentos
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Membros da Equipe</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {showForm ? (
        <TeamMemberForm
          initialData={editingMember}
          onSubmit={editingMember ? handleUpdateMember : handleCreateMember}
          onCancel={() => {
            setShowForm(false);
            setEditingMember(null);
          }}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mt-6 mb-6">
            <div>
              <h1 className="text-2xl font-bold">Membros da Equipe</h1>
              <p className="text-muted-foreground">
                Gerencie os membros da sua equipe
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingMember(null);
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Membro
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Nenhum membro cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>{member.department?.name || "Não definido"}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.whatsapp}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={member.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {member.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(member)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMember(member.id)}
                          >
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
} 