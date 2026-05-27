import { Router } from "express";
import { getProject, getProjectById, createProject, updateProject, deleteProject, getProjectMember, addMemberProject, updateMemberRole, deleteMemberProject} from "../controllers/project.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { createProjectValidation, addMembertoProjectValidation } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateProjectPermission } from "../middlewares/project.middleware.js";
import { AvaibleUserRoles, UserRolesEnum } from "../utils/constans.js";
import { get } from "http";
import { User } from "../models/user.models.js";

const router = Router();
router.use(verifyJWT)

router.route('/').get(getProject).post(createProjectValidation(), validate, createProject)
router
    .route('/:projectId')
    .get(validateProjectPermission(AvaibleUserRoles), getProjectById)
    .put(
        validateProjectPermission([UserRolesEnum.ADMIN]),
        createProjectValidation(),
        validate,
        updateProject,
    )
    .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteProject)

router
    .route('/:projectId/members')
    .get(getProjectMember)
    .post(
        validateProjectPermission([UserRolesEnum.ADMIN]),
        addMembertoProjectValidation(),
        validate,
        addMemberProject
    )
router
    .route('/:projectId/members/:userId')
    .put(validateProjectPermission([UserRolesEnum.ADMIN]), updateMemberRole)
    .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteMemberProject)

export default router;