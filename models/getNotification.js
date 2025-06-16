import { Notification } from "electron";

export default function getNotification(_, { title, text }) {
  new Notification({
    title,
    body: text,
  }).show();
}
