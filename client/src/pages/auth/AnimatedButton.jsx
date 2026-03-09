import React, { useState } from "react";
import { motion } from "framer-motion";

const AnimatedButton = ({ loading, children, type = "submit", onClick, ...props }) => {
  const [hoverButton, setHoverButton] = useState(false);

  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{
        scale: 1.05,
        boxShadow:
          "0 0 60px rgba(249, 115, 22, 0.9), 0 0 30px rgba(16, 185, 129, 0.7)",
        y: -5,
      }}
      whileTap={{
        scale: 0.95,
        boxShadow:
          "0 0 30px rgba(249, 115, 22, 0.6), 0 0 15px rgba(16, 185, 129, 0.5)",
      }}
      onHoverStart={() => setHoverButton(true)}
      onHoverEnd={() => setHoverButton(false)}
      disabled={loading}
      className="w-full flex justify-center py-4 px-6 border-none rounded-xl shadow-2xl text-xl font-extrabold text-white bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 hover:from-orange-600 hover:via-orange-500 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 disabled:opacity-70 overflow-hidden shine-effect"
      style={{
        backgroundSize: "200% auto",
        animation: "gradient 3s ease infinite",
        background:
          "linear-gradient(45deg, #F97316, #FB923C, #F97316, #EA580C, #F97316)",
        letterSpacing: "0.1em",
        textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)",
        position: "relative",
      }}
      animate={{
        y: [0, -3, 0],
        boxShadow: [
          "0 10px 30px rgba(249, 115, 22, 0.7), 0 6px 20px rgba(16, 185, 129, 0.5)",
          "0 15px 40px rgba(249, 115, 22, 0.9), 0 8px 30px rgba(16, 185, 129, 0.7)",
          "0 10px 30px rgba(249, 115, 22, 0.7), 0 6px 20px rgba(16, 185, 129, 0.5)",
        ],
        scale: [1, 1.02, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
      }}
      {...props}
    >
      {loading ? (
        <motion.svg
          className="h-6 w-6 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: {
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            },
            scale: {
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse",
            },
          }}
        >
          <circle
            className="opacity-20"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </motion.svg>
      ) : (
        <motion.div
          className="relative flex items-center justify-center w-full"
          animate={{
            textShadow: [
              "0 0 10px rgba(255, 255, 255, 0.7)",
              "0 0 20px rgba(255, 255, 255, 0.9)",
              "0 0 10px rgba(255, 255, 255, 0.7)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          {/* Star burst effect when hovering */}
          {hoverButton && (
            <>
              {[...Array(12)].map((_, i) => {
                const randomX = Math.random() * 60 - 30;
                const randomY = Math.random() * 60 - 30;
                const size = Math.random() * 3 + 1;
                const duration = Math.random() * 0.8 + 0.6;
                const delay = Math.random() * 0.4;
                const color =
                  i % 3 === 0
                    ? "rgba(249, 115, 22, 0.9)"
                    : i % 3 === 1
                      ? "rgba(16, 185, 129, 0.9)"
                      : "rgba(255, 255, 255, 0.9)";

                return (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      backgroundColor: color,
                      boxShadow: `0 0 ${size * 3}px ${size}px ${color}`,
                    }}
                    initial={{
                      opacity: 0,
                      scale: 0,
                      x: 0,
                      y: 0,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                      x: [0, randomX],
                      y: [0, randomY],
                    }}
                    transition={{
                      duration: duration,
                      repeat: Infinity,
                      delay: delay,
                      ease: "easeOut",
                    }}
                  />
                );
              })}
            </>
          )}

          <span>{children}</span>
        </motion.div>
      )}
    </motion.button>
  );
};

export default AnimatedButton;