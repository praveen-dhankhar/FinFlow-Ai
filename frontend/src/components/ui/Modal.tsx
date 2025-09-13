'use client';

import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export interface ModalTriggerProps extends Dialog.DialogTriggerProps {
  children?: React.ReactNode;
}

export interface ModalContentProps extends Dialog.DialogContentProps {
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface ModalHeaderProps {
  children?: React.ReactNode;
}

export interface ModalBodyProps {
  children?: React.ReactNode;
}

export interface ModalFooterProps {
  children?: React.ReactNode;
}

const Modal = ({ open, onOpenChange, children }: ModalProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog.Root>
  );
};

const ModalTrigger = forwardRef<HTMLButtonElement, ModalTriggerProps>(
  ({ children, ...props }, ref) => (
    <Dialog.Trigger ref={ref} asChild {...props}>
      {children}
    </Dialog.Trigger>
  )
);

const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  ({ children, size = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-[95vw] max-h-[95vh]',
    };

    const backdropVariants = {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { duration: 0.3 }
      },
      exit: { 
        opacity: 0,
        transition: { duration: 0.2 }
      }
    };

    const contentVariants = {
      hidden: { 
        opacity: 0, 
        scale: 0.95,
        y: 20
      },
      visible: { 
        opacity: 1, 
        scale: 1,
        y: 0,
        transition: { 
          duration: 0.3,
          ease: 'easeOut'
        }
      },
      exit: { 
        opacity: 0, 
        scale: 0.95,
        y: 20,
        transition: { 
          duration: 0.2,
          ease: 'easeIn'
        }
      }
    };

    return (
      <Dialog.Portal>
        <AnimatePresence>
          <Dialog.Overlay asChild>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            />
          </Dialog.Overlay>
        </AnimatePresence>

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Content asChild>
            <motion.div
              ref={ref}
              className={cn(
                'relative w-full bg-white dark:bg-gray-900 rounded-lg shadow-xl',
                'border border-gray-200 dark:border-gray-800',
                sizeClasses[size],
                className
              )}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              {...props}
            >
              {children}
            </motion.div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    );
  }
);

const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6', className)}
      {...props}
    >
      {children}
    </div>
  )
);

const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-end space-x-2 p-6 border-t border-gray-200 dark:border-gray-800',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

const ModalTitle = forwardRef<HTMLHeadingElement, Dialog.DialogTitleProps>(
  ({ children, className, ...props }, ref) => (
    <Dialog.Title
      ref={ref}
      className={cn('text-lg font-semibold text-gray-900 dark:text-gray-100', className)}
      {...props}
    >
      {children}
    </Dialog.Title>
  )
);

const ModalDescription = forwardRef<HTMLParagraphElement, Dialog.DialogDescriptionProps>(
  ({ children, className, ...props }, ref) => (
    <Dialog.Description
      ref={ref}
      className={cn('text-sm text-gray-600 dark:text-gray-400', className)}
      {...props}
    >
      {children}
    </Dialog.Description>
  )
);

const ModalClose = forwardRef<HTMLButtonElement, Dialog.DialogCloseProps>(
  ({ children, className, ...props }, ref) => (
    <Dialog.Close asChild>
      <motion.button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md p-2',
          'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
          'dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-800',
          'transition-colors duration-200',
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        {...props}
      >
        {children || <X className="h-4 w-4" />}
      </motion.button>
    </Dialog.Close>
  )
);

Modal.displayName = 'Modal';
ModalTrigger.displayName = 'ModalTrigger';
ModalContent.displayName = 'ModalContent';
ModalHeader.displayName = 'ModalHeader';
ModalBody.displayName = 'ModalBody';
ModalFooter.displayName = 'ModalFooter';
ModalTitle.displayName = 'ModalTitle';
ModalDescription.displayName = 'ModalDescription';
ModalClose.displayName = 'ModalClose';

export {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ModalClose,
};
