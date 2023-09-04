import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import generator from "generate-password";

import { ctrlWrapper } from "../decorators/index.js";
import envConfig from "../configs/envConfigs.js";
import User from "../models/User.js";
import { HttpError } from "../helpers/index.js";
const { JWT_SECRET } = envConfig;

const signup = async (req, res) => {
  const { email, password, name } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    password: hashPassword,
    email,
    name,
  });
  const payload = {
    id: newUser._id,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
  await User.findByIdAndUpdate(newUser._id, { token });

  res.status(201).json({
    user: {
      email: newUser.email,
      name: newUser.name,
      token,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }
  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });

  const newUser = await User.findByIdAndUpdate(
    user._id,
    { token },
    { new: true, select: "-password" }
  );

  delete newUser.password;

  res.json({
    user: newUser,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;

  await User.findByIdAndUpdate(_id, { token: "" });

  res.status(200).json({
    message: "Logout success",
  });
};

const resendPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "email not found");
  }
  const newPassword = generator.generate({
    length: 10,
    numbers: true,
    lowercase: true,
    uppercase: true,
  });
  const hashPassword = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(user._id, { password: hashPassword });

  const resetPassword = {
    from: UKR_NET_EMAIL,
    to: email,
    subject: "reset password",
    html: `<strong>Hello,</strong><br>
    <p>This is your new password:</p>
    <strong>${newPassword}</strong><br>
    <p>Please use it to log in to your account.</p>`,
  };
  await mailer(resetPassword);

  res.status(201).json({
    email,
  });
};

export default {
  signup: ctrlWrapper(signup),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  resendPassword: ctrlWrapper(resendPassword),
};
