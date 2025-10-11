import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign in' }).click()
    
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()
  })

  test('should show validation error for invalid email', async ({ page }) => {
    await page.getByLabel('Email').fill('invalid-email')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Sign in' }).click()
    
    await expect(page.getByText('Invalid email format')).toBeVisible()
  })

  test('should login with valid credentials', async ({ page }) => {
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Sign in' }).click()
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test('should navigate to register page', async ({ page }) => {
    await page.getByRole('link', { name: 'Create an account' }).click()
    await expect(page).toHaveURL('/register')
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
  })

  test('should register new user', async ({ page }) => {
    await page.goto('/register')
    
    await page.getByLabel('First Name').fill('John')
    await page.getByLabel('Last Name').fill('Doe')
    await page.getByLabel('Email').fill('john@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByLabel('Confirm Password').fill('password123')
    await page.getByRole('button', { name: 'Create account' }).click()
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test('should show password mismatch error', async ({ page }) => {
    await page.goto('/register')
    
    await page.getByLabel('Password').fill('password123')
    await page.getByLabel('Confirm Password').fill('different123')
    await page.getByRole('button', { name: 'Create account' }).click()
    
    await expect(page.getByText('Passwords do not match')).toBeVisible()
  })

  test('should handle login error', async ({ page }) => {
    await page.getByLabel('Email').fill('wrong@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign in' }).click()
    
    await expect(page.getByText('Invalid credentials')).toBeVisible()
  })

  test('should remember login state', async ({ page }) => {
    // Login
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Sign in' }).click()
    
    await expect(page).toHaveURL('/dashboard')
    
    // Refresh page
    await page.reload()
    
    // Should still be logged in
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test('should logout user', async ({ page }) => {
    // Login first
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Sign in' }).click()
    
    await expect(page).toHaveURL('/dashboard')
    
    // Logout
    await page.getByRole('button', { name: 'User menu' }).click()
    await page.getByRole('menuitem', { name: 'Sign out' }).click()
    
    // Should redirect to login
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible()
  })
})
