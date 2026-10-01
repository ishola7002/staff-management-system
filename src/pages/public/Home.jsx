import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useColleges } from '../../hooks/useColleges.js'
import funatoLogo from '../../assets/funato-logo.png'

const coreValues = [
  { name: 'Fidelity', text: 'Faithful to the pursuit of knowledge and its application to the challenges facing society. We acknowledge our responsibilities to fellow students, faculty, staff, and our broader intellectual community.' },
  { name: 'Uprightness', text: 'Integrity in our dealings with fellow students, faculty, and staff. Honesty and incorruptibility are our watchwords — we are just and fair as members of this institution.' },
  { name: 'Novelty', text: 'Innovation and ingenuity, breaking new ground in the search for knowledge for the betterment of our communities and the world.' },
  { name: 'Aspiration', text: 'We embrace excellence and do not settle for mediocrity — bold and courageous in our pursuit of higher education, even in challenging times.' },
  { name: 'Tolerance', text: 'Open-minded in our dealings with others, free from prejudice and bigotry, sharing goodwill and fellowship as a diverse community of learners.' },
  { name: 'Objectivity', text: 'Fairness, impartiality, and even-handedness as our moral compass, working to create a harmonious educational environment.' },
]

const tabs = [
  { key: 'about', label: 'About' },
  { key: 'vision', label: 'Vision' },
  { key: 'mission', label: 'Mission' },
]

function Home() {
  const { colleges } = useColleges()
  const [activeTab, setActiveTab] = useState('about')
  const [flippedValue, setFlippedValue] = useState(null)

  return (
    <div>
      {/* Hero */}
      <section className="text-center py-6 mb-16">
        <img src={funatoLogo} alt="FUNATO crest" className="w-20 h-20 mx-auto mb-5 object-contain" />
        <h1 className="font-serif-display text-funato-brown text-4xl sm:text-5xl font-semibold mb-3">
          FUNATO Staff Directory
        </h1>
        <p className="text-funato-brown-dark text-lg max-w-xl mx-auto">
          Federal University of Agriculture and Technology, Okeho
        </p>
      </section>

      {/* About / Vision / Mission — tabbed */}
      <section className="max-w-3xl mx-auto mb-16">
        <div className="flex gap-2 border-b border-funato-brown-light mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 font-serif-display font-semibold text-lg -mb-px border-b-2 transition ${
                activeTab === tab.key
                  ? 'border-funato-brown text-funato-brown'
                  : 'border-transparent text-funato-brown-light hover:text-funato-brown-dark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'about' && (
          <div className="space-y-4 text-funato-brown-dark leading-relaxed">
            <p>
              The Federal University of Agriculture and Technology, Okeho (FUNATO) was established by the Federal
              Government of Nigeria in 2025 as part of its commitment to expanding access to quality higher education
              and strengthening the nation's capacity in agriculture, science, and technology.
            </p>
            <p>
              Located in Oke-Ogun, Oyo State, FUNATO was conceived to serve as a center of excellence where
              agriculture meets technology, promoting innovation, research, and sustainable development in Nigeria's
              agri-tech sector.
            </p>
            <p>
              Following its official approval, the University's Governing Council and principal officers were
              inaugurated, with Professor Olaniyi Jacob Babayemi appointed as the pioneer Vice-Chancellor. FUNATO
              commenced full academic activities in March 2026, welcoming its first cohort of students into
              programs blending agricultural sciences, engineering, and modern technology.
            </p>
          </div>
        )}

        {activeTab === 'vision' && (
          <p className="text-funato-brown-dark leading-relaxed text-lg">
            To be a world-class institution driving sustainable agricultural innovation, technological advancement,
            and societal development.
          </p>
        )}

        {activeTab === 'mission' && (
          <ul className="space-y-3 text-funato-brown-dark leading-relaxed">
            <li className="pl-4 border-l-2 border-funato-gold">Expand the frontiers of knowledge through quality teaching, research, and hands-on learning.</li>
            <li className="pl-4 border-l-2 border-funato-gold">Produce graduates who are solution-driven, professionally competent, and community-focused.</li>
            <li className="pl-4 border-l-2 border-funato-gold">Promote food sustainability and security locally, nationally, and globally.</li>
            <li className="pl-4 border-l-2 border-funato-gold">Apply technology compassionately to challenges in health, poverty, and development.</li>
            <li className="pl-4 border-l-2 border-funato-gold">Contribute to national transformation through creativity, innovation, and integrity.</li>
          </ul>
        )}
      </section>

      {/* Our Colleges */}
      <section className="max-w-4xl mx-auto border-t border-funato-brown-light pt-12">
        <h2 className="font-serif-display text-funato-brown text-2xl font-semibold mb-6">Our Colleges</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {colleges.map((college) => (
            <Link
              key={college.id}
              to={`/colleges/${college.id}`}
              className="block bg-white border border-funato-brown-light rounded-lg p-5 hover:shadow-md hover:border-funato-brown transition"
            >
              <h3 className="text-funato-brown font-semibold">{college.name}</h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home