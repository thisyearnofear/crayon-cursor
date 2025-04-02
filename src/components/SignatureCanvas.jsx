import { useEffect, useRef } from 'react';
import { CanvasManager } from '../js/components/canvas-manager';
import { DesktopSignatureControls } from '../js/components/signature-controls/desktop-controls';
import { MobileSignatureControls } from '../js/components/signature-controls/mobile-controls';

export function SignatureCanvas() {
  const containerRef = useRef(null);
  const canvasManagerRef = useRef(null);
  const controlsRef = useRef(null);
  const modeRef = useRef('signature');

  useEffect(() => {
    if (containerRef.current && !canvasManagerRef.current) {
      // Initialize canvas manager
      canvasManagerRef.current = new CanvasManager();
      
      // Initialize controls based on screen width
      const isMobile = window.innerWidth < 768;
      controlsRef.current = isMobile 
        ? new MobileSignatureControls(canvasManagerRef.current)
        : new DesktopSignatureControls(canvasManagerRef.current);
    }

    // Handle window resize
    const handleResize = () => {
      if (!controlsRef.current) return;
      
      const isMobile = window.innerWidth < 768;
      const isCurrentlyMobile = controlsRef.current instanceof MobileSignatureControls;

      if (isMobile !== isCurrentlyMobile) {
        // Remove current controls
        if (controlsRef.current.container) {
          controlsRef.current.container.remove();
        }
        if (controlsRef.current.bottomBar) {
          controlsRef.current.bottomBar.remove();
        }

        // Initialize new controls
        controlsRef.current = isMobile
          ? new MobileSignatureControls(canvasManagerRef.current)
          : new DesktopSignatureControls(canvasManagerRef.current);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (canvasManagerRef.current) {
        canvasManagerRef.current.destroy?.();
        canvasManagerRef.current = null;
      }
      if (controlsRef.current) {
        if (controlsRef.current.container) {
          controlsRef.current.container.remove();
        }
        if (controlsRef.current.bottomBar) {
          controlsRef.current.bottomBar.remove();
        }
        controlsRef.current = null;
      }
    };
  }, []);

  const handleModeToggle = () => {
    modeRef.current = modeRef.current === 'signature' ? 'quill' : 'signature';
    document.body.setAttribute('data-mode', modeRef.current);
    
    // Update header text
    const header = document.querySelector('.header h1');
    if (header) {
      header.textContent = modeRef.current === 'signature' ? 'Signature' : 'Quill';
    }

    // Handle canvas cleanup and initialization
    if (canvasManagerRef.current) {
      canvasManagerRef.current.cleanup();
      if (modeRef.current === 'quill') {
        canvasManagerRef.current.initQuillMode();
      } else {
        canvasManagerRef.current.initSignatureMode();
      }
    }
  };

  return (
    <div ref={containerRef} className="signature-canvas-container">
      <div id="grid">
        {[...Array(10)].map((_, i) => (
          <div key={i}></div>
        ))}
      </div>
      <main id="main">
        <header className="header">
          <h1 onClick={handleModeToggle} className="mode-toggle-text">
            Signature
          </h1>
        </header>
        <section id="hero">
          <div id="canvas-container"></div>
          <div id="hero-content">
            <h1 id="title">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 358 146">
                <path fillRule="evenodd" d="M7.643 128.876c0 5.422 1.812 14.458 7.247 15.543 5.434 1.084 90.94 9.397 99.636-46.989.178-1.159 3.222-1.084 3.623-.361 2.916 5.256 7.202 24.948-2.174 28.916-11.956 5.06-11.594 8.313-11.956 11.566-.363 3.253 1.811 7.229 6.159 7.229s47.101 2.169 52.898.723c5.797-1.446 5.797-9.036 3.26-13.936-2.536-4.899-12.318-2.53-14.13-7.59-1.811-5.06-1.811-34.86.725-40.643 2.536-5.783 6.159-6.145 9.058-4.699 2.898 1.446 3.985 2.272 6.884 1.968 2.898-.304 2.536-2.69 6.521-2.69 3.986 0 5.073 10.843 15.58 10.12 10.507-.723 13.768-4.7 13.768-10.12 0-5.423 3.623-10.483 9.057-11.206 5.435-.723 13.044 5.783 13.044 11.205s1.087 8.675-1.812 13.735c-2.898 5.06-48.806-8.041-54.709 23.856-4.348 23.494 15.942 29.277 29.347 29.277 13.406 0 23.551-6.867 32.608-8.313 9.058-1.446 9.783 6.506 20.652 6.506 6.543 0 10.328-3.929 12.859-9.579 1.29-2.881 5.923-2.885 6.683.179.811 3.267 1.493 6.051 1.994 8.105a5.01 5.01 0 0 0 4.869 3.825h8.843a10 10 0 0 0 9.602-7.206l3.376-11.601a5.001 5.001 0 0 1 4.801-3.603h1.83a5 5 0 0 1 4.687 3.257l4.699 12.638a10 10 0 0 0 9.373 6.515h6.296a4.98 4.98 0 0 0 4.912-4.047c2.772-14.581 12.184-63.721 13.725-66.797C353.29 71.045 358 64.9 358 60.201c0-4.699-.362-6.506-3.261-8.313-2.898-1.807-23.188-3.253-26.449-1.085-3.26 2.17-3.623 4.338-2.898 7.59.724 3.254 4.348 13.013 4.71 16.266.188 1.685-.694 11.61-1.587 20.79-.324 3.323-4.974 3.671-5.809.438l-6.271-24.266a8 8 0 0 0-7.746-5.998h-6.717a8 8 0 0 0-7.774 6.112l-6.039 24.876c-.78 3.216-5.32 2.973-5.707-.313-1.029-8.73-1.997-18.48-1.625-21.639.725-6.145 7.609-14.458 7.247-17.71-.363-3.254-.363-4.7-5.073-6.146-4.71-1.445-24.275 0-27.536 1.085-.54.18-1.031.538-1.473 1.011-2.302 2.46-6.595 3.877-9.189 1.728-22.44-18.59-51.839-4.876-57.815-.57-4.205 3.03-4.348-1.446-11.594-3.254-7.246-1.807-15.579 3.615-20.289 3.615-4.71 0-1.45-12.29-15.217-9.76-13.768 2.53-23.064 15.543-23.913 9.76C109.816 12.49 82.28-8.836 10.18 3.454c0 0-10.87 2.891-10.145 10.12.724 7.23 2.236 14.453 11.231 14.458 8.996.006 12.681 88.194 5.797 90.001-6.884 1.807-9.42 5.422-9.42 10.843Z" clipRule="evenodd" />
              </svg>
            </h1>
            <p>
              Signatures—scribbles once used to validate everything. Royal decrees to credit card receipts. 
              This stop-motion crayon effect (powered by p5 brush and WebGL) memorialises them. 
              Start drawing by simply pressing and holding the mouse button while moving across the canvas, 
              creating a dynamic animation of that thing we used to do before facial recognition and two-factor authentication. 
              Yesterday's tech, today's collectible.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
} 