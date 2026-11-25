import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Lenis from 'lenis';
import './styles.css';

// In development Vite runs on port 5173. In production or on Vercel/Render,
// the API is served from the same origin or via VITE_API_URL.
const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://127.0.0.1:5000' : window.location.origin)
).replace(/\/$/, '');

const icon = (name, className = '') => (
  <span className={`material-symbols-outlined ${className}`} aria-hidden="true">
    {name}
  </span>
);

const SECTIONS = [
  { id: 'home', code: '01', label: 'Intro' },
  { id: 'events', code: '02', label: 'Events' },
  { id: 'tracks', code: '03', label: 'Tracks' },
  { id: 'my-schedule', code: '04', label: 'Fest Pass' },
  { id: 'gallery', code: '05', label: 'Highlights' },
  { id: 'faq', code: '06', label: 'FAQ' },
];

const TRACKS = [
  {
    num: '01',
    title: 'AI & Machine Learning',
    tagline: 'Less hype, real intelligence.',
    desc: 'Build autonomous LLM workflows, RAG pipelines, computer vision systems, and edge inference tools that solve real campus challenges.',
    tags: ['LLMs', 'Agents', 'Vision', 'RAG'],
    accent: '#4cd7f6',
    accentRgb: '76, 215, 246',
    filterTerm: 'AI',
    img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80',
  },
  {
    num: '02',
    title: 'Beyond the Browser',
    tagline: 'Reimagine cloud & web systems.',
    desc: 'Architect high-throughput APIs, decentralized protocols, browser extensions, and real-time developer platforms built for resilience.',
    tags: ['Cloud', 'Web3', 'APIs', 'Systems'],
    accent: '#ffb35c',
    accentRgb: '255, 179, 92',
    filterTerm: 'Python',
    img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
  },
  {
    num: '03',
    title: 'Robotics & Hardware',
    tagline: 'Code meets physical motion.',
    desc: 'Fuse embedded firmware, telemetry sensors, and autonomous control loops into hardware prototypes, drones, and combat bots.',
    tags: ['ROS2', 'IoT', 'Embedded', 'Drones'],
    accent: '#5df2a8',
    accentRgb: '93, 242, 168',
    filterTerm: 'Data',
    img: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
  },
  {
    num: '04',
    title: 'Design & Creative Tech',
    tagline: 'Interfaces people remember.',
    desc: 'Craft tactile motion systems, spatial UI, accessibility-first products, and interactive storytelling built for human delight.',
    tags: ['UI/UX', 'Motion', 'Spatial', 'Systems'],
    accent: '#c08cff',
    accentRgb: '192, 140, 255',
    filterTerm: '',
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
  },
];

const GALLERY = [
  {
    title: 'TechNovation Keynote',
    tag: 'Main Stage',
    accent: '#4cd7f6',
    desc: 'Global industry visionaries unveiling the horizon of engineering.',
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Midnight Sprint Hackathon',
    tag: 'Hack Arena',
    accent: '#c08cff',
    desc: '36 hours of non-stop code, caffeine, and collaborative breakthroughs.',
    img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'RoboWars Championship',
    tag: 'Hardware Arena',
    accent: '#5df2a8',
    desc: 'High-torque autonomous bot battles and precision drone obstacle courses.',
    img: 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Amphitheatre Cultural Night',
    tag: 'Cultural Bash',
    accent: '#ffb35c',
    desc: 'Celebrity performances, indie music fusion, and open-air celebration.',
    img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
  },
];

const FAQS = [
  {
    cat: 'Eligibility',
    q: 'Who is eligible to participate in Sushant 2026?',
    a: 'Participation is open to all university students, developers, designers, and tech enthusiasts. Browse all tracks freely and reserve your seat without any account friction.',
  },
  {
    cat: 'Registration',
    q: 'How does event registration work?',
    a: 'Select your participant profile from the "Viewing as" dropdown in My Schedule, then click "Register now" on any event card. Registrations sync live with Supabase.',
  },
  {
    cat: 'Registration',
    q: 'Can I register for multiple events and workshops?',
    a: 'Yes. You can register for as many workshops and sessions as you like, provided seats remain open and capacity has not been reached.',
  },
  {
    cat: 'Organizers',
    q: 'How do I view confirmed attendees for an event?',
    a: 'Click the attendee icon in the top-right corner of any event card to open the live verified roster fetched from the backend API.',
  },
  {
    cat: 'Eligibility',
    q: 'Is there any entry fee or login barrier?',
    a: 'Entry and portal access are completely open. Pick your participant profile and get instant confirmation for workshops and hackathons.',
  },
];

function MaskedHeading({ text, accentDot = true, className = '' }) {
  const words = text.split(' ');
  return (
    <h2 className={`reveal-heading ${className}`} data-reveal="words">
      {words.map((word, idx) => (
        <span className="word-mask" key={`${word}-${idx}`}>
          <span className="word-inner" style={{ '--word-index': idx }}>
            {word}
            {idx === words.length - 1 && accentDot && <span className="square-dot" aria-hidden="true">.</span>}
          </span>
          {idx < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </h2>
  );
}

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

  // Interactive UI states
  const [activeTrack, setActiveTrack] = useState(0);
  const [faqFilter, setFaqFilter] = useState('All');
  const [tickerPaused, setTickerPaused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);

  const lenisRef = useRef(null);
  const dialogRef = useRef(null);
  const progressRef = useRef(null);
  const modalTitleId = useId();

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
    } catch {
      setNotice({
        type: 'error',
        message: `Could not reach the API at ${API_URL}. Start the backend server or check environment config.`,
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

  // Smooth inertial scrolling with Lenis (respects prefers-reduced-motion)
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: no-preference)');
    if (!motionQuery.matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Scroll-spy, shrinking header state & progress bar fallback
  useEffect(() => {
    const supportsScrollTimeline = CSS.supports('animation-timeline', 'scroll()');
    const onScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 32);

      if (!supportsScrollTimeline && progressRef.current) {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const pct = scrollable > 0 ? Math.min(1, Math.max(0, y / scrollable)) : 0;
        progressRef.current.style.transform = `scaleX(${pct})`;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: 0 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      sectionObserver.disconnect();
    };
  }, []);

  // Scroll reveal fallback for browsers without animation-timeline: view()
  useEffect(() => {
    const supportsViewTimeline = CSS.supports('(animation-timeline: view()) and (animation-range: entry)');
    const reducedMotion = !window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
    const targets = document.querySelectorAll('[data-reveal]');

    if (reducedMotion || supportsViewTimeline) {
      targets.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((el) => revealObserver.observe(el));
    return () => revealObserver.disconnect();
  }, [events, loading]);

  // Native <dialog> management + light-dismiss fallback when closedby isn't supported
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (attendeeEvent) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [attendeeEvent]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;

    const handleBackdropClick = (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const inside =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (!inside) dialog.close();
    };

    dialog.addEventListener('click', handleBackdropClick);
    return () => dialog.removeEventListener('click', handleBackdropClick);
  }, []);

  const scrollToSection = (e, targetId) => {
    e?.preventDefault();
    setMobileMenuOpen(false);
    const el = document.getElementById(targetId);
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: -86 });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

  const handleTrackPointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty('--px', `${x.toFixed(1)}%`);
    e.currentTarget.style.setProperty('--py', `${y.toFixed(1)}%`);
  };

  const exploreTrackEvents = (filterTerm) => {
    setQuery(filterTerm);
    setStatus('all');
    scrollToSection(null, 'events');
  };

  const visibleFaqs = faqFilter === 'All' ? FAQS : FAQS.filter((f) => f.cat === faqFilter);

  return (
    <>
      {/* SCROLL PROGRESS INDICATOR */}
      <div className="scroll-progress" ref={progressRef} aria-hidden="true" />

      {/* TOP ANNOUNCEMENT MARQUEE TICKER (WCAG 2.2.2 Pause control) */}
      <div className="ticker-bar">
        <div className="ticker-viewport">
          <div className={`ticker-track ${tickerPaused ? 'paused' : ''}`}>
            <div className="ticker-content">
              <span>SUSHANT 2026</span>
              <i className="diamond" aria-hidden="true">◆</i>
              <span>CAMPUS INNOVATION &amp; CULTURAL FEST</span>
              <i className="diamond" aria-hidden="true">◆</i>
              <span>LIVE REGISTRATIONS OPEN</span>
              <i className="diamond" aria-hidden="true">◆</i>
              <span>ZERO LOGIN FRICTION</span>
              <i className="diamond" aria-hidden="true">◆</i>
            </div>
            <div className="ticker-content" aria-hidden="true">
              <span>SUSHANT 2026</span>
              <i className="diamond">◆</i>
              <span>CAMPUS INNOVATION &amp; CULTURAL FEST</span>
              <i className="diamond">◆</i>
              <span>LIVE REGISTRATIONS OPEN</span>
              <i className="diamond">◆</i>
              <span>ZERO LOGIN FRICTION</span>
              <i className="diamond">◆</i>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="ticker-toggle"
          onClick={() => setTickerPaused((p) => !p)}
          aria-label={tickerPaused ? 'Play announcement ticker' : 'Pause announcement ticker'}
        >
          {icon(tickerPaused ? 'play_arrow' : 'pause')}
          <span>{tickerPaused ? 'Play' : 'Pause'}</span>
        </button>
      </div>

      {/* FLOATING PILL NAVBAR */}
      <div className={`navbar-wrap ${isScrolled ? 'scrolled' : ''}`}>
        <header className="pill-navbar">
          <a className="brand" href="#home" onClick={(e) => scrollToSection(e, 'home')}>
            <span className="brand-mark">SU</span>
            <span>
              <strong>SUSHANT</strong>
              <small>FEST 2026</small>
            </span>
          </a>

          <nav aria-label="Main Navigation" className="desktop-nav">
            {SECTIONS.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={(e) => scrollToSection(e, sec.id)}
                className={activeSection === sec.id ? 'active' : ''}
              >
                {sec.label}
              </a>
            ))}
          </nav>

          <div className="nav-actions">
            <a
              className="nav-cta"
              href="#events"
              onClick={(e) => scrollToSection(e, 'events')}
            >
              Register {icon('arrow_forward')}
            </a>
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? 'CLOSE ×' : 'MENU +'}
            </button>
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="mobile-drawer">
            {SECTIONS.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={(e) => scrollToSection(e, sec.id)}
                className={activeSection === sec.id ? 'active' : ''}
              >
                <span className="mono-code">{sec.code}</span>
                <span>{sec.label}</span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT-EDGE FIXED SCROLL-SPY TIMELINE RAIL */}
      <aside className="era-rail" aria-label="Section Quick Jump">
        {SECTIONS.map((sec) => (
          <a
            key={sec.id}
            href={`#${sec.id}`}
            onClick={(e) => scrollToSection(e, sec.id)}
            className={`era-rail-item ${activeSection === sec.id ? 'active' : ''}`}
          >
            <span className="era-rail-label">
              {sec.code} · {sec.label}
            </span>
            <span className="era-rail-dot" />
          </a>
        ))}
      </aside>

      <main id="home">
        {/* 01 / HERO SECTION */}
        <section className="hero">
          <div className="grid-backdrop" aria-hidden="true" />
          <div className="hero-glow-cyan" aria-hidden="true" />
          <div className="hero-glow-amber" aria-hidden="true" />

          <div className="hero-grid">
            <div className="hero-content">
              <div className="eyebrow-row">
                <span className="eyebrow">
                  <i /> REGISTRATIONS OPEN · SPRING 2026 EDITION
                </span>
                <span className="eyebrow-sub">01 / PORTAL</span>
              </div>
              <h1 className="hero-title">
                Build what’s <span>next</span>
                <span className="square-dot" aria-hidden="true">.</span>
              </h1>
              <p className="hero-lead">
                A campus-wide constellation of AI workshops, coding sprints, robotics arenas, and breakthrough ideas. Find your track and lock in your seat in one click.
              </p>
              <div className="hero-actions">
                <a
                  className="primary-button"
                  href="#events"
                  onClick={(e) => scrollToSection(e, 'events')}
                >
                  Explore Events {icon('arrow_downward')}
                </a>
                <a
                  className="secondary-button"
                  href="#tracks"
                  onClick={(e) => scrollToSection(e, 'tracks')}
                >
                  View Tracks {icon('layers')}
                </a>
              </div>
            </div>

            <div className="signal-card">
              <div className="signal-head">
                <span>FEST TELEMETRY</span>
                <b>● LIVE</b>
              </div>
              <div className="orbit">
                <span>2026</span>
              </div>
              <p>Explore. Register. Build.</p>
              <small>SYNCED WITH CAMPUS API</small>
            </div>
          </div>

          {/* BOTTOM HERO CONSOLE BAR (whackiest-2026 inspired) */}
          <div className="hero-console">
            <div className="console-status">
              <span className="mono-pill">SYSTEM · ONLINE</span>
              <span className="console-sub">REAL-TIME SUPABASE REGISTRY</span>
            </div>
            <div className="console-metrics">
              <div className="console-metric">
                <strong>{events.length || '05'}</strong>
                <span>Live Events</span>
              </div>
              <div className="console-metric">
                <strong>{users.length || '04'}</strong>
                <span>Participants</span>
              </div>
              <div className="console-metric">
                <strong>04</strong>
                <span>Fest Tracks</span>
              </div>
              <div className="console-metric">
                <strong>24H</strong>
                <span>Hack Sprint</span>
              </div>
            </div>
          </div>
        </section>

        {/* 02 / LIVE EVENTS REGISTRY */}
        <section className="section" id="events">
          <div className="section-heading" data-reveal="up">
            <div>
              <span className="section-kicker">02 / EVENT REGISTRY</span>
              <MaskedHeading text="Upcoming events" />
              <p>Every session below is loaded directly from your live Supabase database.</p>
            </div>
            <div className="heading-meta">
              <span className="meta-chip">Events · {String(events.length).padStart(2, '0')}</span>
              <button className="reload" onClick={loadCore} disabled={loading}>
                {icon('refresh', loading ? 'spin' : '')} Refresh
              </button>
            </div>
          </div>

          <div className="toolbar" data-reveal="up">
            <label className="search">
              {icon('search')}
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search workshops, sprints, tracks..."
              />
              {query && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                >
                  {icon('close')}
                </button>
              )}
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
                <article
                  className="event-card"
                  key={event.id}
                  data-reveal="up"
                  style={{ '--stagger': index }}
                >
                  <div className={`card-accent accent-${index % 4}`} />
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
                    {icon('groups')} Capacity: <b>{event.capacity ?? 'Open'} seats</b>
                  </p>
                  <p className="event-meta">
                    {icon('hub')} {event.organizer_id ? 'Campus Organizer' : 'Community Event'}
                  </p>
                  <div className="card-footer">
                    {registeredIds.has(event.id) ? (
                      <span className="registered">
                        {icon('check_circle')} Seat Confirmed
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
              {icon('event_busy')} No events match “{query}”.
              <button className="text-reset" onClick={() => { setQuery(''); setStatus('all'); }}>
                Reset filters
              </button>
            </div>
          )}
        </section>

        {/* 03 / #tracks HORIZONTAL EXPANDING ACCORDION (Inherited from whackiest-2026) */}
        <section className="section tracks-section" id="tracks">
          <div className="section-heading" data-reveal="up">
            <div>
              <span className="section-kicker">03 / TRACKS</span>
              <MaskedHeading text="Real problems. Bigger possibilities" />
              <p className="tracks-hint">
                <span className="hint-desktop">Hover or click a track to expand it</span>
                <span className="hint-mobile">Tap a track to expand it</span>
              </p>
            </div>
            <div className="heading-meta">
              <span className="meta-chip">Tracks · 04</span>
              <span className="meta-chip">Hours to build · 24</span>
            </div>
          </div>

          <div
            className="tracks-accordion"
            role="tablist"
            aria-label="Fest Tracks"
            data-reveal="up"
          >
            {TRACKS.map((track, idx) => {
              const isOpen = activeTrack === idx;
              return (
                <div
                  key={track.num}
                  role="tab"
                  tabIndex={0}
                  aria-selected={isOpen}
                  className={`track-panel ${isOpen ? 'is-open' : ''}`}
                  style={{
                    '--track-accent': track.accent,
                    '--track-rgb': track.accentRgb,
                  }}
                  onMouseEnter={() => setActiveTrack(idx)}
                  onClick={() => setActiveTrack(idx)}
                  onMouseMove={handleTrackPointerMove}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveTrack(idx);
                    }
                  }}
                >
                  <div
                    className="track-bg"
                    style={{ backgroundImage: `url(${track.img})` }}
                    aria-hidden="true"
                  />
                  <div className="track-halftone" aria-hidden="true" />
                  <div className="track-vignette" aria-hidden="true" />
                  <div className="track-spotlight" aria-hidden="true" />

                  {/* Collapsed Vertical Label */}
                  <div className="track-collapsed-bar">
                    <span className="track-collapsed-num">{track.num}</span>
                    <span className="track-collapsed-title">{track.title}</span>
                  </div>

                  {/* Expanded Track Content */}
                  <div className="track-expanded-content">
                    <div className="track-top-row">
                      <span className="track-big-num">{track.num}</span>
                      <div className="track-tags">
                        {track.tags.map((tag) => (
                          <span className="track-tag" key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="track-bottom-copy">
                      <h3>
                        {track.title}
                        <span className="track-dot" aria-hidden="true">.</span>
                      </h3>
                      <p className="track-tagline">{track.tagline}</p>
                      <p className="track-desc">{track.desc}</p>
                      <button
                        type="button"
                        className="track-filter-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          exploreTrackEvents(track.filterTerm);
                        }}
                      >
                        Explore matching events {icon('arrow_forward')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 04 / MY SCHEDULE / FEST PASS */}
        <section className="section schedule-section" id="my-schedule">
          <div className="section-heading" data-reveal="up">
            <div>
              <span className="section-kicker">04 / YOUR FEST PASS</span>
              <MaskedHeading text="My schedule" />
              <p>Select a participant to view their confirmed registrations synced with Supabase.</p>
            </div>
            <div className="heading-meta">
              <span className="meta-chip">
                Confirmed · {String(registrations.length).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="schedule-panel" data-reveal="up">
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
                      <span>
                        Confirmed · {new Date(registration.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="schedule-cap">
                      {registration.events?.capacity ?? '—'} seats
                    </span>
                  </div>
                ))
              ) : (
                <div className="schedule-empty">
                  {icon('calendar_add_on')} Your schedule is clear. Register for an event above to see it here.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 05 / GALLERY & EXPERIENCES */}
        <section className="section" id="gallery">
          <div className="section-heading" data-reveal="up">
            <div>
              <span className="section-kicker">05 / IMMERSIVE EXPERIENCE</span>
              <MaskedHeading text="Fest highlights" />
              <p>High-octane keynote stages, midnight hackathons, robotics arenas, and amphitheatre nights.</p>
            </div>
          </div>
          <div className="gallery-grid">
            {GALLERY.map((item, idx) => (
              <article
                className="gallery-card"
                key={item.title}
                data-reveal="up"
                style={{ '--stagger': idx }}
              >
                <div className="gallery-img-container">
                  <img src={item.img} alt={item.title} loading="lazy" />
                  <div className="gallery-halftone" aria-hidden="true" />
                  <span className="gallery-badge" style={{ color: item.accent }}>
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

        {/* 06 / FILTERABLE KNOWLEDGE BASE TERMINAL (Native <details> Accordion) */}
        <section className="section" id="faq">
          <div className="section-heading" data-reveal="up">
            <div>
              <span className="section-kicker">06 / KNOWLEDGE BASE</span>
              <MaskedHeading text="Frequently asked questions" />
              <p>Filter by topic or expand any question below.</p>
            </div>
            <div className="filters">
              {['All', 'Eligibility', 'Registration', 'Organizers'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFaqFilter(cat)}
                  className={faqFilter === cat ? 'active' : ''}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="faq-terminal" data-reveal="up">
            <div className="terminal-titlebar">
              <div className="terminal-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <span>sushant_2026://faq.kb</span>
            </div>
            <div className="faq-list">
              {visibleFaqs.map((faq) => (
                <details className="faq-details" key={faq.q}>
                  <summary>
                    <span className="faq-summary-text">{faq.q}</span>
                    <span className="faq-cat-pill">{faq.cat}</span>
                  </summary>
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer>
        <a className="brand" href="#home" onClick={(e) => scrollToSection(e, 'home')}>
          <span className="brand-mark">SU</span>
          <strong>SUSHANT 2026</strong>
        </a>
        <p>Campus Innovation &amp; Cultural Fest</p>
        <span>CONNECTED TO EVENT REGISTRATION API</span>
      </footer>

      {notice && (
        <div className={`toast ${notice.type}`} role="status" aria-live="polite">
          {icon(notice.type === 'success' ? 'check_circle' : 'error')}
          <span>{notice.message}</span>
          <button onClick={() => setNotice(null)} aria-label="Dismiss notification">
            {icon('close')}
          </button>
        </div>
      )}

      {/* NATIVE LIGHT-DISMISS <dialog> MODAL */}
      <dialog
        ref={dialogRef}
        className="attendee-dialog"
        aria-labelledby={modalTitleId}
        onClose={() => setAttendeeEvent(null)}
        {...{ closedby: 'any' }}
      >
        {attendeeEvent && (
          <div className="modal">
            <div className="modal-head">
              <div>
                <span className="section-kicker">ATTENDEE REGISTRY</span>
                <h2 id={modalTitleId}>{attendeeEvent.event.title}</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => dialogRef.current?.close()}
                aria-label="Close attendee list"
              >
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
        )}
      </dialog>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
