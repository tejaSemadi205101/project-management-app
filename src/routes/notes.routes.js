import { Router } from "express";
import { createProjectNotes, updatePeojectNotes, deleteProjectNotes, getProjectNotes, getProjectNotesById } from "../controllers/project.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { createNotesValidation } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateNotesPermission } from "../middlewares/notes.middleware.js";
import { AvaibleUserRoles, UserRolesEnum } from "../utils/constans.js";
import { get } from "http";
import { User } from "../models/user.models.js";
import { ProjectNotes } from "../models/notes.models.js";
import { create } from "domain";

const router = Router();
router.use(verifyJWT)

router.route('/:projectId/')
  .get(getProjectNotes)
  .post(
    validateNotesPermission([AvaibleUserRoles.ADMIN]), 
    createNotesValidation(), 
    validate, 
    createProjectNotes)
router.route('GET /:projectId/n/:noteId')
  .get(
    validateNotesPermission([AvaibleUserRoles.ADMIN, AvaibleUserRoles.PROJECT_ADMIN]),getProjectNotesById)
  .put(
    validateNotesPermission([AvaibleUserRoles.ADMIN, AvaibleUserRoles.PROJECT_ADMIN]),
    createNotesValidation(),
    validate,
    updatePeojectNotes
  )
  .delete(
    validateNotesPermission([AvaibleUserRoles.ADMIN, AvaibleUserRoles.PROJECT_ADMIN]),
    deleteProjectNotes
  )