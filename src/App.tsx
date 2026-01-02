import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PricingOverview } from './pages/PricingOverview';
import { Simulator } from './pages/Simulator';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page at root */}
        <Route path="/" element={<Layout><PricingOverview /></Layout>} />
        
        {/* Simulator at /simulator */}
        <Route path="/simulator" element={<Layout><Simulator /></Layout>} />
        
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
