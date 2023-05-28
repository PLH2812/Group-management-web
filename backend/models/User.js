const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const searchable = require('mongoose-regex-search');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role:{ //USER or ADMIN
    type: String,
    required: true
  },
  status:{ //ACTIVE or DELETED
    type: String,
    required: true
  },
  email: {
    type: String,
    searchable: true,
    required: true,
    unique: true,
    lowercase: true,
    validate: value => {
      if (!validator.isEmail(value)) {
        throw new Error({ error: "Địa chỉ email không hợp lệ" });
      }
    }
  },
  phone: {
    type: String
  },
  gender: {
    type: String
  },
  dateOfBirth: {
    type: Date
  },
  password: {
    type: String,
    required: true,
    minLength: 7
  },
  verifiedAt: { 
    type: Date
  },
  otp:{
    type: Number,
    expiredAt: {type: Date, default: Date.now(), expires: 300}
  },
  tokens: [
    {
      token: {
        type: String,
        required: true
      }
    }
  ]
});

userSchema.plugin(searchable);

userSchema.pre("save", async function(next) {
  // Hash the password before saving
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  // Search for a user by email and password
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error({ error: "Thông tin đăng nhập không hợp lệ" });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new Error({ error: "Thông tin đăng nhập không hợp lệ" });
    }
    return user;
  } catch (error) {
    return undefined;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;