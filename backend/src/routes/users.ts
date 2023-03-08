import express from "express";
import * as UsersController from "../controllers/users";
import { requiresAuth } from "../middleware/auth";

const router = express.Router();

router.get("/", requiresAuth, UsersController.getAuthenticatedUser);

router.post("/signup", UsersController.signUp);

router.post("/login", UsersController.logIn);

router.post("/logout", UsersController.logOut);

router.patch("/:userId", UsersController.updateUser);

export default router;