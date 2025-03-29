import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório']
  },
  role: {
    type: String,
    required: [true, 'Cargo é obrigatório']
  },
  department_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Departamento é obrigatório']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor, insira um email válido']
  },
  whatsapp: {
    type: String,
    required: [true, 'WhatsApp é obrigatório'],
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Populate department automaticamente
teamMemberSchema.pre('find', function() {
  this.populate('department_id');
});

teamMemberSchema.pre('findOne', function() {
  this.populate('department_id');
});

export default mongoose.model('TeamMember', teamMemberSchema); 