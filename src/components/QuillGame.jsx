import React, { useEffect, useRef, useState } from 'react';
import CanvasManager from '../js/components/canvas-manager';
import { AISignature } from '../js/components/ai-signature';
import { UserSignature } from '../js/components/user-signature';
import { SignatureComparison } from '../js/utils/signature-comparison';
import '../styles/quill.css';

const QuillGame = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('displaying'); // displaying, memorizing, drawing, comparing
  const [score, setScore] = useState(null);
  const canvasManagerRef = useRef(null);
  const aiSignatureRef = useRef(null);
  const userSignatureRef = useRef(null);
  const fadeTimeoutRef = useRef(null);
  const [hintOpacity, setHintOpacity] = useState(0);
  
  useEffect(() => {
    // Initialize canvas
    canvasManagerRef.current = new CanvasManager();
    
    // Initialize signature systems
    aiSignatureRef.current = new AISignature(canvasManagerRef.current);
    userSignatureRef.current = new UserSignature(canvasManagerRef.current);
    
    // Start game sequence
    const startGame = async () => {
      // 1. Display AI signature
      await displayAISignature();
      
      // 2. Wait for memorization
      fadeTimeoutRef.current = setTimeout(() => {
        setGameState('memorizing');
      }, 3000);
      
      // 3. Fade out and show hint
      fadeTimeoutRef.current = setTimeout(() => {
        setGameState('drawing');
        // Start fade out animation
        if (canvasManagerRef.current) {
          canvasManagerRef.current.startFadeOut();
        }
        // Fade in hint
        setHintOpacity(1);
      }, 5000);
    };
    
    startGame();
    
    return () => {
      // Cleanup
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
      if (aiSignatureRef.current) {
        aiSignatureRef.current.stopDrawing();
        aiSignatureRef.current.clear();
      }
      if (userSignatureRef.current) {
        userSignatureRef.current.clear();
      }
      if (canvasManagerRef.current) {
        canvasManagerRef.current.cancelFreeze();
      }
    };
  }, []);

  const displayAISignature = async () => {
    if (!aiSignatureRef.current) return;
    
    // Generate and start drawing the signature
    aiSignatureRef.current.generateSignature();
    aiSignatureRef.current.startDrawing();
  };

  // Handle mouse events for user drawing
  const handleMouseDown = (e) => {
    if (gameState !== 'drawing') return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    userSignatureRef.current.startDrawing();
    userSignatureRef.current.addPoint(x, y);
  };

  const handleMouseMove = (e) => {
    if (gameState !== 'drawing') return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    userSignatureRef.current.addPoint(x, y);
  };

  const handleMouseUp = () => {
    if (gameState !== 'drawing') return;
    
    const userPoints = userSignatureRef.current.stopDrawing();
    const originalPoints = aiSignatureRef.current.signaturePoints;
    
    // Compare signatures
    const matchScore = SignatureComparison.compareSignatures(originalPoints, userPoints);
    setScore(matchScore);
    
    // Move to comparing state
    setGameState('comparing');
  };

  return (
    <div 
      className="quill-game"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div id="canvas-container" ref={canvasRef} />
      {gameState === 'drawing' && (
        <div 
          className="hint"
          style={{ opacity: hintOpacity }}
        >
          Recreate the signature
        </div>
      )}
      {score !== null && (
        <div className="score">
          {score}% match
        </div>
      )}
    </div>
  );
};

export default QuillGame; 