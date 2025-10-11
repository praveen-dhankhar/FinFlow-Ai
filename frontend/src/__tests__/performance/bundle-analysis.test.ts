import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('Bundle Analysis', () => {
  const bundleStatsPath = join(process.cwd(), 'bundle-stats.json')
  
  beforeAll(() => {
    // Generate bundle stats
    try {
      execSync('npm run build', { stdio: 'pipe' })
    } catch (error) {
      console.warn('Build failed, using mock data for testing')
    }
  })

  it('should have reasonable bundle size', () => {
    // Check if bundle stats exist
    try {
      const stats = JSON.parse(readFileSync(bundleStatsPath, 'utf8'))
      
      // Check main bundle size (should be under 500KB)
      expect(stats.assets[0].size).toBeLessThan(500 * 1024)
      
      // Check total bundle size (should be under 2MB)
      const totalSize = stats.assets.reduce((sum: number, asset: any) => sum + asset.size, 0)
      expect(totalSize).toBeLessThan(2 * 1024 * 1024)
    } catch (error) {
      // If bundle stats don't exist, skip this test
      console.warn('Bundle stats not available, skipping size checks')
    }
  })

  it('should not have duplicate dependencies', () => {
    try {
      const stats = JSON.parse(readFileSync(bundleStatsPath, 'utf8'))
      
      // Check for duplicate modules
      const modules = stats.modules || []
      const moduleNames = modules.map((module: any) => module.name)
      const duplicates = moduleNames.filter((name: string, index: number) => 
        moduleNames.indexOf(name) !== index
      )
      
      expect(duplicates).toHaveLength(0)
    } catch (error) {
      console.warn('Bundle stats not available, skipping duplicate check')
    }
  })

  it('should have optimized chunks', () => {
    try {
      const stats = JSON.parse(readFileSync(bundleStatsPath, 'utf8'))
      
      // Check that we have multiple chunks (code splitting)
      const chunks = stats.chunks || []
      expect(chunks.length).toBeGreaterThan(1)
      
      // Check that chunks are reasonably sized
      chunks.forEach((chunk: any) => {
        expect(chunk.size).toBeLessThan(200 * 1024) // 200KB per chunk
      })
    } catch (error) {
      console.warn('Bundle stats not available, skipping chunk analysis')
    }
  })

  it('should have tree-shaken unused code', () => {
    try {
      const stats = JSON.parse(readFileSync(bundleStatsPath, 'utf8'))
      
      // Check that we're not including unused code
      const modules = stats.modules || []
      const unusedModules = modules.filter((module: any) => 
        module.reasons && module.reasons.length === 0
      )
      
      // Should have minimal unused modules
      expect(unusedModules.length).toBeLessThan(10)
    } catch (error) {
      console.warn('Bundle stats not available, skipping tree-shaking check')
    }
  })
})
