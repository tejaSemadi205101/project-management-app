import {body} from 'express-validator'

const userRegisterValidation = () => {
    return [
        body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Email is invalid'),

        body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .isLowercase()
        .withMessage('Username must be Lowercase')
        .isLength({min : 4})
        .withMessage('Password mut be at least 8 characters'),
        
        body('fullName')
        .trim()
        .notEmpty()
        .withMessage('Full name is required')
        .isAlpha('en-US', {ignore : ' '}).withMessage('Full name must be alphabetic'),

        body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({min : 8})
        .withMessage('Password mut be at least 8 characters')
        .isAlphanumeric()
        .withMessage('Password must be alphanumeric')
    ] 
} 

const userLoginValidation = () => {
    return [
        body('email')
        .trim()
        .notEmpty()
        .isEmail()
        .withMessage('Email is required'),

        body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
    ]
}

const changeCurrentPasswordValidation = () => {
    return [
        body('oldPassword')
        .notEmpty()
        .withMessage('Old password is required'),

        body('newPassword')
        .notEmpty()
        .withMessage('New password is required')
    ]
}

const userForgetPasswordValidation = () => {
    return [
        body('email')
        .isEmail()
        .withMessage('Email is required')
        .notEmpty()
        .withMessage('Email is invalid')
    ]
}

const userResetPasswordValidation = () => {
    return [
        body('newPassword')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({min : 8})
        .withMessage('Password mut be at least 8 characters')
        .isAlphanumeric()
        .withMessage('Password must be alphanumeric')
    ]
}

export {
    userRegisterValidation, 
    userLoginValidation, 
    changeCurrentPasswordValidation,
    userForgetPasswordValidation,
    userResetPasswordValidation
}