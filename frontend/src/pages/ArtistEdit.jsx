import { useParams } from "react-router-dom";

function ArtistEdit() {
  const { id } = useParams();
  return <h1>Artist Edit - id: {id}</h1>;
}

export default ArtistEdit;
