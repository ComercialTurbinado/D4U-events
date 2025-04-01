const { models } = require('./mongodb');
const bcrypt = require('bcryptjs');

const createTeamMember = async (memberData) => {
  try {
    // Hash da senha antes de salvar
    const hashedPassword = await bcrypt.hash(memberData.password, 10);
    const member = new models['team-members']({
      ...memberData,
      password: hashedPassword
    });
    return await member.save();
  } catch (error) {
    console.error('Erro ao criar membro da equipe:', error);
    throw error;
  }
};

const findTeamMemberByEmail = async (email) => {
  try {
    const member = await models['team-members'].findOne({ email });
    return member;
  } catch (error) {
    console.error('Erro ao buscar membro da equipe:', error);
    throw error;
  }
};

const updateTeamMember = async (id, memberData) => {
  try {
    // Se estiver atualizando a senha, fazer o hash
    if (memberData.password) {
      memberData.password = await bcrypt.hash(memberData.password, 10);
    }
    
    const member = await models['team-members'].findByIdAndUpdate(id, memberData, { new: true });
    return member;
  } catch (error) {
    console.error('Erro ao atualizar membro da equipe:', error);
    throw error;
  }
};

const deleteTeamMember = async (id) => {
  try {
    await models['team-members'].findByIdAndDelete(id);
  } catch (error) {
    console.error('Erro ao deletar membro da equipe:', error);
    throw error;
  }
};

module.exports = {
  createTeamMember,
  findTeamMemberByEmail,
  updateTeamMember,
  deleteTeamMember
}; 