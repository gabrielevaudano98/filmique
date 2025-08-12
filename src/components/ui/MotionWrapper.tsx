"use client";

import React from "react";
import { motion, MotionProps, useReducedMotion } from "framer-motion";

interface MotionWrapperProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
}

const MotionWrapper: React.FC<MotionWrapperProps> = ({ children, className, ...rest }) => {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export default MotionWrapper;