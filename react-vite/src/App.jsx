import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import StockListPage from './pages/StockListPage';
import StockDetailPage from './pages/StockDetailPage';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/stocks" element={<StockListPage />} />
        <Route path="/stocks/:symbol" element={<StockDetailPage />} />
      </Routes>
    </Router>
  );
}


export default App;
