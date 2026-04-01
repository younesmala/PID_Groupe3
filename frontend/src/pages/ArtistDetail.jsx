import { useParams } from "react-router-dom";

function ArtistDetail() {
  const { id } = useParams();
  return <h1>Artist Detail - id: {id}</h1>;
}

export default ArtistDetail;
