import React from 'react';
import { motion } from 'framer-motion';

interface RevealButtonProps {
  onReveal: () => void;
  disabled: boolean;
}

const RevealButton: React.FC<RevealButtonProps> = ({ onReveal, disabled }) => {
  return (
    <motion.button
      onClick={onReveal}
      disabled={disabled}
      className="reveal-button"
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      Reveal the Name!
    </motion.button>
  );
};

export default RevealButton;