import { BrowserRouter as Router } from 'react-router-dom';
import { Button } from '@/components/Button';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Finance Forecast App
            </h1>
            <p className="text-lg text-gray-600">
              Modern React frontend with Vite, TypeScript, and Tailwind CSS
            </p>
          </header>
          
          <main className="max-w-4xl mx-auto">
            <div className="card p-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Welcome to the Finance Forecast App
              </h2>
              <p className="text-gray-600 mb-6">
                This is a modern React frontend built with Vite, TypeScript, Tailwind CSS, 
                and comprehensive animation support using anime.js.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="success">Success Button</Button>
                <Button variant="warning">Warning Button</Button>
                <Button variant="error">Error Button</Button>
                <Button variant="outline">Outline Button</Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App
