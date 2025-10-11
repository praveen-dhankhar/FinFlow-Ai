'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ModalClose,
  ToastProvider,
  useToast,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonChart,
  SkeletonList,
} from '@/components/ui';
import { ThemeProvider, ThemeToggle, useTheme } from '@/components/providers/ThemeProvider';
import { 
  Plus, 
  Download, 
  Settings, 
  Heart, 
  Star, 
  Mail, 
  Lock,
  User,
  Search,
  Bell
} from 'lucide-react';

const DesignSystemDemo = () => {
  const { addToast } = useToast();
  const { actualTheme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [showSkeletons, setShowSkeletons] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Design System
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              A comprehensive collection of reusable UI components with modern animations
            </p>
            <div className="flex justify-center items-center space-x-4">
              <ThemeToggle />
              <Button
                variant="outline"
                onClick={() => setShowSkeletons(!showSkeletons)}
              >
                {showSkeletons ? 'Hide' : 'Show'} Skeletons
              </Button>
            </div>
          </motion.div>

          {/* Buttons Section */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Buttons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card variant="glass">
                <CardHeader>
                  <h3 className="text-lg font-medium">Variants</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    <Button variant="primary" className="w-full">
                      Primary Button
                    </Button>
                    <Button variant="secondary" className="w-full">
                      Secondary Button
                    </Button>
                    <Button variant="outline" className="w-full">
                      Outline Button
                    </Button>
                    <Button variant="ghost" className="w-full">
                      Ghost Button
                    </Button>
                    <Button variant="destructive" className="w-full">
                      Destructive Button
                    </Button>
                  </div>
                </CardBody>
              </Card>

              <Card variant="glass">
                <CardHeader>
                  <h3 className="text-lg font-medium">Sizes & States</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                    <Button loading>Loading</Button>
                    <Button disabled>Disabled</Button>
                  </div>
                </CardBody>
              </Card>

              <Card variant="glass">
                <CardHeader>
                  <h3 className="text-lg font-medium">With Icons</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    <Button leftIcon={<Plus className="h-4 w-4" />}>
                      Add Item
                    </Button>
                    <Button rightIcon={<Download className="h-4 w-4" />}>
                      Download
                    </Button>
                    <Button size="icon" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </motion.section>

          {/* Cards Section */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Cards
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card variant="default">
                <CardHeader>
                  <h3 className="text-lg font-medium">Default Card</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Standard card with subtle shadow
                  </p>
                </CardHeader>
                <CardBody>
                  <p className="text-gray-700 dark:text-gray-300">
                    This is a default card with standard styling.
                  </p>
                </CardBody>
                <CardFooter>
                  <Button size="sm">Action</Button>
                </CardFooter>
              </Card>

              <Card variant="glass">
                <CardHeader>
                  <h3 className="text-lg font-medium">Glass Card</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Glassmorphism effect with backdrop blur
                  </p>
                </CardHeader>
                <CardBody>
                  <p className="text-gray-700 dark:text-gray-300">
                    Beautiful glass effect with transparency.
                  </p>
                </CardBody>
                <CardFooter>
                  <Button size="sm" variant="outline">Action</Button>
                </CardFooter>
              </Card>

              <Card variant="gradient">
                <CardHeader>
                  <h3 className="text-lg font-medium">Gradient Card</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Gradient background with enhanced blur
                  </p>
                </CardHeader>
                <CardBody>
                  <p className="text-gray-700 dark:text-gray-300">
                    Stunning gradient with premium feel.
                  </p>
                </CardBody>
                <CardFooter>
                  <Button size="sm" variant="primary">Action</Button>
                </CardFooter>
              </Card>
            </div>
          </motion.section>

          {/* Inputs Section */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Inputs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="glass">
                <CardHeader>
                  <h3 className="text-lg font-medium">Form Inputs</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <Input
                      label="Email"
                      type="email"
                      placeholder="Enter your email"
                      leftIcon={<Mail className="h-4 w-4" />}
                    />
                    <Input
                      label="Password"
                      type="password"
                      placeholder="Enter your password"
                      leftIcon={<Lock className="h-4 w-4" />}
                    />
                    <Input
                      label="Username"
                      placeholder="Enter your username"
                      leftIcon={<User className="h-4 w-4" />}
                      success
                    />
                    <Input
                      label="Search"
                      placeholder="Search..."
                      leftIcon={<Search className="h-4 w-4" />}
                      error="This field is required"
                    />
                  </div>
                </CardBody>
              </Card>

              <Card variant="glass">
                <CardHeader>
                  <h3 className="text-lg font-medium">Interactive Demo</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <Button
                      onClick={() => addToast({
                        title: 'Success!',
                        description: 'Your action was completed successfully.',
                        variant: 'success',
                      })}
                      className="w-full"
                    >
                      Show Success Toast
                    </Button>
                    <Button
                      onClick={() => addToast({
                        title: 'Error!',
                        description: 'Something went wrong. Please try again.',
                        variant: 'error',
                      })}
                      variant="destructive"
                      className="w-full"
                    >
                      Show Error Toast
                    </Button>
                    <Button
                      onClick={() => addToast({
                        title: 'Warning!',
                        description: 'Please check your input before proceeding.',
                        variant: 'warning',
                      })}
                      variant="outline"
                      className="w-full"
                    >
                      Show Warning Toast
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </motion.section>

          {/* Modal Section */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Modal
            </h2>
            <div className="flex justify-center">
              <Modal open={showModal} onOpenChange={setShowModal}>
                <ModalTrigger asChild>
                  <Button>Open Modal</Button>
                </ModalTrigger>
                <ModalContent size="md">
                  <ModalHeader>
                    <ModalTitle>Modal Example</ModalTitle>
                    <ModalDescription>
                      This is a beautiful modal with smooth animations and backdrop blur.
                    </ModalDescription>
                    <ModalClose />
                  </ModalHeader>
                  <ModalBody>
                    <div className="space-y-4">
                      <Input label="Name" placeholder="Enter your name" />
                      <Input label="Email" type="email" placeholder="Enter your email" />
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="terms" />
                        <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                          I agree to the terms and conditions
                        </label>
                      </div>
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <Button variant="outline" onClick={() => setShowModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setShowModal(false)}>
                      Save Changes
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </div>
          </motion.section>

          {/* Skeletons Section */}
          {showSkeletons && (
            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Skeleton Loaders
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card variant="glass">
                  <CardHeader>
                    <h3 className="text-lg font-medium">Text Skeletons</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3">
                      <SkeletonText />
                      <SkeletonText className="w-3/4" />
                      <SkeletonText className="w-1/2" />
                    </div>
                  </CardBody>
                </Card>

                <Card variant="glass">
                  <CardHeader>
                    <h3 className="text-lg font-medium">Card Skeleton</h3>
                  </CardHeader>
                  <CardBody>
                    <SkeletonCard />
                  </CardBody>
                </Card>

                <Card variant="glass">
                  <CardHeader>
                    <h3 className="text-lg font-medium">List Skeleton</h3>
                  </CardHeader>
                  <CardBody>
                    <SkeletonList items={3} />
                  </CardBody>
                </Card>
              </div>
            </motion.section>
          )}

          {/* Theme Info */}
          <motion.section variants={itemVariants}>
            <Card variant="gradient">
              <CardBody>
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">Current Theme</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You are currently using the <strong>{actualTheme}</strong> theme.
                  </p>
                </div>
              </CardBody>
            </Card>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
};

const DesignSystemPage = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <DesignSystemDemo />
      </ToastProvider>
    </ThemeProvider>
  );
};

export default DesignSystemPage;
