import { DesktopSignatureControls } from "./desktop-controls.js";
import { MobileSignatureControls } from "./mobile-controls.js";

export class SignatureControls {
  constructor(canvasManager) {
    // Check if we're on mobile
    const isMobile = window.innerWidth <= 768;

    // Create the appropriate controls
    if (isMobile) {
      return new MobileSignatureControls(canvasManager);
    } else {
      return new DesktopSignatureControls(canvasManager);
    }
  }
}
