import { User } from '../models/user.models.js';
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { AsyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailgenContent, SendEmail } from '../utils/mail.js';

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
    const {username, email, fullName, password} = req.body

    const existedUser = await User.findOne({
        $or : [{username}, {email}, {fullName}]
    })

    if(existedUser){
        throw new ApiError(409, "User with already existed", []);
    }

    const user = await User.created({
        username,
        email,
        fullName,
        password,
        isMailVerified : false,
    })

    const {hashedToken, tokenExpiry, unHashedToken} = user.generatedTemporaryToken();
    
    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;
    
    await user.save({validateBeforeSave : false})

    await SendEmail({
        email : user?.email,
        subject : 'Verify your email',
        mailgenContent : emailVerificationMailgenContent(user.username, `${req.protocol}://${req.get('host')}/api/v1/users/verify-email/${unHashedToken}`),
    })

    const cretedUser = await User.findById(user._id).select('-password', -'refreshToken', '-emailVerificationToken', '-emailVerificationTokenExpiry')

    if(!createdUser){
        throw new ApiError(500, 'Something went wrong, user not created', [])
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200,{user : cretedUser}, 'User registered successfully')
        )
})

export {registerUser}