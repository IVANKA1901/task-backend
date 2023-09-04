import express from "express";

import { validateBody } from "../decorators/index.js";
import usersSchemas from "../Schemas/users-schemas.js";
import authControllers from "../controllers/auth-controllers.js";
import authenticate from "../middlewares/authenticate.js";

const authRouter = express.Router();

authRouter.post(
  "/signup",
  validateBody(usersSchemas.userSignupSchema),
  authControllers.signup
);

authRouter.post(
  "/login",
  validateBody(usersSchemas.userLoginSchema),
  authControllers.login
);

authRouter.post("/logout", authenticate, authControllers.logout);

authRouter.post(
  "/forgot-password",
  validateBody(usersSchemas.userEmailSchema),
  authControllers.resendPassword
);

export default authRouter;
