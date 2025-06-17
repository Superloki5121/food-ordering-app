import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomerView from './pages/CustomerView';
import AdminView from './pages/AdminView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/menu" element={<CustomerView />} />
        <Route path="/admin" element={<AdminView />} />
      </Routes>
    </Router>
  );
}

export default App;
