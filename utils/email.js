const { process_params } = require('express/lib/router');
const nodemailer = require('nodemailer');

const sendEmail = async options =>{
    const transporter = nodemailer.createTransport({
       host:process.env.EMAIL_HOST,
       port: process.env.EMAIL_PORT,
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    }
)   
    const mailOptions = {
        from: " PHAMDUNG <phamvandung07042003@gmail.com>",
        to: options.email,
        subject: options.subject,
        text: options.message,
    }
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;