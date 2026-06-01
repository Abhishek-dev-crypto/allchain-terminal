'use client';

import { motion } from 'framer-motion';

export const FadeIn = ({ children }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
  >
    {children}
  </motion.div>
);

export const ScaleTap = ({ children }: any) => (
  <motion.div whileTap={{ scale: 0.97 }}>
    {children}
  </motion.div>
);