import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import generator from "generate-password";
import axios from "axios";

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

export default {
  signup: ctrlWrapper(signup),
};
