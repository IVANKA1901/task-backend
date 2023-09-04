import express from "express";

import { validateBody } from "../decorators/index.js";
import usersSchemas from "../Schemas/users-schemas.js";
import authControllers from "../controllers/auth-controllers.js";

const authRouter = express.Router();

authRouter.post(
  "/signup",
  validateBody(usersSchemas.userSignupSchema),
  authControllers.signup
);

export default authRouter;
