import { BrowserRouter, Routes, Route } from "react-router-dom";
import ArtistsList from "./pages/ArtistsList";
import ArtistDetail from "./pages/ArtistDetail";
import ArtistEdit from "./pages/ArtistEdit";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ArtistsList />} />
        <Route path="/artist/:id" element={<ArtistDetail />} />
        <Route path="/artist/:id/edit" element={<ArtistEdit />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;