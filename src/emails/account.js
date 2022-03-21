const sgMail = require("@sendgrid/mail")

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from:  "Rafiq.kamal@gmail.com",
        subject: "Thanks for joining in!",
        text: `Welcome to the app, ${name}. Let me know if there is anything to improve.`
    })
}

const sendGoodbyeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "Rafiq.kamal@gmail.com",
        subject: "Sad to see you go...",
        text: `I heard your leaving, ${name}. I am sad to hear that, but could you let me know why you are going?`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail
}