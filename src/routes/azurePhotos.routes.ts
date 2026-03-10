import { Router } from "express";
import { getPhotos, uploadPhoto, deletePhoto, setPrimary, uploadProfilePhotoMiddleware } from "../controllers/azurePhotos.controller";
import { validateApiKey } from "../middlewares/apiKey.middleware";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

router.post("/get", validateApiKey, authenticateJWT, getPhotos);
router.post("/upload", validateApiKey, authenticateJWT, uploadProfilePhotoMiddleware, uploadPhoto);
router.post("/delete", validateApiKey, authenticateJWT, deletePhoto);
router.post("/set-primary", validateApiKey, authenticateJWT, setPrimary);

export default router;
