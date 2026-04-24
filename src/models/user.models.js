import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        username : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
            index : true
        },
        email : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true
        },
        fullName : {
            type : String,
            required : true,
            trim : true
        },
        password : {
            type : String,
            required : [true, "Password is required"],
            unique : true,
        },
        isUserVerified : {
            type : Boolean,
            default : false
        },
        refreshToken : {
            type : String,
        },
        forgotPasswordToken : {
            type : String,
        },
        forgotPasswordTokenExpiry : {
            type : Date,
        },
        emailVerificationToken : {
            type : String,
        },
        emailVerificationTokenExpiry : {
            type : Date,
        },
        avatar : {
            type : {
                url : String,
                localPath : String,
            },
            default : {
                url : 'https://placehold.co/200',
                localPath : String            
            }
        },
    }, {
        timestamps : true,
    }
);

//handle untuk update password pre hook
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    this.password =  await bcrypt.hash(this.password, 10);
    next();
});

//handle untuk mencocokan password
userSchema.methods.userCorrectPassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

//handle untuk mengecek kredensial saat user coba login
userSchema.methods.generatedAccessToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            username : this.username,
            email : this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

//handle untuk history kredensial saat user coba login 
userSchema.methods.generatedRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

// membuat fitur untuk handle pembuatan token sementara
// fungsinya seperti reset password dan verifikasi
userSchema.methods.generatedTemporaryTOken = function(){
    const unHashedToken = crypto.randomBytes(32).toString('hex')

    const hashedToken = crypto.createHash('sha256').update(unHashedToken).digest('hex');

    const tokenExpiry = Date.now() + 10 * 60 * 1000;

    return {hashedToken, tokenExpiry, unHashedToken}
}

export const User = mongoose.model('User', userSchema);