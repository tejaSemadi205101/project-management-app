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

export {registerUser, login}