import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskCategory, Department } from "@/api/entities";

export default function TaskList({ tasks, isLoading, onEdit, onDelete }) {
  const [categoriesMap, setCategoriesMap] = useState({});
  const [departments, setDepartments] = useState([]);
  const [departmentMap, setDepartmentMap] = useState({});
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  
  useEffect(() => {
    loadCategories();
    loadDepartments();
  }, []);
  
  const loadCategories = async () => {
    try {
      const categories = await TaskCategory.list();
      const categoriesObj = {};
      categories.forEach(cat => {
        categoriesObj[cat.id] = cat;
      });
      setCategoriesMap(categoriesObj);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadDepartments = async () => {
    setIsLoadingDepartments(true);
    try {
      const departmentList = await Department.list();
      console.log('Departamentos carregados:', departmentList);
      setDepartments(departmentList);
      
      // Criar mapa de ID para nome do departamento
      const deptMap = {};
      departmentList.forEach(dept => {
        deptMap[dept.id] = dept.name;
      });
      setDepartmentMap(deptMap);
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome da Tarefa</TableHead>
            <TableHead>Setor Responsável</TableHead>
            <TableHead>Prazo (Dias)</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Obrigatória</TableHead>
            <TableHead className="w-24">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">{task.name}</TableCell>
              <TableCell>
                {task.department_id 
                  ? departmentMap[task.department_id] || "Carregando..." 
                  : task.responsible_role || "-"}
              </TableCell>
              <TableCell>{task.days_before_event} dias antes</TableCell>
              <TableCell>
                {task.category_id ? (
                  <Badge 
                    style={{
                      backgroundColor: `${categoriesMap[task.category_id]?.color}20` || "#e5e7eb", 
                      color: categoriesMap[task.category_id]?.color || "#374151"
                    }}
                    className="border font-normal"
                  >
                    <div
                      className="w-2 h-2 rounded-full mr-1.5"
                      style={{ backgroundColor: categoriesMap[task.category_id]?.color || "#374151" }}
                    />
                    {categoriesMap[task.category_id]?.name || "Carregando..."}
                  </Badge>
                ) : (
                  <Badge variant="outline">Sem categoria</Badge>
                )}
              </TableCell>
              <TableCell>
                {task.is_required ? 
                  <Badge variant="default">Sim</Badge> : 
                  <Badge variant="outline">Não</Badge>
                }
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(task)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(task.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {tasks.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                Nenhuma tarefa cadastrada
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
