const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthday: { type: Date, required: true },
  gender: { type: String, required: true, enum: ["female", "male", "custom"] },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

  places: [{ type: mongoose.Types.ObjectId, required: true, ref: "Place" }],
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Computed full name — keeps every existing `.name` usage across the app working unchanged
userSchema.virtual('name').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model("User", userSchema);