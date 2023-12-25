const nodemailer = require("nodemailer");

module.exports = ({ to, user, pass } = {}) => {
  if (!user || !pass) return console.log("Error: Authentication required!");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user,
      pass,
    },
  });

  const sendEmail = ({ from, subject, content } = {}) => {
    const mailOptions = {
      from,
      to,
      subject,
      html: content,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Error in sending email  " + error);
        return true;
      } else {
        console.log("Email sent: " + info.response);
        return false;
      }
    });
  };

  return sendEmail;
};
