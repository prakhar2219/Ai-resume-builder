// Shared CSS styles for authentication components
export const animatedGradientStyle = `
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    25% { background-position: 50% 100%; }
    50% { background-position: 100% 50%; }
    75% { background-position: 50% 0%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes shine {
    0% { left: -100%; }
    50% { left: 100%; }
    100% { left: 100%; }
  }

  @keyframes pulse {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
    50% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(16, 185, 129, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
  }

  @keyframes float {
    0% { transform: translateY(0px) rotate(0deg); }
    25% { transform: translateY(-15px) rotate(5deg); }
    50% { transform: translateY(-20px) rotate(0deg); }
    75% { transform: translateY(-8px) rotate(-5deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }

  @keyframes glow {
    0% { box-shadow: 0 0 15px rgba(16, 185, 129, 0.7), 0 0 25px rgba(249, 115, 22, 0.5); }
    50% { box-shadow: 0 0 35px rgba(16, 185, 129, 1), 0 0 50px rgba(249, 115, 22, 0.8); }
    100% { box-shadow: 0 0 15px rgba(16, 185, 129, 0.7), 0 0 25px rgba(249, 115, 22, 0.5); }
  }

  @keyframes color-shift {
    0% { border-color: rgba(249, 115, 22, 0.7); }
    33% { border-color: rgba(234, 88, 12, 0.7); }
    66% { border-color: rgba(251, 146, 60, 0.7); }
    100% { border-color: rgba(249, 115, 22, 0.7); }
  }

  @keyframes wave {
    0% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(10deg) scale(1.05); }
    50% { transform: rotate(0deg) scale(1.07); }
    75% { transform: rotate(-10deg) scale(1.05); }
    100% { transform: rotate(0deg) scale(1); }
  }

  @keyframes morph {
    0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    33% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
    66% { border-radius: 50% 60% 30% 60% / 40% 30% 60% 50%; }
    100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  }

  @keyframes cosmic {
    0% { background-position: 0% 0%; }
    50% { background-position: 100% 100%; }
    100% { background-position: 0% 0%; }
  }

  @keyframes sparkle {
    0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
    20% { opacity: 1; transform: scale(1.5) rotate(45deg); }
    50% { opacity: 0.8; transform: scale(1.2) rotate(180deg); }
    80% { opacity: 1; transform: scale(1.5) rotate(315deg); }
  }

  @keyframes rainbow-text {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes bubble-float {
    0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
    50% { transform: translateY(-40px) scale(1.2); opacity: 0.9; }
  }

  @keyframes magnetic-pull {
    0% { transform: translateX(0) translateY(0); }
    25% { transform: translateX(3px) translateY(-3px); }
    50% { transform: translateX(0) translateY(0); }
    75% { transform: translateX(-3px) translateY(3px); }
    100% { transform: translateX(0) translateY(0); }
  }

  @keyframes liquid-fill {
    0% { height: 0%; }
    100% { height: 100%; }
  }

  @keyframes neon-pulse {
    0%, 100% { text-shadow: 0 0 5px rgba(16, 185, 129, 0.7), 0 0 10px rgba(16, 185, 129, 0.7), 0 0 15px rgba(16, 185, 129, 0.7), 0 0 20px rgba(16, 185, 129, 0.7); }
    50% { text-shadow: 0 0 10px rgba(249, 115, 22, 0.9), 0 0 20px rgba(249, 115, 22, 0.9), 0 0 30px rgba(249, 115, 22, 0.9), 0 0 40px rgba(249, 115, 22, 0.9); }
    100% { text-shadow: 0 0 5px rgba(16, 185, 129, 0.7), 0 0 25px rgba(249, 115, 22, 0.5); }
  }

  .cosmic-bg {
    background-image: 
      radial-gradient(circle at 20% 30%, rgba(249, 115, 22, 0.4) 0%, transparent 50%),
      radial-gradient(circle at 70% 60%, rgba(251, 146, 60, 0.4) 0%, transparent 60%),
      radial-gradient(circle at 40% 80%, rgba(249, 115, 22, 0.4) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(234, 88, 12, 0.4) 0%, transparent 60%);
    background-size: 250% 250%;
    animation: cosmic 18s infinite alternate;
    position: absolute;
    inset: 0;
    z-index: 0;
    opacity: 0.8;
  }

  .sparkle {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: white;
    box-shadow: 0 0 15px 5px rgba(255, 255, 255, 0.9);
    animation: sparkle 4s infinite;
    z-index: 10;
    opacity: 0;
  }

  .sparkle-1 { top: 10%; left: 20%; animation-delay: 0s; }
  .sparkle-2 { top: 30%; left: 80%; animation-delay: 0.5s; }
  .sparkle-3 { top: 70%; left: 15%; animation-delay: 1s; }
  .sparkle-4 { top: 60%; left: 90%; animation-delay: 1.5s; }
  .sparkle-5 { top: 90%; left: 40%; animation-delay: 2s; }
  .sparkle-6 { top: 20%; left: 60%; animation-delay: 2.5s; }
  .sparkle-7 { top: 40%; left: 30%; animation-delay: 3s; }
  .sparkle-8 { top: 80%; left: 75%; animation-delay: 3.5s; }
  .sparkle-9 { top: 15%; left: 45%; animation-delay: 1.2s; }
  .sparkle-10 { top: 55%; left: 25%; animation-delay: 2.2s; }
  .sparkle-11 { top: 75%; left: 55%; animation-delay: 0.7s; }
  .sparkle-12 { top: 35%; left: 85%; animation-delay: 1.7s; }

  .morph-blob {
    animation: morph 8s ease-in-out infinite;
  }

  .bubble {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.2));
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
    animation: bubble-float 8s infinite;
    opacity: 0.7;
    z-index: 5;
  }

  .bubble-1 { width: 30px; height: 30px; left: 10%; top: 90%; animation-delay: 0s; }
  .bubble-2 { width: 20px; height: 20px; left: 20%; top: 85%; animation-delay: 1s; }
  .bubble-3 { width: 35px; height: 35px; left: 30%; top: 88%; animation-delay: 2s; }
  .bubble-4 { width: 25px; height: 25px; left: 40%; top: 92%; animation-delay: 3s; }
  .bubble-5 { width: 40px; height: 40px; left: 50%; top: 85%; animation-delay: 4s; }
  .bubble-6 { width: 18px; height: 18px; left: 60%; top: 90%; animation-delay: 2.5s; }
  .bubble-7 { width: 32px; height: 32px; left: 70%; top: 87%; animation-delay: 1.5s; }
  .bubble-8 { width: 22px; height: 22px; left: 80%; top: 92%; animation-delay: 3.5s; }

  .form-card {
    position: relative;
    z-index: 10;
    backdrop-filter: blur(5px);
  }

  .submitting input, .submitting button {
    animation: pulse 1s infinite;
  }

  .input-focus-effect:focus {
    animation: color-shift 3s infinite !important;
    transform: translateY(-5px);
    transition: all 0.3s ease;
  }

  @keyframes shimmer {
    0% { background-position: -150% 0; }
    50% { background-position: 250% 0; }
    100% { background-position: 250% 0; }
  }

  .shine-effect::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -100%;
    width: 50%;
    height: 200%;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent);
    transform: rotate(25deg);
    animation: shine 3s ease-in-out infinite;
  }

  .btn-shine {
    position: relative;
    overflow: hidden;
  }

  .btn-shine::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 80%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
    animation: shine 1.5s infinite;
  }

  .input-focus-effect:focus {
    border-color: #10B981;
    box-shadow: 0 0 0 5px rgba(16, 185, 129, 0.4), 0 0 0 10px rgba(249, 115, 22, 0.2);
    animation: pulse 2s infinite;
  }

  .floating-logo {
    animation: float 6s ease-in-out infinite;
  }

  .glowing-border {
    animation: glow 3s infinite;
  }

  .shimmer-effect {
    background: linear-gradient(90deg, rgba(16, 185, 129, 0), rgba(16, 185, 129, 0.6), rgba(249, 115, 22, 0.6), rgba(16, 185, 129, 0));
    background-size: 400% 100%;
    animation: shimmer 3s infinite;
  }

  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(40px, -60px) scale(1.2); }
    66% { transform: translate(-30px, 30px) scale(0.8); }
    100% { transform: translate(0px, 0px) scale(1); }
  }

  .animate-blob { animation: blob 12s infinite; }
  .animation-delay-2000 { animation-delay: 2s; }
  .animation-delay-4000 { animation-delay: 4s; }
  .animation-delay-6000 { animation-delay: 6s; }

  .bg-gradient-teal-orange {
    background: linear-gradient(135deg, #0D9488 0%, #F97316 50%, #0D9488 100%);
    background-size: 200% 200%;
    animation: gradient 8s ease infinite;
  }

  .text-gradient {
    background: linear-gradient(90deg, #0D9488, #F97316, #0D9488);
    background-size: 300% 100%;
    animation: gradient 8s ease infinite;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: transparent;
  }

  .rainbow-text {
    background: linear-gradient(to right, #0D9488, #14B8A6, #F97316, #FB923C, #0D9488);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: transparent;
    animation: rainbow-text 3s linear infinite;
  }

  .magnetic-button {
    transition: all 0.3s ease;
  }

  .magnetic-button:hover {
    animation: magnetic-pull 2s ease infinite;
  }

  .liquid-fill {
    position: relative;
    overflow: hidden;
  }

  .liquid-fill::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 0%;
    background: linear-gradient(to top, rgba(16, 185, 129, 0.3), rgba(249, 115, 22, 0.2));
    animation: liquid-fill 1s ease forwards;
    z-index: -1;
    transition: height 0.5s ease;
  }

  .liquid-fill:hover::before {
    height: 100%;
    animation: liquid-fill 0.5s ease forwards;
  }

  .neon-text {
    animation: neon-pulse 2s infinite alternate;
  }
`;