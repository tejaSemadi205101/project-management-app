import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: 'default',
        product : {
            name : "Project Manager",
            link : 'https://projectmanager.com',
        }
    })

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent)

    const emailHtml = mailGenerator.generate(options.mailgenContent) 

    const transporter = nodemailer.createTransport({
        host : process.env.MAILTRAP_SMTP_HOST,
        port : process.env.MAILTRAP_SMTP_PORT,
        auth : {
            user : process.env.MAILTRAP_SMTP_USER,
            pass : process.env.MAILTRAP_SMTP_PASS
        }
    })

    const email = {
        from : 'tejasemadi@email.com',
        to : options.email,
        subject : options.subject,
        text : emailTextual,
        html : emailHtml
    }

    try {
        await transporter.sendEmail(email)
    } catch (error) {
        console.error('Cannot send email, make sure your Mail Trap is connected', error)
    }
}

const emailVerificationMailgenContent = (username, verificationURL) => {
    return {
        body : {
        name: username,
        intro: 'Welcome to this app, lets start now',
        action: {
                instructions: 'To get start please click button below',
                button: {
                    color: '#22BC66',
                    text: 'Verify Email',
                    link : verificationURL
                }
            },
            outro: 'Need help, or have questions? Just reply to this email'
        }
    }
}

const forgotPasswordMailgenContent = (username, passwordResetURL) => {
    return {
        body : {
        name: username,
        intro: 'We got request to reset your password',
        action: {
                instructions: 'To reset your password please click button below',
                button: {
                    color: '#22BC66',
                    text: 'Reset Password Now',
                    link : passwordResetURL
                }
            },
            outro: 'Need help, or have questions? Just reply to this email'
        }
    }
}

export {emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail};