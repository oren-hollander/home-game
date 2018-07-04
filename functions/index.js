const functions = require('firebase-functions');
const mail = require('@sendgrid/mail');

const SENDGRID_API_KEY = ''

mail.setApiKey(SENDGRID_API_KEY);

exports.sendInvitation = functions.https.onCall(() => {
  const msg = {
    to: 'oren.hollander@gmail.com',
    from: 'invitation@homegame.app',
    subject: 'Testing 123',
    text: 'Testing Testing',
    html: '<strong>Testing again</strong>',
  };
  mail.send(msg);
  return msg;
});
