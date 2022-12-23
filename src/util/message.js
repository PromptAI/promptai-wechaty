import { ScanStatus, log } from "wechaty";
import qrTerm from "qrcode-terminal";

export function onScan(qrcode, status) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    qrTerm.generate(qrcode, { small: true }); // show qrcode on console

    const qrcodeImageUrl = [
      "https://wechaty.js.org/qrcode/",
      encodeURIComponent(qrcode),
    ].join("");

    log.info(
      "StarterBot",
      "onScan: %s(%s) - %s",
      ScanStatus[status],
      status,
      qrcodeImageUrl
    );
  } else {
    log.info("StarterBot", "onScan: %s(%s)", ScanStatus[status], status);
  }
}

export function onLogin(user) {
  log.info("StarterBot", "%s login", user);
}

export function onLogout(user) {
  log.info("StarterBot", "%s logout", user);
}

export async function onMessage(msg) {
  log.info("StarterBot ******", JSON.stringify(msg));

  if (msg.text() === "ding") {
    await msg.say("dong");
  }
}
