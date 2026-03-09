import React from "react";
import { motion } from "framer-motion";

const AnimatedInput = ({ 
  id, 
  name, 
  type, 
  value, 
  onChange, 
  placeholder, 
  label, 
  error, 
  icon, 
  autoComplete,
  ...props 
}) => {
  const handleChange = (e) => {
    onChange(e);

    // Add ripple effect to input
    const input = e.target;
    const ripple = document.createElement("div");
    ripple.className =
      "absolute w-full h-full bg-teal-500 rounded-md opacity-20";
    ripple.style.animation = "pulse 1s forwards";

    input.parentNode.appendChild(ripple);

    setTimeout(() => {
      input.parentNode.removeChild(ripple);
    }, 1000);
  };

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-300"
      >
        {label}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        <motion.input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          value={value}
          onChange={handleChange}
          whileFocus={{ scale: 1.01 }}
          className={`pl-10 appearance-none block w-full px-3 py-3 bg-white border ${
            error ? "border-red-500" : "border-orange-300"
          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-gray-700 sm:text-sm transition-all duration-300 input-focus-effect liquid-fill`}
          placeholder={placeholder}
          aria-label={label}
          {...props}
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-500"
            id={`${id}-error`}
          >
            {error}
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default AnimatedInput;