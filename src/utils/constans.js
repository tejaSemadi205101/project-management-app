export const UserRolesEnum = {
    ADMIN : 'admin',
    PROJECT_ADMIN : 'project_admin',
    USER : 'user'
} 

export const AvaibleUserRoles = Object.values(UserRolesEnum)

export const TaskStatusEnum = {
    TODO : 'todo',
    IN_PROGRESS : 'in_progress',
    DONE : 'done'
}

export const AvaibleTaskStatus = Object.values(TaskStatusEnum)