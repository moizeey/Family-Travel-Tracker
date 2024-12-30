import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import AddUser from "./components/AddUser";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/new-user" Component={AddUser} />
      </Routes>
    </Router>
  );
}
export default App;
