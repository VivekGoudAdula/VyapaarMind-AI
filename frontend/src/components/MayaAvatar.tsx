import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface MayaAvatarProps {
  mode: "hero" | "dock" | "active";
  isSpeaking?: boolean;
  message?: string;
  onClick?: () => void;
}

export default function MayaAvatar({ mode, isSpeaking = false, onClick }: MayaAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for 3D Tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for fluid motion
  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  // 3D Rotations
  const rotateX = useTransform(mouseY, [0.5, -0.5], ["20deg", "-20deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-20deg", "20deg"]);
  
  // Parallax transforms for layers
  const genieX = useTransform(mouseX, [-0.5, 0.5], ["-10px", "10px"]);
  const genieY = useTransform(mouseY, [-0.5, 0.5], ["-10px", "10px"]);
  
  const glowX = useTransform(mouseX, [-0.5, 0.5], ["20px", "-20px"]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], ["20px", "-20px"]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Normalize coordinates from -0.5 to 0.5
    x.set((event.clientX - centerX) / rect.width);
    y.set((event.clientY - centerY) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Size based on mode
  const sizeClasses = {
    hero: "w-[400px] h-[400px] md:w-[500px] md:h-[500px]",
    dock: "w-20 h-20",
    active: "w-[300px] h-[300px] md:w-[500px] md:h-[500px]"
  };

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative cursor-pointer transition-all duration-500 flex items-center justify-center ${sizeClasses[mode]}`}
      onClick={onClick}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d"
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: mode === 'dock' ? 1.1 : 1.05 }}
    >
      {/* Background Glow Layer (Parallax Back) */}
      <motion.div
        className="absolute inset-0 rounded-full bg-blue-500/10 blur-[80px]"
        style={{
          x: glowX,
          y: glowY,
          translateZ: -50
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-x-0 bottom-0 h-1/2 bg-purple-500/10 blur-[100px]"
        style={{
          x: glowX,
          y: glowY,
          translateZ: -30
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Main Avatar Container (Rotated) */}
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
      >
        {/* Floating Animation Wrapper */}
        <motion.div
          className="relative w-full h-full flex items-center justify-center"
          animate={{
            y: [0, -20, 0],
            rotateZ: [0, 1, -1, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            x: genieX,
            y: genieY,
            translateZ: 50
          }}
        >
          {/* Main 3D Image */}
          <motion.img
            src="/maya-genie.png"
            alt="MAYA AI"
            className="w-full h-full object-contain relative z-10 drop-shadow-[20px_20px_50px_rgba(0,0,0,0.5)]"
            animate={isSpeaking ? {
              scale: [1, 1.03, 0.97, 1.03, 1],
              filter: [
                "drop-shadow(0 0 30px rgba(59,130,246,0.5))",
                "drop-shadow(0 0 50px rgba(59,130,246,0.8))",
                "drop-shadow(0 0 30px rgba(59,130,246,0.5))"
              ]
            } : {
              filter: "drop-shadow(0 0 30px rgba(59,130,246,0.5))"
            }}
            transition={isSpeaking ? {
              duration: 0.4,
              repeat: Infinity,
              ease: "linear"
            } : { duration: 1 }}
          />

          {/* Glare / Specular Layer (Parallax Front) */}
          <motion.div 
            className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay"
            style={{
               background: "radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)",
               x: useTransform(mouseX, [-0.5, 0.5], ["-50px", "50px"]),
               y: useTransform(mouseY, [-0.5, 0.5], ["-50px", "50px"]),
               translateZ: 100
            }}
          />
        </motion.div>

        {/* Fake Lip Sync / Speaking Aura */}
        {isSpeaking && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl z-0"
            style={{ translateZ: 20 }}
            animate={{
              scale: [1, 2, 1],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 0.4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>

      {/* Dynamic Floor Shadow */}
      <motion.div 
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-2/3 h-10 bg-black/60 blur-3xl rounded-[100%] z-0"
        style={{
          translateZ: -100,
          scale: useTransform(mouseY, [-0.5, 0.5], [1.1, 0.9]),
          opacity: useTransform(mouseY, [-0.5, 0.5], [0.4, 0.8])
        }}
        animate={{
          scale: [1, 0.8, 1],
          opacity: [0.6, 0.3, 0.6],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
}
