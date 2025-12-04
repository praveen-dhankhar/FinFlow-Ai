'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface StaggerContainerProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
    children: ReactNode;
    staggerDelay?: number;
}

export default function StaggerContainer({
    children,
    staggerDelay = 0.1,
    ...props
}: StaggerContainerProps) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
                visible: {
                    transition: {
                        staggerChildren: staggerDelay,
                    },
                },
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

interface StaggerItemProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
    children: ReactNode;
}

export function StaggerItem({ children, ...props }: StaggerItemProps) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                        duration: 0.5,
                        ease: [0.25, 0.4, 0.25, 1],
                    },
                },
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
}
