import { BrowserRouter, Routes, Route } from "react-router-dom";
import ArtistsList from "./pages/ArtistsList";
import ArtistDetail from "./pages/ArtistDetail";
import ArtistEdit from "./pages/ArtistEdit";
import ShowsList from "./pages/ShowsList";
import ShowDetail from "./pages/ShowDetail";
import Cart from "./pages/Cart";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ArtistsList />} />
        <Route path="/artist/:id" element={<ArtistDetail />} />
        <Route path="/artist/:id/edit" element={<ArtistEdit />} />
        <Route path="/shows" element={<ShowsList />} />
        <Route path="/show/:id" element={<ShowDetail />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;