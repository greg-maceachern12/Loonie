// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ExpenseSplitter from './components/ExpenseSplitter';
import Home from './components/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/g/:groupId" element={<ExpenseSplitter />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;