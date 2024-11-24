const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'amiircalllof1307@gmail.com',
    pass: 'zfvzdmoktszzhvpa'
  }
});

const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: 'amiircalllof1307@gmail.com',
    to,
    subject,
    text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Correo enviado: ' + info.response);
  });
};

module.exports = sendEmail;