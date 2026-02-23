const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student', 'staff', 'parent'],
      default: 'student'
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    preferences: {
      darkMode: { type: Boolean, default: false },
      highContrast: { type: Boolean, default: false },
      rememberUser: { type: Boolean, default: false },
      rememberedEmail: { type: String, default: '' },
      rememberedRole: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
