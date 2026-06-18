import {
  createRoomController,
  getMeController,
  getRoomMessagesController,
  getRoomsController,
  loginController,
  registerController,
  tokenGenerationController,
} from "@/controllers/registration";
import { Router } from "express";
import type { Request, Response } from "express";
import { verifyToken } from "@/middleware/tokenVerification";
import { validateLogin, validateRegister } from "@/middleware/validation";

const router = Router();

router.post("/register", validateRegister, registerController);
router.post("/login", validateLogin, loginController);
router.post("/token", tokenGenerationController);
router.get("/me", verifyToken, getMeController);
router.get("/:roomId/messages", verifyToken, getRoomMessagesController);
router.get("/rooms", verifyToken, getRoomsController);
router.post("/rooms", verifyToken, createRoomController);
router.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
  });
});

export default router;
