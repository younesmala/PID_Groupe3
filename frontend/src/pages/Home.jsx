import { useEffect, useState } from 'react'
import HeroSection from '../components/HeroSection'
import ShowSlider from '../components/ShowSlider'
import { getPublicShows } from '../services/publicShowService'
import './Home.css'

function Home() {
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false

    getPublicShows()
      .then((data) => {
        if (!ignore) setShows(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (!ignore) setError(err.message)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  return (
    <main className="home-page">
      <HeroSection />
      <ShowSlider shows={shows} loading={loading} error={error} />
    </main>
  )
}

export default Home
