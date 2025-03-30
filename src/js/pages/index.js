import "../../styles/index.scss";
import "../../styles/pages/index.scss";
import CanvasManager from "../components/canvas-manager";
import { DesktopSignatureControls } from "../components/signature-controls/desktop-controls.js";
import { MobileSignatureControls } from "../components/signature-controls/mobile-controls.js";

export default class Index {
  constructor() {
    this.canvasManager = null;
    this.currentControls = null;
    window.addEventListener("resize", this.handleResize.bind(this));
    this.initGrid();
    this.initCanvas();
    this.initControls();
  }

  initCanvas() {
    const canvasContainer = document.createElement("div");
    canvasContainer.id = "canvas-container";
    canvasContainer.style.cssText = `
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      justify-content: center;
      align-items: center;
    `;
    document.body.appendChild(canvasContainer);

    this.canvasManager = new CanvasManager();
  }

  initControls() {
    // Initialize controls based on screen width
    if (window.innerWidth >= 768) {
      this.currentControls = new DesktopSignatureControls(this.canvasManager);
    } else {
      this.currentControls = new MobileSignatureControls(this.canvasManager);
    }
  }

  handleResize() {
    // Update RVW
    document.documentElement.style.setProperty(
      "--rvw",
      `${document.documentElement.clientWidth / 100}px`
    );

    // Handle controls switch
    const isMobile = window.innerWidth < 768;
    const isCurrentlyMobile =
      this.currentControls instanceof MobileSignatureControls;

    if (isMobile !== isCurrentlyMobile) {
      // Remove current controls from DOM
      if (this.currentControls) {
        if (this.currentControls.container) {
          this.currentControls.container.remove();
        }
        if (this.currentControls.bottomBar) {
          this.currentControls.bottomBar.remove();
        }
      }

      // Initialize new controls
      this.currentControls = isMobile
        ? new MobileSignatureControls(this.canvasManager)
        : new DesktopSignatureControls(this.canvasManager);
    }
  }

  initGrid() {
    document.addEventListener("keydown", (e) => {
      if (e.shiftKey && e.key === "G") {
        document.getElementById("grid").classList.toggle("show");
      }
    });
  }
}

window.addEventListener("load", () => {
  new Index();
});
