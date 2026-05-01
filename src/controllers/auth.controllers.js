import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/user.models.js';
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendEmail } from '../utils/mail.js';
import { emailVerificationMailgenContent } from '../utils/mail.js';
import { forgotPasswordMailgenContent } from '../utils/mail.js';

const genereatedAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generatedAccessToken();
        const refreshToken = user.generatedAccessToken();

        user.refreshToken = refreshToken 
        await user.save({validateBeforeSave : false})
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Internal server error while generating access and refresh token", []);
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const {username, email, fullName, password, role} = req.body

    const existedUser = await User.findOne({
        $or : [{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "User with already existed", []);
    }

    const user = await User.create({
        username,
        email,
        fullName,
        password,
        role,
        isMailVerified : false,
    })

    const {hashedToken, tokenExpiry, unHashedToken} = user.generatedTemporaryToken();
    
    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;
    
    await user.save({validateBeforeSave : false})

    await sendEmail({
        email : user?.email,
        subject : 'Verify your email',
        mailgenContent : emailVerificationMailgenContent(user.username, `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${unHashedToken}`),
    })

    const createdUser = await User.findById(user._id).select('-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry')

    if(!createdUser){
        throw new ApiError(500, 'Something went wrong, user not created', [])
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200,{user : createdUser}, 'User registered successfully')
        )
})

const login = asyncHandler( async (req, res) => {
    const {email, password} = req.body

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({email})

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = user.userCorrectPassword(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    const {accessToken, refreshToken} = await genereatedAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select('-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry')

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(200,{user : loggedInUser, accessToken, refreshToken}, 'User logged in successfully')
        )
})

const logoutUser = asyncHandler(async (req, res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {refreshToken : null},
        {new : true}
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie('accessToken', options)
        .cookie('refreshToken', options)
        .json(
            new ApiResponse(200, {}, "User logged out successfully")
        )
})

const getCurrentUser = asyncHandler(async (req, res) =>{
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, 'User fetched successfully')
        )
})

const verifyEmail = asyncHandler(async (req, res) =>{
    
    const {verificationToken} = req.params

    if (!verificationToken) {
        throw new ApiError(400, "Verification token is missing");
    }

    let hashedToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex')

        const user = await User.findOne({
            emailVerificationToken : hashedToken,
            emailVerificationTokenExpiry : {$gt : Date.now()}
        })

        if (!user) {
        throw new ApiError(400, "Token is invalid or expired");

        user.emailVerificationToken = undefined;
        user.emailVerificationTokenExpiry = undefined;

        user.isUserVerified = true;
        await user.save({validateBeforeSave : false})

        return res
        .status(200)
        .json(
            new ApiResponse(200, {isUserVerified : true}, 'User is verified')
        )
    }
})

const resendEmailVerification = asyncHandler(async (req, res) =>{
    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if(!user.isUserVerified){
        throw new ApiError(400, "User is already verified");
    }

    const {hashedToken, tokenExpiry, unHashedToken} = user.generatedTemporaryToken();
    
    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;
    
    await user.save({validateBeforeSave : false})

    await sendEmail({
        email : user?.email,
        subject : 'Verify your email',
        mailgenContent : emailVerificationMailgenContent(user.username, `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${unHashedToken}`),
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, 'Email verification resent successfully')
        )
})

const resendAccessToken = asyncHandler(async (req, res) =>{
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new Error(401, "Refresh token is missing");
    }

    try {
        const decodedToken =  jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodeToken?._id)

        if (!user) {
            throw new ApiError(404, 'Invalid refresh token')
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(404, 'Invalid refresh is expired')
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const {accessToken, refreshToken : newRefreshToken} = await genereatedAccessAndRefreshToken(user._id)

        user.refreshToken = newRefreshToken
        await user.save()

        return res
        .status(200)
        .cookie('acccessToken', accessToken, options)
        .cookie('refreshToken', newRefreshToken, options)
        .json(
            new ApiResponse(200, {}, 'Access token refreshed successfully')
        )

    } catch (error) {
        throw new ApiError(401, 'Invalid refresh token')
    }
})

const forgetPasswordRequest = asyncHandler( async (req, res) =>{
    const {email} = req.body

    const user = await User.findOne({email})

    if (!user) {
        throw ApiError(404, "User not found", [])
    }

    const {hashedToken, tokenExpiry, unHashedToken} = user.generatedTemporaryToken();

    user.forgetPasswordToken = hashedToken;
    user.forgotPasswordTokenExpiry = tokenExpiry;

    await user.save({validateBeforeSave : false})

    await sendEmail({
        email : user?.email,
        subject : 'Password reset request',
        mailgenContent : forgotPasswordMailgenContent(user.username, `${process.env.FORGOT_EMAIL_REDIRECT_URL}/${unHashedToken}`),
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password reset request sent successfully")
        )
})

const resetForgetPasswordRequest = asyncHandler( async (req, res) =>{
    const {resetPasswordToken} = req.params
    const {newPassword} = req.body

    let hashedToken = crypto
        .createHash('sha256')
        .update(resetPasswordToken)
        .digest('hex')
    
    const user = await User.findOne({
        forgotPasswordToken : hashedToken,
        forgotPasswordTokenExpiry : {$gt : Date.now()}
    })

    if (!user) {
        throw new ApiError(489, "Token is invalid or expired",)
    }

    user.forgotPasswordToken = undefined
    user.forgotPasswordTokenExpiry = undefined
    user.password = newPassword
    await user.save({validateBeforeSave : false})

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password reset successfully")
        )
})

const changeCurrentPassword = asyncHandler( async (req, res) => {
    const {oldPassword, newPassword} = req.body

    const user =  User.findById(req.user?._id)

    const isPasswordValid = user.userCorrectPassword(oldPassword)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    user.password = newPassword
    await user.save({validateBeforeSave : false})

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password changed successfully")
        )
})

export {
    registerUser, 
    login, 
    logoutUser, 
    getCurrentUser, 
    verifyEmail, 
    resendEmailVerification,
    forgetPasswordRequest,
    resetForgetPasswordRequest,
    changeCurrentPassword
}