import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Schedule from "./pages/Schedule";
import Speakers from "./pages/Speakers";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/speakers" element={<Speakers />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
