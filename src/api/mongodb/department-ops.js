import Department from './schemas/department';
import { cleanDataForApi } from '../utils';

export const DepartmentOps = {
  list: async () => {
    try {
      const departments = await Department.find({ is_active: true }).sort({ name: 1 });
      return cleanDataForApi(departments);
    } catch (error) {
      console.error('Erro ao listar departamentos:', error);
      throw error;
    }
  },

  get: async (id) => {
    try {
      const department = await Department.findById(id);
      if (!department) {
        throw new Error('Departamento não encontrado');
      }
      return cleanDataForApi(department);
    } catch (error) {
      console.error('Erro ao buscar departamento:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      // Verificar se já existe um departamento com o mesmo código
      const existingDepartment = await Department.findOne({ 
        $or: [
          { code: data.code.toLowerCase() },
          { name: data.name }
        ]
      });
      
      if (existingDepartment) {
        throw new Error('Já existe um departamento com este nome ou código');
      }

      const department = new Department({
        ...data,
        code: data.code.toLowerCase()
      });
      await department.save();
      return cleanDataForApi(department);
    } catch (error) {
      console.error('Erro ao criar departamento:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      // Verificar se já existe outro departamento com o mesmo código ou nome
      const existingDepartment = await Department.findOne({
        $or: [
          { code: data.code.toLowerCase() },
          { name: data.name }
        ],
        _id: { $ne: id }
      });
      
      if (existingDepartment) {
        throw new Error('Já existe outro departamento com este nome ou código');
      }

      const department = await Department.findByIdAndUpdate(
        id,
        { 
          $set: {
            ...data,
            code: data.code.toLowerCase()
          }
        },
        { new: true, runValidators: true }
      );
      
      if (!department) {
        throw new Error('Departamento não encontrado');
      }
      
      return cleanDataForApi(department);
    } catch (error) {
      console.error('Erro ao atualizar departamento:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      // Soft delete - apenas marca como inativo
      const department = await Department.findByIdAndUpdate(
        id,
        { $set: { is_active: false } },
        { new: true }
      );
      
      if (!department) {
        throw new Error('Departamento não encontrado');
      }
      
      return cleanDataForApi(department);
    } catch (error) {
      console.error('Erro ao excluir departamento:', error);
      throw error;
    }
  }
}; 