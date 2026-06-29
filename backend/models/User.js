const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,  //trims extra space
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,  //as all emails id's are in lowercase
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],  //value cannot be beyond these two
      default: "user",
    },
    resumeUrl: {
  type: String,
  default: "",
},
jobRole: {
  type: String,
  default: "",
},
experienceLevel: {
  type: String,
  enum: ["fresher", "junior", "mid", "senior"],
  default: "fresher",
},
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt fields
  }
);

// Hash password before saving, but ONLY if it was changed
// server/models/User.js
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
// Instance method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

