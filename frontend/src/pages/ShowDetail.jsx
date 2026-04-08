import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getShowById } from "../services/showService";
import { getRepresentationsByShow } from "../services/representationService";

function ShowDetail() {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [representations, setRepresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getShowById(id), getRepresentationsByShow(id)])
      .then(([showData, repsData]) => {
        setShow(showData);
        setRepresentations(repsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 20 }}>
      <h1>{show.title}</h1>
      <p className="text-muted">{show.slug}</p>

      <h2 style={{ marginTop: 32 }}>Représentations</h2>
      {representations.length === 0 ? (
        <p>Aucune représentation disponible.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {representations.map((rep) => (
            <li
              key={rep.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 16,
                marginBottom: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong>{new Date(rep.schedule).toLocaleString("fr-FR")}</strong>
                {rep.location && (
                  <span style={{ marginLeft: 12, color: "#666" }}>
                    {rep.location}
                  </span>
                )}
              </div>
              <Link to={`/cart/add/${rep.id}`}>
                <button className="btn btn-success">Ajouter au panier</button>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link to="/shows">← Retour aux spectacles</Link>
    </div>
  );
}

export default ShowDetail;
