import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

// In development Vite runs on port 5173. In production or on Vercel/Render,
// the API is served from the same origin or via VITE_API_URL.
const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://127.0.0.1:5000' : window.location.origin)
).replace(/\/$/, '');

const icon = (name, className = '') => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const TRACKS = [
  { name: 'AI & Machine Learning', icon: 'psychology', color: '#4cd7f6', desc: 'Neural networks, LLM agents, and generative computer vision prototypes.' },
  { name: 'Web3 & Cloud Systems', icon: 'cloud', color: '#d0bcff', desc: 'Distributed infrastructure, serverless runtimes, and resilient APIs.' },
  { name: 'Robotics & Hardware Hacks', icon: 'precision_manufacturing', color: '#7bd0ff', desc: 'Microcontrollers, autonomous drones, and embedded cyber-physical systems.' },
  { name: 'Design & Creative Tech', icon: 'palette', color: '#ec4899', desc: 'User experience design, generative art, and creative human-machine interfaces.' },
];

const GALLERY = [
  {
    title: 'TechNovation Keynote',
    tag: 'Main Stage',
    tagColor: '#4cd7f6',
    desc: 'Global industry visionaries unveiling the horizon of engineering.',
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Midnight Sprint Hackathon',
    tag: 'Hack Arena',
    tagColor: '#d0bcff',
    desc: '36 hours of non-stop code, caffeine, and collaborative breakthroughs.',
    img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'RoboWars Championship',
    tag: 'Hardware Arena',
    tagColor: '#7bd0ff',
    desc: 'High-torque autonomous bot battles and precision drone obstacle courses.',
    img: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Amphitheatre Cultural Night',
    tag: 'Cultural Bash',
    tagColor: '#ec4899',
    desc: 'Celebrity performances, indie music fusion, and open-air celebration.',
    img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
  },
];

const FAQS = [
  {
    q: 'Who is eligible to participate in Sushant 2026?',
    a: 'Participation is open to all university students, developers, and tech enthusiasts. You can browse all events without logging in and register with a single click.',
  },
  {
    q: 'How does event registration work?',
    a: 'Select your participant profile from the "Viewing as" dropdown in My Schedule, then click "Register now" on any upcoming event card. Confirmations are immediate.',
  },
  {
    q: 'Can I register for multiple events?',
    a: 'Yes! As long as the events do not overlap and capacity has not been reached, you can register for as many workshops and sessions as you like.',
  },
  {
    q: 'How do organizers check attendee lists?',
    a: 'Each event card has a community icon (groups) that opens the live verified attendee list directly synced with our database.',
  },
];

function App() {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [busyEvent, setBusyEvent] = useState('');
  const [notice, setNotice] = useState(null);
  const [attendeeEvent, setAttendeeEvent] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const api = async (path, options) => {
    const response = await fetch(`${API_URL}${path}`, options);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || 'Something went wrong.');
    return body.data ?? body;
  };

  const loadCore = async () => {
    setLoading(true);
    try {
      const [eventData, userData] = await Promise.all([api('/api/events'), api('/api/users')]);
      setEvents(eventData || []);
      setUsers(userData || []);
      const student = userData.find((user) => user.role === 'student') || userData[0];
      if (student) setSelectedUser((current) => current || student.id);
    } catch (error) {
      setNotice({
        type: 'error',
        message: `Could not reach the API at ${API_URL}. Ensure your backend is running or configured in environment variables.`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCore();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    api(`/api/me/registrations?user_id=${selectedUser}`)
      .then(setRegistrations)
      .catch((error) => setNotice({ type: 'error', message: error.message }));
  }, [selectedUser]);

  const registeredIds = useMemo(
    () => new Set(registrations.map((registration) => registration.event_id)),
    [registrations]
  );

  const filteredEvents = events.filter((event) => {
    const matchesStatus = status === 'all' || event.status === status;
    return matchesStatus && event.title.toLowerCase().includes(query.toLowerCase());
  });

  const selectedPerson = users.find((user) => user.id === selectedUser);

  const register = async (event) => {
    if (!selectedUser) return setNotice({ type: 'error', message: 'Choose a participant before registering.' });
    setBusyEvent(event.id);
    try {
      const registration = await api('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: selectedUser, event_id: event.id }),
      });
      setRegistrations((current) => [registration, ...current]);
      setNotice({ type: 'success', message: `Confirmed: You are registered for ${event.title}.` });
    } catch (error) {
      setNotice({ type: 'error', message: error.message });
    } finally {
      setBusyEvent('');
    }
  };

  const showAttendees = async (event) => {
    try {
      const people = await api(`/api/events/${event.id}/registrations`);
      setAttendeeEvent({ event, people });
    } catch (error) {
      setNotice({ type: 'error', message: error.message });
    }
  };

  return (
    <>
      <header className="topbar">
        <a className="brand" href="#home">
          <span className="brand-mark">SU</span>
          <span>
            <strong>SUSHANT</strong>
            <small>FEST 2026</small>
          </span>
        </a>
        <nav>
          <a href="#events">Events</a>
          <a href="#tracks">Tracks</a>
          <a href="#my-schedule">My schedule</a>
          <a href="#gallery">Gallery</a>
          <a href="#faq">FAQ</a>
          <a href="#about">About</a>
        </nav>
        <a className="outline-button" href="#events">
          {icon('rocket_launch')} Explore now
        </a>
      </header>

      <main id="home">
        {/* HERO SECTION */}
        <section className="hero">
          <div className="grid-backdrop" />
          <div className="hero-content">
            <div className="eyebrow">
              <i /> REGISTRATIONS OPEN · SPRING 2026 EDITION
            </div>
            <h1>
              Build what’s <span>next.</span>
            </h1>
            <p>
              A campus-wide summit connecting cutting-edge engineering, competitive hackathons, creative design, and live cultural showcases. Zero friction, instant access.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#events">
                Browse events {icon('arrow_downward')}
              </a>
              <a className="text-button" href="#my-schedule">
                My registrations {icon('calendar_month')}
              </a>
            </div>
            <div className="metrics">
              <div>
                <strong>{events.length || '—'}</strong>
                <span>Live events</span>
              </div>
              <div>
                <strong>{users.length || '—'}</strong>
                <span>Participants</span>
              </div>
              <div>
                <strong>01</strong>
                <span>Unified API</span>
              </div>
            </div>
          </div>
          <div className="signal-card">
            <div className="signal-head">
              <span>FEST STATUS</span>
              <b>LIVE</b>
            </div>
            <div className="orbit">
              <span>2026</span>
            </div>
            <p>Explore. Register. Create.</p>
            <small>LIVE DATA FROM BACKEND API</small>
          </div>
        </section>

        {/* EVENTS SECTION */}
        <section className="section" id="events">
          <div className="section-heading">
            <div>
              <span className="section-kicker">DISCOVER THE PROGRAM</span>
              <h2>Upcoming events</h2>
              <p>Every event below is loaded live directly from the registration backend service.</p>
            </div>
            <button className="reload" onClick={loadCore} disabled={loading}>
              {icon('refresh')} Refresh
            </button>
          </div>
          <div className="toolbar">
            <label className="search">
              {icon('search')}
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events by title..."
              />
            </label>
            <div className="filters">
              {['upcoming', 'all'].map((value) => (
                <button
                  key={value}
                  onClick={() => setStatus(value)}
                  className={status === value ? 'active' : ''}
                >
                  {value === 'all' ? 'All events' : 'Upcoming'}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="empty-state">
              {icon('progress_activity', 'spin')} Loading live event registry from database…
            </div>
          ) : filteredEvents.length ? (
            <div className="event-grid">
              {filteredEvents.map((event, index) => (
                <article className="event-card" key={event.id}>
                  <div className={`card-accent accent-${index % 3}`} />
                  <div className="event-top">
                    <span className="status-dot">{event.status || 'upcoming'}</span>
                    <button
                      className="icon-button"
                      onClick={() => showAttendees(event)}
                      title={`View ${event.title} attendee list`}
                      aria-label={`View ${event.title} attendee list`}
                    >
                      {icon('groups')}
                    </button>
                  </div>
                  <h3>{event.title}</h3>
                  <p className="event-meta">
                    {icon('groups')} Capacity: <b>{event.capacity ?? 'Open'}</b>
                  </p>
                  <p className="event-meta">
                    {icon('hub')} {event.organizer_id ? 'Campus Organizer' : 'Community Event'}
                  </p>
                  <div className="card-footer">
                    {registeredIds.has(event.id) ? (
                      <span className="registered">
                        {icon('check_circle')} Registered
                      </span>
                    ) : (
                      <button
                        className="register-button"
                        disabled={busyEvent === event.id}
                        onClick={() => register(event)}
                      >
                        {busyEvent === event.id ? 'Registering…' : 'Register now'}{' '}
                        {icon('arrow_forward')}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              {icon('event_busy')} No events match this filter view.
            </div>
          )}
        </section>

        {/* TRACKS & CATEGORIES */}
        <section className="section" id="tracks">
          <div className="section-heading">
            <div>
              <span className="section-kicker">TECHNICAL SPECTRUM</span>
              <h2>Fest Tracks &amp; Disciplines</h2>
              <p>Explore interdisciplinary tracks designed to ignite curiosity and challenge boundaries.</p>
            </div>
          </div>
          <div className="track-grid">
            {TRACKS.map((track) => (
              <div className="track-card" key={track.name}>
                <div className="track-icon-wrapper" style={{ color: track.color }}>
                  {icon(track.icon)}
                </div>
                <h3>{track.name}</h3>
                <p>{track.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MY SCHEDULE / PARTICIPANT PASS */}
        <section className="section schedule-section" id="my-schedule">
          <div className="section-heading">
            <div>
              <span className="section-kicker">YOUR FEST PASS</span>
              <h2>My schedule</h2>
              <p>Select a participant to view their confirmed registrations synced with Supabase.</p>
            </div>
          </div>
          <div className="schedule-panel">
            <div className="participant-picker">
              <label htmlFor="participant">Viewing as</label>
              <select
                id="participant"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Choose a participant</option>
                {users.map((user) => (
                  <option value={user.id} key={user.id}>
                    {user.email} · {user.role}
                  </option>
                ))}
              </select>
              <small>
                {selectedPerson
                  ? `Participant ID: ${selectedPerson.id.slice(0, 8)}…`
                  : 'No participant selected'}
              </small>
            </div>
            <div className="schedule-list">
              {registrations.length ? (
                registrations.map((registration) => (
                  <div className="schedule-item" key={registration.id}>
                    {icon('verified')}
                    <div>
                      <strong>{registration.events?.title || 'Event registration'}</strong>
                      <span>Confirmed · {new Date(registration.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className="schedule-cap">
                      {registration.events?.capacity ?? '—'} seats
                    </span>
                  </div>
                ))
              ) : (
                <div className="schedule-empty">
                  {icon('calendar_add_on')} Your schedule is clear. Register for an event above to see it here!
                </div>
              )}
            </div>
          </div>
        </section>

        {/* GALLERY & EXPERIENCES */}
        <section className="section" id="gallery">
          <div className="section-heading">
            <div>
              <span className="section-kicker">IMMERSIVE EXPERIENCE</span>
              <h2>Fest Highlights &amp; Gallery</h2>
              <p>Glimpses from high-octane stages, midnight hackathons, robotics arenas, and amphitheatre nights.</p>
            </div>
          </div>
          <div className="gallery-grid">
            {GALLERY.map((item) => (
              <article className="gallery-card" key={item.title}>
                <div className="gallery-img-container">
                  <img src={item.img} alt={item.title} loading="lazy" />
                  <span className="gallery-badge" style={{ color: item.tagColor }}>
                    {item.tag}
                  </span>
                </div>
                <div className="gallery-body">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section className="section" id="faq">
          <div className="section-heading">
            <div>
              <span className="section-kicker">NEED CLARITY?</span>
              <h2>Frequently asked questions</h2>
              <p>Everything you need to know about participating and registering.</p>
            </div>
          </div>
          <div className="faq-list">
            {FAQS.map((faq, i) => (
              <div
                className={`faq-item ${expandedFaq === i ? 'open' : ''}`}
                key={faq.q}
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
              >
                <div className="faq-question">
                  <span>{faq.q}</span>
                  {icon(expandedFaq === i ? 'expand_less' : 'expand_more')}
                </div>
                {expandedFaq === i && <div className="faq-answer">{faq.a}</div>}
              </div>
            ))}
          </div>
        </section>

        {/* ABOUT & VALUE PROP */}
        <section className="section why" id="about">
          <div>
            <span className="section-kicker">ONE CAMPUS · ENDLESS IDEAS</span>
            <h2>A festival built for the curious.</h2>
          </div>
          <div className="reason-grid">
            <div>
              {icon('code_blocks')}
              <h3>Hands-on learning</h3>
              <p>Turn ideas into working code through real-time engineering sprints and mentor-led workshops.</p>
            </div>
            <div>
              {icon('diversity_3')}
              <h3>Open access</h3>
              <p>No login barrier. Pick a participant profile and reserve your seat in seconds.</p>
            </div>
            <div>
              {icon('auto_awesome')}
              <h3>Future-facing</h3>
              <p>Collaborate with the students, researchers, and creators defining next-generation campus technology.</p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <a className="brand" href="#home">
          <span className="brand-mark">SU</span>
          <strong>SUSHANT 2026</strong>
        </a>
        <p>Campus Innovation &amp; Cultural Fest</p>
        <span>Connected to Event Registration Backend API</span>
      </footer>

      {notice && (
        <div className={`toast ${notice.type}`}>
          {icon(notice.type === 'success' ? 'check_circle' : 'error')}
          <span>{notice.message}</span>
          <button onClick={() => setNotice(null)}>{icon('close')}</button>
        </div>
      )}

      {attendeeEvent && (
        <div className="modal-backdrop" onMouseDown={() => setAttendeeEvent(null)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="section-kicker">ATTENDEE REGISTRY</span>
                <h2>{attendeeEvent.event.title}</h2>
              </div>
              <button className="icon-button" onClick={() => setAttendeeEvent(null)}>
                {icon('close')}
              </button>
            </div>
            {attendeeEvent.people.length ? (
              <ul className="attendee-list">
                {attendeeEvent.people.map((person) => (
                  <li key={person.id}>
                    <span>{person.users?.email?.slice(0, 1).toUpperCase() || '?'}</span>
                    <div>
                      <strong>{person.users?.email || 'Participant'}</strong>
                      <small>{person.users?.role || 'attendee'}</small>
                    </div>
                    <time>{new Date(person.created_at).toLocaleDateString()}</time>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="modal-empty">No registrations yet &mdash; be the first to join!</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
