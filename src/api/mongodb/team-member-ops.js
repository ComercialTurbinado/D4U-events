import { TeamMember } from './schemas/team-member';
import { cleanDataForApi } from './utils';

const TeamMemberOps = {
  async list() {
    try {
      const members = await TeamMember.find({ is_active: true })
        .populate('department_id')
        .sort({ name: 1 });
      return cleanDataForApi(members);
    } catch (error) {
      console.error('Erro ao listar membros:', error);
      throw error;
    }
  },

  async get(id) {
    try {
      const member = await TeamMember.findById(id)
        .populate('department_id');
      return cleanDataForApi(member);
    } catch (error) {
      console.error('Erro ao buscar membro:', error);
      throw error;
    }
  },

  async create(data) {
    try {
      const existingMember = await TeamMember.findOne({ 
        email: data.email,
        is_active: true 
      });

      if (existingMember) {
        throw new Error('Já existe um membro ativo com este email');
      }

      const member = new TeamMember(data);
      await member.save();
      
      const populatedMember = await member.populate('department_id');
      return cleanDataForApi(populatedMember);
    } catch (error) {
      console.error('Erro ao criar membro:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const existingMember = await TeamMember.findOne({
        email: data.email,
        _id: { $ne: id },
        is_active: true
      });

      if (existingMember) {
        throw new Error('Já existe outro membro ativo com este email');
      }

      const member = await TeamMember.findByIdAndUpdate(
        id,
        data,
        { new: true }
      ).populate('department_id');

      return cleanDataForApi(member);
    } catch (error) {
      console.error('Erro ao atualizar membro:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const member = await TeamMember.findByIdAndUpdate(
        id,
        { is_active: false },
        { new: true }
      ).populate('department_id');

      return cleanDataForApi(member);
    } catch (error) {
      console.error('Erro ao excluir membro:', error);
      throw error;
    }
  }
};

export default TeamMemberOps; 