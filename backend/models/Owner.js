const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ownerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      match: [/^\d{10}$/, 'Mobile number must be 10 digits'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
  },
  { timestamps: true }
);

ownerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

ownerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Owner', ownerSchema);
