import React, { useState, useEffect, useRef, useCallback } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { loadUserData, saveUserData } from './firestoreHelpers';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Login from './Login';
import LandingPage from './LandingPage';
import Navbar from './Navbar';
import Footer from './Footer';
import './App.css';

const ROADMAPS = {
  frontend: {
    name: 'Frontend Developer',
    description: 'Design and build engaging user interfaces and interactive web experiences using HTML, CSS, JavaScript, and modern frameworks.',
    estimatedTime: '4–6 Months',
    steps: [
      { id: 'fe1', level: 'Beginner', text: 'Internet Basics', time: '1 Week', tip: 'Understand DNS, HTTP/HTTPS, and how browsers work via MDN.' },
      { id: 'fe2', level: 'Beginner', text: 'HTML & CSS Foundations', time: '2-3 Weeks', tip: 'Focus on semantic HTML and CSS Flexbox/Grid via freeCodeCamp.' },
      { id: 'fe3', level: 'Beginner', text: 'JavaScript Essentials', time: '3-4 Weeks', tip: 'Master DOM manipulation, Promises, and ES6+ syntax.' },
      { id: 'fe4', level: 'Intermediate', text: 'Version Control (Git)', time: '1 Week', tip: 'Learn branching, merging, and pull requests via GitHub.' },
      { id: 'fe5', level: 'Intermediate', text: 'Modern React', time: '3-4 Weeks', tip: 'Practice hooks (useState, useEffect) and component lifecycles.' },
      { id: 'fe6', level: 'Intermediate', text: 'State Management (Redux/Zustand)', time: '2 Weeks', tip: 'Build a small cart app using Redux Toolkit or Zustand.' },
      { id: 'fe7', level: 'Advanced', text: 'CSS Frameworks & Preprocessors', time: '1-2 Weeks', tip: 'Try rapidly prototyping a layout with Tailwind CSS.' },
      { id: 'fe8', level: 'Advanced', text: 'Testing (Jest/Cypress)', time: '2 Weeks', tip: 'Write basic unit tests using Jest and React Testing Library.' }
    ]
  },
  backend: {
    name: 'Backend Developer',
    description: 'Build scalable server-side applications using Node.js, relational and NoSQL databases, and robust APIs.',
    estimatedTime: '5–7 Months',
    steps: [
      { id: 'be1', level: 'Beginner', text: 'Internet & OS Basics', time: '1-2 Weeks', tip: 'Learn terminal usage, threads, and memory management.' },
      { id: 'be2', level: 'Beginner', text: 'Programming Language (Node/Python)', time: '4-5 Weeks', tip: 'Focus on asynchronous execution and file system handling.' },
      { id: 'be3', level: 'Beginner', text: 'Version Control (Git)', time: '1 Week', tip: 'Practice rebasing and commit history management.' },
      { id: 'be4', level: 'Intermediate', text: 'Relational Databases (PostgreSQL)', time: '3-4 Weeks', tip: 'Write complex JOINs and understand ACID properties.' },
      { id: 'be5', level: 'Intermediate', text: 'NoSQL Databases (MongoDB)', time: '2-3 Weeks', tip: 'Use MongoDB to store and query unstructured document data.' },
      { id: 'be6', level: 'Intermediate', text: 'APIs (REST/GraphQL)', time: '3-4 Weeks', tip: 'Build complete CRUD endpoints and handle authentication.' },
      { id: 'be7', level: 'Advanced', text: 'Caching (Redis)', time: '1-2 Weeks', tip: 'Implement a Redis store to reduce database query loads.' },
      { id: 'be8', level: 'Advanced', text: 'Security Foundations', time: '2 Weeks', tip: 'Learn about CORS, hashing passwords, and preventing SQL injection.' }
    ]
  },
  uiux: {
    name: 'UI/UX Designer',
    description: 'Create intuitive, user-centric interfaces. Master wireframing, prototyping, user research, and modern design tools like Figma.',
    estimatedTime: '3–5 Months',
    steps: [
      { id: 'ui1', level: 'Beginner', text: 'Design Fundamentals & Color Theory', time: '2 Weeks', tip: 'Study color theory, typography pairing, and whitespace on Dribbble.' },
      { id: 'ui2', level: 'Beginner', text: 'User Research & Personas', time: '2-3 Weeks', tip: 'Conduct mock interviews and build 3 distinct user personas.' },
      { id: 'ui3', level: 'Beginner', text: 'Wireframing & UI Flows', time: '2 Weeks', tip: 'Sketch low-fidelity layout flows rapidly using Balsamiq or pen.' },
      { id: 'ui4', level: 'Intermediate', text: 'Figma Mastery', time: '3-4 Weeks', tip: 'Learn to use components, variants, and auto-layout perfectly.' },
      { id: 'ui5', level: 'Intermediate', text: 'Prototyping & Animation', time: '2-3 Weeks', tip: 'Link frames to create realistic clickable application demos.' },
      { id: 'ui6', level: 'Intermediate', text: 'Usability Testing', time: '1-2 Weeks', tip: 'Ask 5 friends to use your prototype and record their friction points.' },
      { id: 'ui7', level: 'Advanced', text: 'Design Systems', time: '2-3 Weeks', tip: 'Create a reusable library of buttons, inputs, and typography tokens.' },
      { id: 'ui8', level: 'Advanced', text: 'Portfolio Building', time: '3-4 Weeks', tip: 'Publish 3 detailed case studies explaining your design rationale.' }
    ]
  },
  appdev: {
    name: 'App Developer',
    description: 'Build native and cross-platform mobile experiences for iOS and Android using modern environments like React Native or Flutter.',
    estimatedTime: '4–6 Months',
    steps: [
      { id: 'app1', level: 'Beginner', text: 'Mobile Architecture Basics', time: '1-2 Weeks', tip: 'Understand app lifecycles and mobile UI rendering principles.' },
      { id: 'app2', level: 'Beginner', text: 'Programming Language (Swift/Kotlin/Dart)', time: '4-5 Weeks', tip: 'Practice Swift, Kotlin, or Dart depending on your track.' },
      { id: 'app3', level: 'Beginner', text: 'UI Components & Layouts', time: '3 Weeks', tip: 'Build responsive views adapting to different phone screen sizes.' },
      { id: 'app4', level: 'Intermediate', text: 'State Management & Navigation', time: '2-3 Weeks', tip: 'Implement tab bars, stack routing, and deep linking paradigms.' },
      { id: 'app5', level: 'Intermediate', text: 'Working with Device APIs', time: '2 Weeks', tip: 'Use camera, GPS location, and push notification services.' },
      { id: 'app6', level: 'Intermediate', text: 'Storing Data Locally (SQLite/CoreData)', time: '2-3 Weeks', tip: 'Save user preferences or offline data using SQLite or AsyncStorage.' },
      { id: 'app7', level: 'Advanced', text: 'Connecting to REST/GraphQL APIs', time: '2-3 Weeks', tip: 'Fetch remote JSON data and handle offline caching edge cases.' },
      { id: 'app8', level: 'Advanced', text: 'App Store Deployment', time: '1-2 Weeks', tip: 'Navigate app signing, certificates, and app store review guidelines.' }
    ]
  },
  cybersec: {
    name: 'Cybersecurity',
    description: 'Protect systems and networks against digital attacks. Master ethical hacking, cryptography, network security, and vulnerability management.',
    estimatedTime: '6–8 Months',
    steps: [
      { id: 'cy1', level: 'Beginner', text: 'IT Fundamentals & Networking', time: '3-4 Weeks', tip: 'Master the OSI model and basic TCP/IP networking concepts.' },
      { id: 'cy2', level: 'Beginner', text: 'Linux & OS Security Basics', time: '3-4 Weeks', tip: 'Get comfortable with bash scripting and root permission management.' },
      { id: 'cy3', level: 'Beginner', text: 'Cryptography Principles', time: '2-3 Weeks', tip: 'Understand symmetric vs asymmetric encryption.' },
      { id: 'cy4', level: 'Intermediate', text: 'Network Security Architecture', time: '3-4 Weeks', tip: 'Analyze packet traffic using fundamental tools like Wireshark.' },
      { id: 'cy5', level: 'Intermediate', text: 'Identity & Access Management', time: '2 Weeks', tip: 'Explore OAuth, JWT, and multi-factor authentication systems.' },
      { id: 'cy6', level: 'Intermediate', text: 'Vulnerability Scanning', time: '2-3 Weeks', tip: 'Use Nmap and OpenVAS to discover exposed system vulnerabilities.' },
      { id: 'cy7', level: 'Advanced', text: 'Web Application Security', time: '3-4 Weeks', tip: 'Study the OWASP Top 10 including XSS, CSRF, and injection attacks.' },
      { id: 'cy8', level: 'Advanced', text: 'Incident Response & Threat Hunting', time: '3-4 Weeks', tip: 'Learn the lifecycle of detecting and recovering from an active breach.' }
    ]
  },
  genai: {
    name: 'Generative AI Engineer',
    description: 'Build intelligent applications leveraging Large Language Models (LLMs), diffusion models, RAG systems, and advanced agentic prompting techniques.',
    estimatedTime: '5–8 Months',
    steps: [
      { id: 'ai1', level: 'Beginner', text: 'Python & Math Foundations', time: '3-4 Weeks', tip: 'Master Python fundamentals, Linear Algebra, and Calculus basics for AI.' },
      { id: 'ai2', level: 'Beginner', text: 'Machine Learning Basics', time: '3-4 Weeks', tip: 'Learn Scikit-Learn, regression, classification, and model evaluation metrics.' },
      { id: 'ai3', level: 'Beginner', text: 'Deep Learning & Neural Networks', time: '3-4 Weeks', tip: 'Understand backpropagation, CNNs, and RNNs using PyTorch or TensorFlow.' },
      { id: 'ai4', level: 'Intermediate', text: 'Transformers Architecture', time: '2-3 Weeks', tip: 'Study the Attention Mechanism and the foundational paper "Attention Is All You Need".' },
      { id: 'ai5', level: 'Intermediate', text: 'Embeddings & Vector Databases', time: '2-3 Weeks', tip: 'Practice vector representations and semantic search using tools like Pinecone or ChromaDB.' },
      { id: 'ai6', level: 'Intermediate', text: 'Retrieval-Augmented Generation (RAG)', time: '3-4 Weeks', tip: 'Build specific chatbots grounded in custom PDF/Text datasets using LangChain.' },
      { id: 'ai7', level: 'Advanced', text: 'Prompt Engineering & Agents', time: '2-3 Weeks', tip: 'Master few-shot prompting, chain-of-thought logic, and autonomous agent frameworks.' },
      { id: 'ai8', level: 'Advanced', text: 'LLM Fine-Tuning & Deployment', time: '3-4 Weeks', tip: 'Learn parameter-efficient tuning (LoRA) and deploy models via FastAPI or Hugging Face.' }
    ]
  }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentView, setCurrentView] = useState('home');

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('global-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('global-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const cursorGlowRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (cursorGlowRef.current) {
      cursorGlowRef.current.style.left = e.clientX + 'px';
      cursorGlowRef.current.style.top = e.clientY + 'px';
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser && currentView === 'login') {
        setCurrentView('dashboard');
      }
    });
    return () => unsubscribe();
  }, [currentView]);

  if (authLoading) {
    return (
      <div className="app-container">
        <div style={{ textAlign: 'center', marginTop: '10rem', color: 'var(--text-secondary)' }}>
          Loading secure environment...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="cursor-glow" ref={cursorGlowRef}></div>
      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      <Navbar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        user={user} 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />
      <div className="app-main-content" style={{ minHeight: 'calc(100vh - 76px)' }}>
        {currentView === 'home' && <LandingPage onNavigate={setCurrentView} />}
        {currentView === 'login' && <div className="page-padding"><Login /></div>}
        {currentView === 'dashboard' && user && <div className="page-padding"><Dashboard user={user} /></div>}
        {currentView === 'dashboard' && !user && <div className="page-padding"><Login /></div>}
      </div>
      {currentView === 'home' && <Footer onNavigate={setCurrentView} />}
    </>
  );
}

// Audio system - Singleton context to prevent browser blocking
let sharedAudioCtx = null;
const getAudioCtx = () => {
  if (!sharedAudioCtx) {
    sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return sharedAudioCtx;
};

function Dashboard({ user }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  // ---- State (initialized from localStorage for instant UI) ----
  const [selectedCareer, setSelectedCareer] = useState(() => {
    return localStorage.getItem(`roadmap-career-${user.uid}`) || 'frontend';
  });
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem(`roadmap-progress-${user.uid}`);
    return saved ? JSON.parse(saved) : {};
  });
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem(`roadmap-streak-${user.uid}`);
    return saved ? JSON.parse(saved) : { count: 0, lastDate: null };
  });

  const [filterLevel, setFilterLevel] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTips, setExpandedTips] = useState({});

  // ---- Firestore sync ----
  const [firestoreLoading, setFirestoreLoading] = useState(true);
  const initialLoadDone = useRef(false); // prevents save-on-load loop

  // Load from Firestore on mount (overrides localStorage if data exists)
  useEffect(() => {
    async function fetchData() {
      const data = await loadUserData(user.uid);
      if (data) {
        if (data.progress) {
          setProgress(data.progress);
          localStorage.setItem(`roadmap-progress-${user.uid}`, JSON.stringify(data.progress));
        }
        if (data.streak) {
          // Ensure streak is at least 1 as per new requirement
          const correctedStreak = { 
            ...data.streak, 
            count: Math.max(data.streak.count || 0, 1) 
          };
          setStreak(correctedStreak);
          localStorage.setItem(`roadmap-streak-${user.uid}`, JSON.stringify(correctedStreak));
        }
        if (data.selectedCareer) {
          setSelectedCareer(data.selectedCareer);
          localStorage.setItem(`roadmap-career-${user.uid}`, data.selectedCareer);
        }
      }
      setFirestoreLoading(false);
      // Small delay so the state updates settle before we start watching for saves
      setTimeout(() => { initialLoadDone.current = true; }, 500);
    }
    fetchData();
  }, [user.uid]);

  const resetProgress = async () => {
    if (window.confirm("Are you sure you want to reset ALL your progress? This cannot be undone.")) {
      setProgress({});
      setStreak({ count: 1, lastDate: new Date().toLocaleDateString() });
      setDisplayPercentage(0);
      localStorage.setItem(`roadmap-progress-${user.uid}`, JSON.stringify({}));
      localStorage.setItem(`roadmap-streak-${user.uid}`, JSON.stringify({ count: 1, lastDate: new Date().toLocaleDateString() }));
      await saveUserData(user.uid, { progress: {}, streak: { count: 1, lastDate: new Date().toLocaleDateString() }, selectedCareer });
    }
  };

  // Debounced save to Firestore (1.5s after last change)
  useEffect(() => {
    if (!initialLoadDone.current) return; // skip the initial load

    const timer = setTimeout(() => {
      saveUserData(user.uid, { progress, streak, selectedCareer });
    }, 1500);

    return () => clearTimeout(timer);
  }, [progress, streak, selectedCareer, user.uid]);

  // ---- Keep localStorage in sync (instant UI) ----
  useEffect(() => {
    localStorage.setItem(`roadmap-career-${user.uid}`, selectedCareer);
  }, [selectedCareer, user.uid]);

  useEffect(() => {
    localStorage.setItem(`roadmap-progress-${user.uid}`, JSON.stringify(progress));
  }, [progress, user.uid]);

  useEffect(() => {
    localStorage.setItem(`roadmap-streak-${user.uid}`, JSON.stringify(streak));
  }, [streak, user.uid]);

  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    setStreak(prev => {
      if (prev.lastDate === today) return prev;
      
      let newCount = 1;
      if (prev.lastDate) {
        const lastDateObj = new Date(prev.lastDate);
        const todayObj = new Date(today);
        const diffTime = Math.abs(todayObj - lastDateObj);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newCount = prev.count + 1;
        }
      }
      return { count: newCount, lastDate: today };
    });
  };

  const playTickSound = async () => {
    try {
      const ctx = getAudioCtx();
      if (ctx.state === 'suspended') await ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) { console.warn("Audio play blocked", e); }
  };

  const playUndoSound = async () => {
    try {
      const ctx = getAudioCtx();
      if (ctx.state === 'suspended') await ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.setValueAtTime(400, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) { console.warn("Audio play blocked", e); }
  };

  const handleToggle = (stepId) => {
    const isCompleting = !progress[stepId];
    if (isCompleting) {
      playTickSound();
    } else {
      playUndoSound();
    }
    updateStreak();
    setProgress((prev) => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const currentRoadmap = ROADMAPS[selectedCareer];
  const steps = currentRoadmap.steps;
  const completedCount = steps.filter(step => progress[step.id]).length;
  const progressPercentage = Math.round((completedCount / steps.length) * 100) || 0;
  
  const getRemainingTimeText = (timeString, percentage) => {
    if (percentage === 100) return "Completed";
    if (percentage === 0) return timeString;
    const match = timeString.match(/(\d+)[–-](\d+)/);
    if (!match) return timeString;
    
    const min = parseInt(match[1]);
    const max = parseInt(match[2]);
    const remainRatio = (100 - percentage) / 100;
    
    let remainMin = Math.round(min * remainRatio);
    let remainMax = Math.round(max * remainRatio);

    if (remainMax < 1) return "< 1 Month remaining";
    if (remainMin === 0) remainMin = 1;
    if (remainMin >= remainMax) return `${remainMax} Month${remainMax !== 1 ? 's' : ''} remaining`;

    return `${remainMin}–${remainMax} Months remaining`;
  };
  
  const remainingTimeStr = getRemainingTimeText(currentRoadmap.estimatedTime, progressPercentage);

  const nextStep = steps.find(step => !progress[step.id]);

  const exportProgress = () => {
    let report = `=== Career Roadmap Progress: ${currentRoadmap.name} ===\n`;
    report += `Status: ${completedCount} / ${steps.length} Completed (${progressPercentage}%)\n`;
    report += `Estimated Time: ${remainingTimeStr}\n\n`;
    report += `--- Curriculum Modules ---\n`;
    
    steps.forEach((step, index) => {
      const status = progress[step.id] ? '[x] Completed' : '[ ] Pending  ';
      report += `${status} | ${index + 1}. ${step.text} | ${step.level} (${step.time})\n`;
    });
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCareer}-roadmap-progress.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      
      if (key === 'r') {
        e.preventDefault();
        resetProgress();
      } else if (key === 'c') {
        e.preventDefault();
        if (nextStep) {
          handleToggle(nextStep.id);
        }
      } else if (key === 'e') {
        e.preventDefault();
        exportProgress();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextStep, progress, exportProgress]);

  const getMilestoneBadge = (percentage) => {
    if (percentage === 100) return { label: "Expert", icon: "🟣", class: "expert" };
    if (percentage >= 50) return { label: "Intermediate", icon: "🔵", class: "intermediate" };
    if (percentage >= 25) return { label: "Beginner", icon: "🟢", class: "beginner" };
    return { label: "Novice", icon: "⚪", class: "novice" };
  };

  const currentMilestone = getMilestoneBadge(progressPercentage);

  const [displayPercentage, setDisplayPercentage] = useState(progressPercentage);

  // Reset display percentage instantly when switching career paths to keep progress separate
  useEffect(() => {
    setDisplayPercentage(progressPercentage);
  }, [selectedCareer]);

  useEffect(() => {
    let start = displayPercentage;
    const end = progressPercentage;
    if (start === end) return;
    
    const duration = 500;
    const diff = Math.abs(end - start);
    if (diff === 0) return;
    
    const increment = end > start ? 1 : -1;
    const stepTime = Math.max(Math.floor(duration / diff), 10);
    
    const timer = setInterval(() => {
      start += increment;
      setDisplayPercentage(start);
      if (start === end || (increment > 0 && start > end) || (increment < 0 && start < end)) {
        setDisplayPercentage(end);
        clearInterval(timer);
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [progressPercentage]);

  // Chart Component
  const SkillChart = ({ completed, remaining }) => {
    const data = [
      { name: 'Completed', value: completed, color: '#6366f1' },
      { name: 'Remaining', value: remaining, color: 'rgba(255,255,255,0.05)' }
    ];

    if (completed === 0 && remaining === 0) return null;

    return (
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius="65%"
              outerRadius="90%"
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                background: 'var(--bg-secondary)', 
                border: '1px solid var(--bg-tertiary)',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              itemStyle={{ color: 'var(--text-primary)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="chart-center-label">
          <span className="chart-pct">{progressPercentage}%</span>
        </div>
      </div>
    );
  };

  const getMotivationalText = (percentage, completed, total) => {
    const baseText = `You completed ${completed} out of ${total} topics.`;
    if (percentage === 0) return `🚀 Ready to start? Let's go!`;
    if (percentage < 30) return `${baseText} 🔥 Keep going! You're just getting started!`;
    if (percentage < 70) return `${baseText} ⭐ Halfway there! You're doing great!`;
    if (percentage < 100) return `${baseText} ⚡ Almost done! Finish strong!`;
    return `🏆 Amazing! You have mastered all ${total} topics in this roadmap!`;
  };

  // Show loading state while fetching Firestore data
  if (firestoreLoading) {
    return (
      <div className="app-container">
        <div style={{
          textAlign: 'center',
          marginTop: '8rem',
          color: 'var(--text-secondary)',
          fontSize: '1.1rem',
          fontWeight: 600
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔄</div>
          Loading your progress from the cloud...
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-top-row">
          <div className="header-content">
            <h1>Career Roadmap Planner</h1>
            <div className="header-subtitle-row">
              <p className="subtitle">👋 Welcome back, {user.displayName || user.email.split('@')[0]}! Keep building your future 🚀</p>
              <div className={`streak-badge ${streak.count > 0 ? 'active' : ''}`}>
                <span className="streak-icon">🔥</span>
                <span className="streak-count">{streak.count} Day Streak</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="controls">
          <label htmlFor="career-select">Select Career Path</label>
          <div className="select-wrapper">
            <select 
              id="career-select"
              value={selectedCareer} 
              onChange={(e) => {
                setSelectedCareer(e.target.value);
                setFilterLevel('All');
                setSearchQuery('');
                setExpandedTips({});
                e.target.blur();
              }}
            >
              {Object.entries(ROADMAPS).map(([key, roadmap]) => (
                <option key={key} value={key}>{roadmap.name}</option>
              ))}
            </select>
            <div className="select-arrow"></div>
          </div>
          <p className="career-description">
            {currentRoadmap.description}
          </p>
          <div className="career-meta">
            <span className="estimated-time">⏳ Estimated Time: {remainingTimeStr}</span>
            <button className="export-btn" onClick={exportProgress} title="Keyboard Shortcut: E">
              📄 Export Report (E)
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="progress-section">
          <div className="progress-header">
            <div className="progress-main-row">
              <div className="progress-title-wrapper">
                <h2>📊 Progress:</h2>
                <div className="progress-info-row">
                  <span className="progress-text">{displayPercentage}%</span>
                  <div className={`milestone-badge ${currentMilestone.class}`}>
                    <span className="milestone-icon">{currentMilestone.icon}</span>
                    {currentMilestone.label}
                  </div>
                </div>
              </div>
              <SkillChart 
                completed={completedCount} 
                remaining={steps.length - completedCount} 
              />
            </div>
            
            <div className="progress-stats">
              <div className="analytical-stats">
                <div className="stat-item">
                  <span className="stat-emoji">🎯</span>
                  <span className="stat-label">Goal</span>
                  <span className="stat-value">{steps.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-emoji">✅</span>
                  <span className="stat-label">Completed</span>
                  <span className="stat-value">{completedCount}</span>
                </div>
                <div className="stat-item highlight">
                  <span className="stat-emoji">⏳</span>
                  <span className="stat-label">Remaining</span>
                  <span className="stat-value">{steps.length - completedCount}</span>
                </div>
              </div>
              <button 
                className="reset-button" 
                onClick={() => setProgress({})}
                title="Keyboard Shortcut: R"
              >
                Reset Progress (R)
              </button>
            </div>
          </div>
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="progress-motivation">
            {getMotivationalText(progressPercentage, completedCount, steps.length)}
          </div>
        </div>

        <hr />

        {nextStep && (
          <div className="next-step-card">
            <div className="next-step-icon">✨</div>
            <div className="next-step-info">
              <span className="next-step-label">🎯 Next Focus:</span>
              <h3 className="next-step-title">{nextStep.text}</h3>
            </div>
            <button 
              className="next-step-action" 
              onClick={() => handleToggle(nextStep.id)}
              title="Keyboard Shortcut: C"
            >
              Mark Complete (C)
            </button>
          </div>
        )}

        {progressPercentage === 100 && (
          <div className="success-celebration">
            <span className="success-icon">🎉</span>
            <h3>Congratulations! You completed this roadmap!</h3>
            <p>You're fully prepared to tackle the real world.</p>
          </div>
        )}

        <div className="search-filter-toolbar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search topics..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-container">
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map(lvl => (
              <button 
                key={lvl}
                className={`filter-btn ${filterLevel === lvl ? 'active' : ''}`}
                onClick={() => setFilterLevel(lvl)}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="roadmap">
          {steps
            .map((step, originalIndex) => ({ step, originalIndex }))
            .filter(item => {
              const matchesLevel = filterLevel === 'All' || item.step.level === filterLevel;
              const matchesSearch = item.step.text.toLowerCase().includes(searchQuery.toLowerCase());
              return matchesLevel && matchesSearch;
            })
            .map(({ step, originalIndex }) => {
            const index = originalIndex;
            const isCompleted = !!progress[step.id];
            return (
              <div 
                key={step.id} 
                className={`roadmap-card ${isCompleted ? 'completed' : ''}`}
                onClick={() => handleToggle(step.id)}
              >
                <div className="card-number">{index + 1}</div>
                <div className="card-content">
                  <h3 className="card-title">{step.text}</h3>
                  <div className="card-meta-tags">
                    <span className={`status-badge ${isCompleted ? 'status-completed' : 'status-pending'}`}>
                      {isCompleted ? 'Completed' : 'Pending'}
                    </span>
                    <span className={`level-badge level-${step.level.toLowerCase()}`}>
                      {step.level}
                    </span>
                    <span className="time-badge">⏱️ {step.time}</span>
                  </div>
                  
                  {step.tip && (
                    <div className="card-footer">
                      <button 
                        className="text-toggle-btn"
                        onClick={(e) => {
                          e.stopPropagation(); // Don't trigger toggle when clicking Tip
                          setExpandedTips(prev => ({ ...prev, [step.id]: !prev[step.id] }));
                        }}
                      >
                        {expandedTips[step.id] ? '📖 Hide Tip' : '💡 View Tip'}
                      </button>
                      {expandedTips[step.id] && (
                        <p className="card-tip-text">{step.tip}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="checkbox-wrapper">
                  <input 
                    type="checkbox" 
                    checked={isCompleted}
                    readOnly
                  />
                  <span className="custom-checkbox"></span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
