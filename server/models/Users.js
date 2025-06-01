const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["superadmin", "admin", "professor", "student"],
      required: true,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ---------- Student-specific ----------
    studentType: {
      type: String,
      enum: ["regular", "irregular"],
      required: function () {
        return this.role === "student";
      },
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: function () {
        return this.role === "student" && this.studentType === "regular";
      },
    },

    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: function () {
        return this.role === "student" && this.studentType === "regular";
      },
    },

    semester: {
      type: String,
      enum: ["1st", "2nd"],
      required: function () {
        return this.role === "student" && this.studentType === "regular";
      },
    },

    passedSubjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: function () {
          return this.role === "student" && this.studentType === "irregular";
        },
      },
    ],

    requestedSubjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: function () {
          return this.role === "student" && this.studentType === "irregular";
        },
      },
    ],

    // ---------- Professor-specific ----------
    preferredSections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
        required: function () {
          return this.role === "professor";
        },
      },
    ],
    profAvail: [
      {
        day: String,
        startTime: String,
        endTime: String,
      },
    ],
  },
  { timestamps: true }
);

// Password hashing
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (this.role === "superadmin") {
    this.isApproved = true;
  }

  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
