const { Notification } = require("electron");

function getNotification(_, { title, text }) {
  new Notification({
    title,
    body: text,
  }).show();
}

module.exports = getNotification;