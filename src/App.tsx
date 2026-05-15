import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  ClipboardCheck, 
  Users, 
  Activity, 
  Building2, 
  GraduationCap, 
  UserRound, 
  AlertTriangle, 
  FileText,
  FileDown,
  Sparkles,
  CheckCircle2, 
  Save, 
  Download, 
  Trash2,
  Menu,
  X,
  Wifi,
  WifiOff,
  CloudUpload,
  RefreshCw,
  LogIn,
  LogOut,
  CloudCheck,
  MapPin,
  Locate,
  Search,
  History,
  Clock,
  LayoutDashboard,
  BarChart3,
  School,
  PieChart as PieChartIcon
} from 'lucide-react';
import { FormData } from './types';
import { INITIAL_FORM_DATA, SCHOOL_DIRECTORY } from './constants';
import { supabase, signIn, logOut } from './supabase';
import { User } from '@supabase/supabase-js';
import { dbService, PendingSync } from './lib/db';

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// --- Sub-components (simplified for the main App file, would be separate in a larger project) ---

const SidebarItem = ({ icon: Icon, label, active, onClick, completed }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
        : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    <div className={`p-1.5 rounded-lg ${active ? 'bg-blue-500' : 'bg-slate-200'}`}>
      <Icon size={18} />
    </div>
    <span className="text-sm font-medium text-left flex-1">{label}</span>
    {completed && !active && <CheckCircle2 size={16} className="text-green-500" />}
  </button>
);

import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup 
} from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon in Leaflet
import 'leaflet/dist/leaflet.css';

const wardCoords: Record<string, [number, number]> = {
  'Gizo': [-8.1030, 156.8419],
  'North Kolombangara': [-7.9167, 157.0833],
  'South Kolombangara': [-8.0833, 157.0833],
  'Inner Shortlands': [-7.0500, 155.8500],
  'Outer Shortlands': [-6.8500, 155.5333],
  'Mbilua': [-7.7833, 156.6667],
  'Irringilla': [-7.7500, 156.6000],
  'Vonunu': [-7.8500, 156.6500],
  'South Rannoga': [-8.1167, 156.5833],
  'Central Ranongga': [-8.0500, 156.5500],
  'North Ranongga': [-7.9500, 156.5167],
  'Simbo': [-8.2833, 156.5167],
  'Nono': [-8.3333, 157.8333],
  'North Vangunu': [-8.5167, 158.0833],
  'Nggatokae': [-8.7667, 158.2167],
  'Kusaghe': [-8.2167, 157.5167],
  'Kolombaghea': [-8.0833, 157.4167],
  'South Rendova': [-8.6500, 157.3167],
  'North Rendova': [-8.4167, 157.2500],
  'Roviana Lagoon': [-8.3333, 157.5000],
  'Noro': [-8.2167, 157.2000],
  'Munda': [-8.3278, 157.2711],
  'Nusa Roviana': [-8.3667, 157.3667],
  'Vonavona': [-8.2000, 157.0833],
};

const SchoolMap = ({ assessments, onSelectSchool }: { assessments: any[], onSelectSchool: (school: any) => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const filteredSchools = SCHOOL_DIRECTORY.filter(school => 
    school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.ward.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search schools by name or ward (e.g. 'Gizo', 'Primary')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"
        />
        {searchQuery && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <span className="text-[10px] font-bold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-full uppercase tracking-tight">
              {filteredSchools.length} Result{filteredSchools.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      <div className="h-[600px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
        <MapContainer center={[-8.10, 157.20]} zoom={8} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredSchools.map((school, idx) => {
            const coords = wardCoords[school.ward];
            if (!coords) return null;
            
            // Add a jitter to school locations within the same ward to prevent overlapping
            // Using a deterministic jitter based on SIEMIS ID and name
            const jitterSeed = `${school.siemis || ''}-${school.name}-${idx}`;
            let hash = 0;
            for (let i = 0; i < jitterSeed.length; i++) {
              hash = ((hash << 5) - hash) + jitterSeed.charCodeAt(i);
              hash |= 0;
            }
            const lat = coords[0] + (Math.sin(hash) * 0.04);
            const lng = coords[1] + (Math.cos(hash) * 0.04);
            
            const assessment = assessments.find(a => a.schoolName === school.name);

            return (
              <Marker key={`${school.name}-${idx}`} position={[lat, lng]} icon={customIcon}>
                <Popup>
                  <div className="p-1">
                    <h3 className="font-bold text-slate-800 text-sm mb-1">{school.name}</h3>
                    <div className="space-y-1 text-xs text-slate-600">
                      <p><strong>Type:</strong> {school.type}</p>
                      <p><strong>Ward:</strong> {school.ward}</p>
                      <p><strong>EP:</strong> {school.ep}</p>
                      {assessment ? (
                        <div className="mt-3 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1.5 text-blue-600 font-bold mb-1">
                            <CheckCircle2 size={12} />
                            Assessment Completed
                          </div>
                          <p><strong>Date:</strong> {assessment.assessmentDate}</p>
                          <p><strong>Damage:</strong> {assessment.overallDamageLevel}/4</p>
                          <button 
                            onClick={() => onSelectSchool({ type: 'assessment', data: assessment })}
                            className="mt-2 w-full py-1.5 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <div className="text-slate-400 italic mb-2">No assessment data available</div>
                          <button 
                            onClick={() => onSelectSchool({ type: 'school', data: school })}
                            className="w-full py-1.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                          >
                            Start Assessment
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default function App() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [activeSection, setActiveSection] = useState(0);
  const [view, setView] = useState<'form' | 'analysis' | 'map'>('form');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingSyncs, setPendingSyncs] = useState<any[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [savedAssessments, setSavedAssessments] = useState<any[]>([]);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number, total: number }>({ current: 0, total: 0 });
  const [syncErrors, setSyncErrors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Persistence & Auth
  useEffect(() => {
    // Initial fetch of session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        fetchSavedAssessments(u.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        fetchSavedAssessments(u.id);
      } else {
        setSavedAssessments([]);
      }
    });

    // Load Persistence from IndexedDB
    const loadPersistence = async () => {
      // Load Draft
      try {
        const savedDraft = await dbService.getDraft();
        if (savedDraft) {
          setFormData({ ...INITIAL_FORM_DATA, ...savedDraft });
        }
      } catch (e) {
        console.error('Failed to load draft from IndexedDB', e);
      }

      // Load Pending Syncs
      try {
        const savedPending = await dbService.getAllPendingSyncs();
        setPendingSyncs(savedPending);
      } catch (e) {
        console.error('Failed to load pending syncs from IndexedDB', e);
      }
    };

    loadPersistence();

    const handleOnline = () => {
      setIsOffline(false);
      // Auto-trigger sync when coming back online
      if (user) {
        processPendingSyncs(user.id);
      }
    };
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check for pending syncs
    if (!isOffline && user) {
      processPendingSyncs(user.id);
    }

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Separate effect for auto-sync when user/offline status changes
  useEffect(() => {
    if (!isOffline && user) {
      processPendingSyncs(user.id);
    }
  }, [isOffline, user]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      await dbService.saveDraft(formData);
      setLastSaved(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData]);

  const processPendingSyncs = async (uid: string) => {
    const pending = await dbService.getAllPendingSyncs();
    if (!pending || pending.length === 0 || isAutoSyncing) return;
    
    setIsAutoSyncing(true);
    setSyncProgress({ current: 0, total: pending.length });
    setSyncErrors([]);
    
    console.log(`Starting auto-sync for ${pending.length} items from IndexedDB...`);

    const currentPendingSyncs = [...pending];

    for (let i = 0; i < pending.length; i++) {
      const item = pending[i];
      try {
        const assessment = item.data;
        const assessmentId = assessment.schoolName ? assessment.schoolName.replace(/\s+/g, '_').toLowerCase() : `assessment_${Date.now()}`;
        
        const { error } = await supabase
          .from('assessments')
          .upsert({
            id: assessmentId,
            ...assessment,
            userId: uid,
            updatedAt: new Date().toISOString(),
            status: 'submitted'
          });
        
        if (error) throw error;
        
        // Remove from IndexedDB
        if (item.id !== undefined) {
          await dbService.removePendingSync(item.id);
          
          // Update React state
          const idx = currentPendingSyncs.findIndex(p => p.id === item.id);
          if (idx !== -1) currentPendingSyncs.splice(idx, 1);
          setPendingSyncs([...currentPendingSyncs]);
        }
        
        setSyncProgress(prev => ({ ...prev, current: i + 1 }));
      } catch (e: any) {
        console.error(`Failed to sync:`, e);
        setSyncErrors(prev => [...prev, {
          id: item.id,
          assessmentName: item.data.schoolName || 'Unnamed',
          message: e.message || 'Unknown error',
          timestamp: new Date().toISOString()
        }]);
      }
    }

    setIsAutoSyncing(false);
    fetchSavedAssessments(uid);
  };

  const handleSync = async () => {
    if (isOffline) {
      // Add to pending queue in IndexedDB
      try {
        await dbService.addPendingSync(formData);
        const updatedPending = await dbService.getAllPendingSyncs();
        setPendingSyncs(updatedPending);
        
        if (confirm('Offline: Assessment saved to local queue. It will sync automatically when you are back online. Would you like to clear the form to start a new assessment?')) {
          setFormData(INITIAL_FORM_DATA);
          setActiveSection(0);
          await dbService.clearDraft();
        }
      } catch (e) {
        console.error('Failed to save to IndexedDB:', e);
        alert('Failed to save assessment offline.');
      }
      return;
    }

    if (!user) {
      try {
        await signIn();
      } catch (e) {
        setSyncError('Failed to sign in');
        return;
      }
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const assessmentId = formData.schoolName ? formData.schoolName.replace(/\s+/g, '_').toLowerCase() : `assessment_${Date.now()}`;
      
      const { error } = await supabase
        .from('assessments')
        .upsert({
          id: assessmentId,
          ...formData,
          userId: user?.id,
          updatedAt: new Date().toISOString(),
          status: 'submitted'
        });
        
      if (error) throw error;
      
      if (confirm('Data successfully synced to cloud! Would you like to clear the form and start a new assessment?')) {
        setFormData(INITIAL_FORM_DATA);
        setActiveSection(0);
        await dbService.clearDraft();
      }
      if (user) fetchSavedAssessments(user.id);
    } catch (e: any) {
      console.error('Sync error:', e);
      setSyncError(e.message || 'Failed to sync data');
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchSavedAssessments = async (uid: string) => {
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('userId', uid)
        .order('updatedAt', { ascending: false });

      if (error) throw error;
      setSavedAssessments(data || []);
    } catch (e) {
      console.error('Error fetching history:', e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadAssessment = (assessment: any) => {
    if (confirm('Load this assessment? Current unsaved changes will be overwritten.')) {
      setFormData(assessment);
      setIsHistoryOpen(false);
      setView('form');
      setActiveSection(0);
    }
  };

  const handleSelectSchoolFromMap = (selection: { type: 'assessment' | 'school', data: any }) => {
    if (selection.type === 'assessment') {
      loadAssessment(selection.data);
    } else {
      if (confirm(`Start new assessment for ${selection.data.data ? selection.data.data.name : selection.data.name}?`)) {
        const school = selection.data;
        setFormData({
          ...INITIAL_FORM_DATA,
          schoolName: school.name,
          wardCommunity: school.ward,
          educationProvider: school.ep,
          learningCentreType: school.type,
          siemisRegistration: school.siemis || ''
        });
        setView('form');
        setActiveSection(0);
      }
    }
  };

  const updateField = (path: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const sections = [
    { id: 0, label: '1. Disaster & Location', icon: ClipboardCheck },
    { id: 1, label: '2. Enrolment & Staffing', icon: Users },
    { id: 2, label: '3. Operational Status', icon: Activity },
    { id: 3, label: '4. Infrastructure Damage', icon: Building2 },
    { id: 4, label: '5. Teaching & Learning', icon: GraduationCap },
    { id: 5, label: '6. Impact on Students', icon: UserRound },
    { id: 6, label: '7. Teachers & Personnel', icon: Users },
    { id: 7, label: '8. Priority Needs', icon: AlertTriangle },
    { id: 8, label: '9. Resource Requirements', icon: FileText },
    { id: 9, label: '10-12. Finalize', icon: CheckCircle2 },
  ];

  const getSectionCompletion = (id: number) => {
    switch (id) {
      case 0: return !!(formData.schoolName && formData.wardCommunity && formData.gpsLocation);
      case 1: return formData.enrolment && Object.values(formData.enrolment).some((e: any) => e?.total?.m > 0 || e?.total?.f > 0);
      case 2: return !!formData.operationalStatus;
      case 3: return formData.overallDamageLevel > 0;
      case 4: return !!formData.impactDescription;
      case 5: return (formData.studentsAffected || 0) > 0;
      case 6: return (formData.teachersAffected || 0) > 0;
      case 7: return (formData.priorityNeedsImmediate?.length || 0) > 0 || (formData.priorityNeedsShortTerm?.length || 0) > 0;
      case 8: return formData.resourceRequirements?.some(r => r.quantity !== '');
      case 9: return !!(formData.assessor?.name && formData.interviewee?.name);
      default: return false;
    }
  };

  const completedSectionsCount = sections.filter(s => getSectionCompletion(s.id)).length;
  const progressPercentage = (completedSectionsCount / sections.length) * 100;

  const filteredAssessments = savedAssessments.filter(a => {
    const q = searchQuery.toLowerCase();
    return (
      a.schoolName?.toLowerCase().includes(q) ||
      a.hazardType?.toLowerCase().includes(q) ||
      a.assessmentDate?.toLowerCase().includes(q)
    );
  });

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `DSA_${formData.schoolName || 'Assessment'}_${formData.assessmentDate}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      setFormData(INITIAL_FORM_DATA);
      await dbService.clearDraft();
      setActiveSection(0);
    }
  };

  const handleSaveDraft = async () => {
    await dbService.saveDraft(formData);
    setLastSaved(new Date().toLocaleTimeString());
    alert('Draft saved to local storage!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out lg:relative ${
          isSidebarOpen ? 'w-72 translate-x-0 opacity-100' : 'w-0 -translate-x-full lg:translate-x-0 lg:opacity-0'
        } overflow-hidden shrink-0`}
      >
        <div className="h-full flex flex-col w-72">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-10 overflow-hidden rounded-full flex items-center justify-center shadow-lg">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Flag_of_Western_Province_%28Solomon_Islands%29.svg/640px-Flag_of_Western_Province_%28Solomon_Islands%29.svg.png" 
                  alt="WPEP Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight uppercase">Western Province Education Provider (WPEP)</h1>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Solomon Islands</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-4">DETAILED SECTOR ASSESSMENT</p>
            
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Form Completion</span>
                <span className="text-[10px] font-bold text-blue-600">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  className="h-full bg-blue-600 rounded-full"
                />
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            <button
              onClick={() => {
                setView('map');
                setIsHistoryOpen(false);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-2 ${
                view === 'map' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${view === 'map' ? 'bg-blue-500' : 'bg-slate-200'}`}>
                <MapPin size={18} />
              </div>
              <span className="text-sm font-bold text-left flex-1">School Directory Map</span>
            </button>

            <button
              onClick={() => {
                setView('analysis');
                setIsHistoryOpen(false);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-2 ${
                view === 'analysis' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${view === 'analysis' ? 'bg-indigo-500' : 'bg-slate-200'}`}>
                <LayoutDashboard size={18} />
              </div>
              <span className="text-sm font-bold text-left flex-1">Analysis Dashboard</span>
            </button>

            <button
              onClick={() => {
                setIsHistoryOpen(!isHistoryOpen);
                if (!isHistoryOpen) setView('form');
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-4 ${
                isHistoryOpen 
                  ? 'bg-slate-800 text-white shadow-lg' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${isHistoryOpen ? 'bg-slate-700' : 'bg-slate-300'}`}>
                <History size={18} />
              </div>
              <span className="text-sm font-bold text-left flex-1">Saved History</span>
              <div className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {savedAssessments.length}
              </div>
            </button>

            {!isHistoryOpen && sections.map((section) => (
              <SidebarItem
                key={section.id}
                icon={section.icon}
                label={section.label}
                active={activeSection === section.id}
                completed={getSectionCompletion(section.id)}
                onClick={() => {
                  setView('form');
                  setActiveSection(section.id);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
              />
            ))}

            {isHistoryOpen && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="text"
                    placeholder="Search history..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                
                <div className="space-y-2">
                  {isLoadingHistory ? (
                    <div className="flex justify-center py-4">
                      <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                  ) : filteredAssessments.length > 0 ? (
                    filteredAssessments.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => loadAssessment(a)}
                        className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                      >
                        <div className="font-bold text-xs text-slate-800 truncate mb-1 group-hover:text-blue-700">{a.schoolName || 'Unnamed School'}</div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                          <Clock size={10} />
                          {a.assessmentDate}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-1 italic">{a.hazardType}</div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-xs italic">
                      No assessments found
                    </div>
                  )}
                </div>
              </div>
            )}
          </nav>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="mb-4 space-y-2">
              {user ? (
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <img src={user.photoURL || ''} alt="" className="w-6 h-6 rounded-full border border-slate-200" referrerPolicy="no-referrer" />
                    <span className="text-[10px] font-bold text-slate-700 truncate max-w-[100px]">{user.displayName}</span>
                  </div>
                  <button onClick={logOut} className="text-slate-400 hover:text-red-500 transition-colors">
                    <LogOut size={14} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={signIn}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                  <LogIn size={14} />
                  Sign In to Sync
                </button>
              )}

              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  isSyncing 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : isOffline
                      ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'
                }`}
              >
                {isSyncing ? (
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                ) : (
                  isOffline ? <History size={14} /> : <CloudUpload size={14} />
                )}
                {isSyncing ? 'Syncing...' : isOffline ? 'Save to Queue' : 'Sync to Cloud'}
              </button>
              {pendingSyncs.length > 0 && (
                <div className="mt-4">
                  <div className={`p-4 rounded-xl border transition-all ${
                    syncErrors.length > 0 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-blue-50 border-blue-200 shadow-sm'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {isAutoSyncing ? (
                          <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                        ) : (
                          <Clock className={syncErrors.length > 0 ? "text-red-500" : "text-blue-500"} size={18} />
                        )}
                        <span className="text-xs font-bold uppercase tracking-tight text-slate-700">
                          {isAutoSyncing ? `Syncing Assess. (${syncProgress.current}/${syncProgress.total})` : 'Pending Offline Sync'}
                        </span>
                      </div>
                      {!isAutoSyncing && (
                        <button 
                          onClick={() => processPendingSyncs(user?.id || '')}
                          className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all flex items-center gap-1"
                        >
                          <RefreshCw size={10} />
                          Retry
                        </button>
                      )}
                    </div>

                    {isAutoSyncing && (
                      <div className="w-full h-1.5 bg-blue-200 rounded-full overflow-hidden mb-1">
                        <motion.div 
                          className="h-full bg-blue-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
                        />
                      </div>
                    )}

                    {syncErrors.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-red-600 uppercase">Sync Issues ({syncErrors.length})</span>
                        </div>
                        <div className="max-h-24 overflow-y-auto pr-1 thin-scrollbar">
                          {syncErrors.map((err, i) => (
                            <div key={i} className="text-[10px] text-red-700 bg-white/50 p-2 rounded-lg border border-red-100 mb-1 leading-tight">
                              <div className="font-bold">{err.assessmentName}</div>
                              <div className="opacity-80">{err.message}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!isAutoSyncing && syncErrors.length === 0 && (
                      <p className="text-[10px] text-slate-500 italic">
                        {pendingSyncs.length} item{pendingSyncs.length !== 1 ? 's' : ''} waiting to auto-sync.
                      </p>
                    )}
                  </div>
                </div>
              )}
              {syncError && <p className="text-[9px] text-red-500 font-bold px-2">{syncError}</p>}
            </div>

            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                {isOffline ? (
                  <div className="flex items-center gap-1.5 text-amber-600">
                    <WifiOff size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Offline Mode</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-green-600">
                    <Wifi size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Online</span>
                  </div>
                )}
              </div>
              {lastSaved && (
                <span className="text-[10px] text-slate-400 font-medium">Saved {lastSaved}</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleExport}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Download size={14} />
                Export
              </button>
              <button 
                onClick={handleReset}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-white border border-red-100 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} />
                Reset
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              title={isSidebarOpen ? "Collapse Menu" : "Expand Menu"}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="font-semibold text-slate-800 truncate">
              {view === 'analysis' ? 'Analytics Dashboard' : view === 'map' ? 'School Directory Map' : sections[activeSection].label}
            </h2>
          </div>
          {view === 'form' && (
            <div className="flex items-center gap-3">
              <button 
                onClick={handleSaveDraft}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              >
                <Save size={16} className="text-slate-400" />
                Save Draft
              </button>
              <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />
              <button 
                onClick={() => setActiveSection(prev => Math.max(0, prev - 1))}
                disabled={activeSection === 0}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30"
              >
                Previous
              </button>
              <button 
                onClick={() => setActiveSection(prev => Math.min(sections.length - 1, prev + 1))}
                disabled={activeSection === sections.length - 1}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-md shadow-blue-100 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {view === 'analysis' ? (
              <AnalysisDashboard assessments={savedAssessments} />
            ) : view === 'map' ? (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 italic">Western Province Education Map</h2>
                      <p className="text-sm text-slate-500">Interactive directory of schools across wards and islands.</p>
                    </div>
                    <div className="flex gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-slate-600 font-medium font-mono uppercase">School Location</span>
                      </div>
                    </div>
                  </div>
                  <SchoolMap assessments={savedAssessments} onSelectSchool={handleSelectSchoolFromMap} />
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Schools</p>
                      <p className="text-lg font-bold text-slate-700">{SCHOOL_DIRECTORY.length}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Assessments Synced</p>
                      <p className="text-lg font-bold text-blue-600">{savedAssessments.length}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Coverage</p>
                      <p className="text-lg font-bold text-green-600">{Math.round((savedAssessments.length / SCHOOL_DIRECTORY.length) * 100)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  {activeSection === 0 && <Section1 data={formData} update={updateField} />}
                  {activeSection === 1 && <Section2 data={formData} update={updateField} />}
                  {activeSection === 2 && <Section3 data={formData} update={updateField} />}
                  {activeSection === 3 && <Section4 data={formData} update={updateField} user={user} />}
                  {activeSection === 4 && <Section5 data={formData} update={updateField} />}
                  {activeSection === 5 && <Section6 data={formData} update={updateField} />}
                  {activeSection === 6 && <Section7 data={formData} update={updateField} />}
                  {activeSection === 7 && <Section8 data={formData} update={updateField} />}
                  {activeSection === 8 && <Section9 data={formData} update={updateField} />}
                  {activeSection === 9 && <SectionFinal data={formData} update={updateField} onSync={handleSync} isSyncing={isSyncing} isOffline={isOffline} user={user} />}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Section Components ---

const InputGroup = ({ label, children, required }: any) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const TextInput = ({ value, onChange, placeholder, type = "text", disabled = false }: any) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    disabled={disabled}
    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none disabled:bg-slate-100 disabled:text-slate-400"
  />
);

const SelectInput = ({ value, onChange, options }: any) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
  >
    <option value="">Select Option</option>
    {options.map((opt: any) => (
      <option key={opt} value={opt}>{opt}</option>
    ))}
  </select>
);

const Section1 = ({ data, update }: any) => {
  const [isLocating, setIsLocating] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        update('gpsLocation', `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert(`Error getting location: ${error.message}`);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputGroup label="Hazard Type" required>
          <TextInput value={data.hazardType} onChange={(v: any) => update('hazardType', v)} disabled />
        </InputGroup>
        <InputGroup label="Date(s) of Impact">
          <TextInput value={data.impactDates} onChange={(v: any) => update('impactDates', v)} placeholder="e.g. 12-14 April 2026" />
        </InputGroup>
        <InputGroup label="Province" required>
          <TextInput value={data.province} onChange={(v: any) => update('province', v)} disabled />
        </InputGroup>
        <InputGroup label="Ward / Community">
          <TextInput value={data.wardCommunity} onChange={(v: any) => update('wardCommunity', v)} placeholder="Enter ward or community" />
        </InputGroup>
        <InputGroup label="Date of Assessment">
          <TextInput type="date" value={data.assessmentDate} onChange={(v: any) => update('assessmentDate', v)} />
        </InputGroup>
      </div>

      <div className="pt-8 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Building2 size={18} className="text-blue-600" />
          1.2 School Identification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup label="School Name" required>
            <select
              value={data.schoolName}
              onChange={(e) => {
                const name = e.target.value;
                update('schoolName', name);
                const school = SCHOOL_DIRECTORY.find(s => s.name === name);
                if (school) {
                  update('wardCommunity', school.ward);
                  update('educationProvider', school.ep);
                  update('learningCentreType', school.type);
                  update('siemisRegistration', school.siemis || '');
                }
              }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            >
              <option value="">Select a school...</option>
              {SCHOOL_DIRECTORY.map((school, idx) => (
                <option key={`${school.name}-${idx}`} value={school.name}>{school.name}</option>
              ))}
            </select>
          </InputGroup>
          <InputGroup label="SIEMIS Registration">
            <TextInput value={data.siemisRegistration} onChange={(v: any) => update('siemisRegistration', v)} placeholder="Registration number" />
          </InputGroup>
          <InputGroup label="GPS Location">
            <div className="relative">
              <TextInput value={data.gpsLocation} onChange={(v: any) => update('gpsLocation', v)} placeholder="Latitude, Longitude" />
              <button
                onClick={handleGetLocation}
                disabled={isLocating}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                title="Get Current Location"
              >
                {isLocating ? (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Locate size={16} />
                )}
              </button>
            </div>
          </InputGroup>
          <InputGroup label="Location Type">
            <SelectInput 
              value={data.locationType} 
              onChange={(v: any) => update('locationType', v)} 
              options={['Urban', 'Semi urban', 'Rural', 'Remote']} 
            />
          </InputGroup>
          <InputGroup label="Type of Learning Centre">
            <SelectInput 
              value={data.learningCentreType} 
              onChange={(v: any) => update('learningCentreType', v)} 
              options={['ECE', 'Primary', 'CHS', 'PSS', 'NSS', 'SS', 'TVET']} 
            />
          </InputGroup>
          <InputGroup label="Education Provider (EP)">
            <TextInput value={data.educationProvider} onChange={(v: any) => update('educationProvider', v)} placeholder="e.g. Government, Church" />
          </InputGroup>
          <InputGroup label="Accessibility">
            <TextInput value={data.accessibility} onChange={(v: any) => update('accessibility', v)} placeholder="Road/Sea/Inland/Boat/Walk" />
          </InputGroup>
        </div>
      </div>
    </div>
  );
};

const Section2 = ({ data, update }: any) => {
  const enrolmentLevels = Object.keys(data.enrolment);
  const ageRanges = ['3-4', '5', '6-11', '12-18', '19+'];

  const handleEnrolmentChange = (level: string, age: string, sex: 'm' | 'f', val: string) => {
    const num = parseInt(val) || 0;
    const current = { ...data.enrolment[level] };
    current[age][sex] = num;
    
    // Recalculate total for this level
    let totalM = 0;
    let totalF = 0;
    ageRanges.forEach(a => {
      totalM += current[a].m;
      totalF += current[a].f;
    });
    current.total = { m: totalM, f: totalF };
    
    update(`enrolment.${level}`, current);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-4">Student Enrolment</h3>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 border-b border-slate-200">Year Level</th>
                {ageRanges.map(age => (
                  <th key={age} colSpan={2} className="px-4 py-3 border-b border-l border-slate-200 text-center">{age} yrs</th>
                ))}
                <th colSpan={2} className="px-4 py-3 border-b border-l border-slate-200 text-center bg-blue-50 text-blue-600">Total</th>
              </tr>
              <tr>
                <th className="px-4 py-2 border-b border-slate-200"></th>
                {ageRanges.concat(['total']).map((_, i) => (
                  <React.Fragment key={i}>
                    <th className="px-2 py-2 border-b border-l border-slate-200 text-center">M</th>
                    <th className="px-2 py-2 border-b border-slate-200 text-center">F</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {enrolmentLevels.map(level => (
                <tr key={level} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2 font-semibold text-slate-700 border-b border-slate-200">{level}</td>
                  {ageRanges.map(age => (
                    <React.Fragment key={age}>
                      <td className="px-1 py-1 border-b border-l border-slate-200">
                        <input 
                          type="number" 
                          value={data.enrolment[level][age].m || ''} 
                          onChange={(e) => handleEnrolmentChange(level, age, 'm', e.target.value)}
                          className="w-full text-center bg-transparent outline-none focus:bg-white"
                        />
                      </td>
                      <td className="px-1 py-1 border-b border-slate-200">
                        <input 
                          type="number" 
                          value={data.enrolment[level][age].f || ''} 
                          onChange={(e) => handleEnrolmentChange(level, age, 'f', e.target.value)}
                          className="w-full text-center bg-transparent outline-none focus:bg-white"
                        />
                      </td>
                    </React.Fragment>
                  ))}
                  <td className="px-2 py-2 border-b border-l border-slate-200 text-center font-bold bg-blue-50/30">{data.enrolment[level].total.m}</td>
                  <td className="px-2 py-2 border-b border-slate-200 text-center font-bold bg-blue-50/30">{data.enrolment[level].total.f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Teachers and Other Staff</h3>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 border-b border-slate-200">Staff Type</th>
                {['19-29', '30-39', '40-49', '50-59', '60+'].map(age => (
                  <th key={age} colSpan={2} className="px-4 py-3 border-b border-l border-slate-200 text-center">{age} yrs</th>
                ))}
                <th colSpan={2} className="px-4 py-3 border-b border-l border-slate-200 text-center bg-blue-50 text-blue-600">Total</th>
              </tr>
              <tr>
                <th className="px-4 py-2 border-b border-slate-200"></th>
                {['19-29', '30-39', '40-49', '50-59', '60+', 'total'].map((_, i) => (
                  <React.Fragment key={i}>
                    <th className="px-2 py-2 border-b border-l border-slate-200 text-center">M</th>
                    <th className="px-2 py-2 border-b border-slate-200 text-center">F</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {['teachers', 'otherStaff'].map(type => (
                <tr key={type} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2 font-semibold text-slate-700 border-b border-slate-200 uppercase text-xs">{type === 'teachers' ? 'Teachers' : 'Other Staff'}</td>
                  {['19-29', '30-39', '40-49', '50-59', '60+'].map(age => (
                    <React.Fragment key={age}>
                      <td className="px-1 py-1 border-b border-l border-slate-200">
                        <input 
                          type="number" 
                          value={data.staff[type][age].m || ''} 
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            const current = { ...data.staff[type] };
                            current[age].m = val;
                            // Recalculate total
                            let tm = 0; let tf = 0;
                            ['19-29', '30-39', '40-49', '50-59', '60+'].forEach(a => { tm += current[a].m; tf += current[a].f; });
                            current.total = { m: tm, f: tf };
                            update(`staff.${type}`, current);
                          }}
                          className="w-full text-center bg-transparent outline-none focus:bg-white"
                        />
                      </td>
                      <td className="px-1 py-1 border-b border-slate-200">
                        <input 
                          type="number" 
                          value={data.staff[type][age].f || ''} 
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            const current = { ...data.staff[type] };
                            current[age].f = val;
                            // Recalculate total
                            let tm = 0; let tf = 0;
                            ['19-29', '30-39', '40-49', '50-59', '60+'].forEach(a => { tm += current[a].m; tf += current[a].f; });
                            current.total = { m: tm, f: tf };
                            update(`staff.${type}`, current);
                          }}
                          className="w-full text-center bg-transparent outline-none focus:bg-white"
                        />
                      </td>
                    </React.Fragment>
                  ))}
                  <td className="px-2 py-2 border-b border-l border-slate-200 text-center font-bold bg-blue-50/30">{data.staff[type].total.m}</td>
                  <td className="px-2 py-2 border-b border-slate-200 text-center font-bold bg-blue-50/30">{data.staff[type].total.f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Section3 = ({ data, update }: any) => (
  <div className="p-8 space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputGroup label="Current Status">
        <SelectInput 
          value={data.operationalStatus} 
          onChange={(v: any) => update('operationalStatus', v)} 
          options={['Operational', 'Partially Operational', 'Not Operational']} 
        />
      </InputGroup>
      <InputGroup label="Date of Closure (if applicable)">
        <TextInput type="date" value={data.closureDate} onChange={(v: any) => update('closureDate', v)} />
      </InputGroup>
      <InputGroup label="Reason for Closure">
        <TextInput value={data.closureReason} onChange={(v: any) => update('closureReason', v)} placeholder="e.g. Flooding, Structural damage" />
      </InputGroup>
      <InputGroup label="Anticipated Date of Reopening">
        <TextInput type="date" value={data.reopeningDate} onChange={(v: any) => update('reopeningDate', v)} />
      </InputGroup>
    </div>

    <div className="pt-8 border-t border-slate-100">
      <h3 className="text-sm font-bold text-slate-800 mb-4">Interim Learning Arrangements</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          'Normal timetable',
          'Double shift',
          'Community-Based temporary learning spaces',
          'Temporary Learning Spaces required',
          'Students temporarily relocated',
          'Remote/Home-Based learning',
          'Teaching and learning suspended'
        ].map(opt => (
          <label key={opt} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input 
              type="checkbox" 
              checked={data.interimArrangements.includes(opt)}
              onChange={(e) => {
                const current = [...data.interimArrangements];
                if (e.target.checked) current.push(opt);
                else {
                  const idx = current.indexOf(opt);
                  if (idx > -1) current.splice(idx, 1);
                }
                update('interimArrangements', current);
              }}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-slate-700">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  </div>
);

const FacilityRow = ({ fac, data, update, damageTypes, user }: any) => {
  const facilityData = data.facilityDamage[fac];
  const [facUploading, setFacUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  const handleFacPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setFacUploading(true);
    setUploadProgress(0);
    setUploadStatus({ type: null, message: '' });

    try {
      const fileName = `${fac}_${Date.now()}_${file.name}`;
      const filePath = `assessments/${user.id}/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('assessments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('assessments')
        .getPublicUrl(filePath);

      const newPhoto = {
        url: publicUrl,
        name: file.name,
        timestamp: new Date().toISOString()
      };

      const current = { ...data.facilityDamage[fac] };
      current.photos = [...(current.photos || []), newPhoto];
      update(`facilityDamage.${fac}`, current);
      
      setUploadStatus({ type: 'success', message: 'Photo added!' });
      setFacUploading(false);
      setUploadProgress(100);
      
      // Clear success message after 3 seconds
      setTimeout(() => setUploadStatus({ type: null, message: '' }), 3000);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus({ type: 'error', message: error.message || 'Something went wrong.' });
      setFacUploading(false);
    }
  };

  const removeFacPhoto = (pIdx: number) => {
    const current = { ...data.facilityDamage[fac] };
    const newPhotos = [...(current.photos || [])];
    newPhotos.splice(pIdx, 1);
    current.photos = newPhotos;
    update(`facilityDamage.${fac}`, current);
  };

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-2 font-semibold text-slate-700 border-b border-slate-200">{fac}</td>
      {damageTypes.map((dt: any) => (
        <td key={dt.key} className="px-1 py-1 border-b border-l border-slate-200">
          <input 
            type="number" 
            value={data.facilityDamage[fac][dt.key] || ''} 
            onChange={(e) => {
              const current = { ...data.facilityDamage[fac] };
              current[dt.key] = parseInt(e.target.value) || 0;
              update(`facilityDamage.${fac}`, current);
            }}
            className="w-full text-center bg-transparent outline-none focus:bg-white"
          />
        </td>
      ))}
      <td className="px-2 py-2 border-b border-l border-slate-200">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-1">
            {(facilityData.photos || []).map((photo: any, pIdx: number) => (
              <div key={pIdx} className="relative w-8 h-8 rounded-md overflow-hidden border border-slate-200 group">
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
                <button 
                  onClick={() => removeFacPhoto(pIdx)}
                  className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  title="Remove photo"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="relative">
            <label className={`flex items-center justify-center gap-1.5 py-1 px-2 border border-slate-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              facUploading 
                ? 'bg-slate-50 text-slate-400 cursor-not-allowed' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}>
              {facUploading ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 border border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                  <span>{uploadProgress}%</span>
                </div>
              ) : (
                <>
                  <CloudUpload size={12} className="text-blue-500" />
                  <span>Add Photo</span>
                </>
              )}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFacPhotoUpload} 
                disabled={facUploading}
              />
            </label>

            {uploadStatus.type && (
              <div className={`mt-1 text-[9px] font-bold text-center animate-in fade-in slide-in-from-top-1 ${
                uploadStatus.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {uploadStatus.message}
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

const Section4 = ({ data, update, user }: any) => {
  const facilities = Object.keys(data.facilityDamage);
  const damageTypes = [
    { key: 'noDamage', label: 'No Damage' },
    { key: 'minor', label: 'Minor' },
    { key: 'moderate', label: 'Moderate' },
    { key: 'significant', label: 'Significant' },
    { key: 'completelyDestroyed', label: 'Destroyed' }
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
        <h3 className="text-amber-800 font-bold text-sm mb-4 flex items-center gap-2">
          <AlertTriangle size={18} />
          4.1 Overall Damage Classification
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4].map(level => (
            <button
              key={level}
              onClick={() => update('overallDamageLevel', level)}
              className={`p-4 rounded-xl border text-left transition-all ${
                data.overallDamageLevel === level 
                  ? 'bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-100' 
                  : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-100/50'
              }`}
            >
              <div className="text-xs font-bold opacity-70 mb-1">Level {level}</div>
              <div className="text-sm font-bold">
                {level === 0 && 'No Significant Damage'}
                {level === 1 && 'Minor Damage'}
                {level === 2 && 'Moderate Damage'}
                {level === 3 && 'Significant Damage'}
                {level === 4 && 'Completely Destroyed'}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-4">4.2 Damage by Facility</h3>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 border-b border-slate-200">Facility</th>
                {damageTypes.map(dt => (
                  <th key={dt.key} className="px-4 py-3 border-b border-l border-slate-200 text-center">{dt.label}</th>
                ))}
                <th className="px-4 py-3 border-b border-l border-slate-200 text-center w-40">Documentation</th>
              </tr>
            </thead>
            <tbody>
              {facilities.map(fac => (
                <FacilityRow key={fac} fac={fac} data={data} update={update} damageTypes={damageTypes} user={user} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputGroup label="Are damaged structures safe for use?">
          <SelectInput 
            value={data.safeForUse} 
            onChange={(v: any) => update('safeForUse', v)} 
            options={['Yes', 'No', 'Pending Assessment']} 
          />
        </InputGroup>
        <InputGroup label="Has the site been cordoned or restricted?">
          <SelectInput 
            value={data.cordonedOff} 
            onChange={(v: any) => update('cordonedOff', v)} 
            options={['Yes', 'No']} 
          />
        </InputGroup>
        <div className="md:col-span-2">
          <InputGroup label="Immediate risks identified (brief description)">
            <textarea 
              value={data.immediateRisks}
              onChange={(e) => update('immediateRisks', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24"
              placeholder="Describe any immediate dangers..."
            />
          </InputGroup>
        </div>
      </div>
    </div>
  );
};

const Section5 = ({ data, update }: any) => (
  <div className="p-8 space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputGroup label="Number of classrooms unusable">
        <TextInput type="number" value={data.unusableClassrooms} onChange={(v: any) => update('unusableClassrooms', parseInt(v) || 0)} />
      </InputGroup>
      <InputGroup label="Number of instructional days disrupted">
        <TextInput type="number" value={data.disruptedDays} onChange={(v: any) => update('disruptedDays', parseInt(v) || 0)} />
      </InputGroup>
      <InputGroup label="Exams/assessments affected?">
        <SelectInput value={data.examsAffected} onChange={(v: any) => update('examsAffected', v)} options={['Yes', 'No']} />
      </InputGroup>
      <InputGroup label="Teaching and learning materials affected?">
        <SelectInput value={data.materialsAffected} onChange={(v: any) => update('materialsAffected', v)} options={['Yes', 'No']} />
      </InputGroup>
    </div>

    {data.materialsAffected === 'Yes' && (
      <div className="pt-8 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Indicate Losses</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {['Textbooks', 'Teacher guides', 'Furniture', 'ICT', 'Examination materials'].map(opt => (
            <label key={opt} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                checked={data.materialLosses.includes(opt)}
                onChange={(e) => {
                  const current = [...data.materialLosses];
                  if (e.target.checked) current.push(opt);
                  else {
                    const idx = current.indexOf(opt);
                    if (idx > -1) current.splice(idx, 1);
                  }
                  update('materialLosses', current);
                }}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-slate-700">{opt}</span>
            </label>
          ))}
        </div>
      </div>
    )}

    <div className="pt-8 border-t border-slate-100">
      <InputGroup label="Brief description (By year levels and Subject)">
        <textarea 
          value={data.impactDescription}
          onChange={(e) => update('impactDescription', e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none h-32"
          placeholder="Detail the impact on specific subjects and levels..."
        />
      </InputGroup>
    </div>
  </div>
);

const Section6 = ({ data, update }: any) => (
  <div className="p-8 space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputGroup label="Total number of students affected">
        <TextInput type="number" value={data.studentsAffected} onChange={(v: any) => update('studentsAffected', parseInt(v) || 0)} />
      </InputGroup>
      <InputGroup label="Number of displaced students">
        <TextInput type="number" value={data.displacedStudents} onChange={(v: any) => update('displacedStudents', parseInt(v) || 0)} />
      </InputGroup>
      <InputGroup label="Students with disabilities disproportionately affected?">
        <SelectInput value={data.disabilitiesAffected} onChange={(v: any) => update('disabilitiesAffected', v)} options={['Yes', 'No']} />
      </InputGroup>
      <InputGroup label="Boarding students affected?">
        <SelectInput value={data.boardingAffected} onChange={(v: any) => update('boardingAffected', v)} options={['Yes', 'No']} />
      </InputGroup>
    </div>

    <div className="pt-8 border-t border-slate-100">
      <h3 className="text-sm font-bold text-slate-800 mb-4">Observed Risks</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {['Learning disruption', 'Psychosocial distress', 'Protection concerns', 'Health/WASH risks'].map(opt => (
          <label key={opt} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input 
              type="checkbox" 
              checked={data.observedRisks.includes(opt)}
              onChange={(e) => {
                const current = [...data.observedRisks];
                if (e.target.checked) current.push(opt);
                else {
                  const idx = current.indexOf(opt);
                  if (idx > -1) current.splice(idx, 1);
                }
                update('observedRisks', current);
              }}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-slate-700">{opt}</span>
          </label>
        ))}
      </div>
    </div>

    {data.disabilitiesAffected === 'Yes' && (
      <div className="pt-8 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Students with Disability</h3>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 border-b border-slate-200">Type of Disability</th>
                {['3-4', '5', '6-11', '12-18', '19+'].map(age => (
                  <th key={age} colSpan={2} className="px-4 py-3 border-b border-l border-slate-200 text-center">{age} yrs</th>
                ))}
              </tr>
              <tr>
                <th className="px-4 py-2 border-b border-slate-200"></th>
                {['3-4', '5', '6-11', '12-18', '19+'].map((_, i) => (
                  <React.Fragment key={i}>
                    <th className="px-2 py-2 border-b border-l border-slate-200 text-center">M</th>
                    <th className="px-2 py-2 border-b border-slate-200 text-center">F</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {['Visual', 'Hearing', 'Physical', 'Intellectual', 'Other'].map(type => (
                <tr key={type} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2 font-semibold text-slate-700 border-b border-slate-200">{type}</td>
                  {['3-4', '5', '6-11', '12-18', '19+'].map(age => (
                    <React.Fragment key={age}>
                      <td className="px-1 py-1 border-b border-l border-slate-200">
                        <input type="number" className="w-full text-center bg-transparent outline-none focus:bg-white" />
                      </td>
                      <td className="px-1 py-1 border-b border-slate-200">
                        <input type="number" className="w-full text-center bg-transparent outline-none focus:bg-white" />
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    <div className="pt-8 border-t border-slate-100">
      <InputGroup label="Comments (if any)">
        <textarea 
          value={data.studentComments}
          onChange={(e) => update('studentComments', e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24"
          placeholder="Additional notes on student impact..."
        />
      </InputGroup>
    </div>
  </div>
);

const Section7 = ({ data, update }: any) => (
  <div className="p-8 space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputGroup label="Number of teachers affected">
        <TextInput type="number" value={data.teachersAffected} onChange={(v: any) => update('teachersAffected', parseInt(v) || 0)} />
      </InputGroup>
      <InputGroup label="Teacher accommodation damaged?">
        <SelectInput value={data.teacherAccommodationDamaged} onChange={(v: any) => update('teacherAccommodationDamaged', v)} options={['Yes', 'No']} />
      </InputGroup>
      <InputGroup label="Teachers displaced?">
        <SelectInput value={data.teachersDisplaced} onChange={(v: any) => update('teachersDisplaced', v)} options={['Yes', 'No']} />
      </InputGroup>
      <div className="flex gap-4">
        <div className="flex-1">
          <InputGroup label="Substitute teachers required?">
            <SelectInput value={data.substituteRequired} onChange={(v: any) => update('substituteRequired', v)} options={['Yes', 'No']} />
          </InputGroup>
        </div>
        {data.substituteRequired === 'Yes' && (
          <div className="w-32">
            <InputGroup label="Number">
              <TextInput type="number" value={data.substituteNumber} onChange={(v: any) => update('substituteNumber', parseInt(v) || 0)} />
            </InputGroup>
          </div>
        )}
      </div>
    </div>

    <div className="pt-8 border-t border-slate-100">
      <InputGroup label="Brief details">
        <textarea 
          value={data.teacherImpactDetails}
          onChange={(e) => update('teacherImpactDetails', e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none h-32"
          placeholder="Details on teacher displacement, accommodation, etc..."
        />
      </InputGroup>
    </div>
  </div>
);

const Section8 = ({ data, update }: any) => (
  <div className="p-8 space-y-8">
    <div>
      <h3 className="text-sm font-bold text-slate-800 mb-4">Immediate (0–3 months)</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {['Temporary learning spaces', 'Minor repairs', 'Teaching and learning materials', 'WASH facilities', 'Psychosocial support'].map(opt => (
          <label key={opt} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input 
              type="checkbox" 
              checked={data.priorityNeedsImmediate.includes(opt)}
              onChange={(e) => {
                const current = [...data.priorityNeedsImmediate];
                if (e.target.checked) current.push(opt);
                else {
                  const idx = current.indexOf(opt);
                  if (idx > -1) current.splice(idx, 1);
                }
                update('priorityNeedsImmediate', current);
              }}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-slate-700">{opt}</span>
          </label>
        ))}
      </div>
      <InputGroup label="Lead Responsibility (Immediate)">
        <div className="flex flex-wrap gap-3">
          {['MEHRD', 'EP', 'Province', 'Partner'].map(opt => (
            <label key={opt} className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all duration-200">
              <input 
                type="checkbox" 
                checked={data.leadResponsibilityImmediate.includes(opt)}
                onChange={(e) => {
                  const current = [...data.leadResponsibilityImmediate];
                  if (e.target.checked) current.push(opt);
                  else {
                    const idx = current.indexOf(opt);
                    if (idx > -1) current.splice(idx, 1);
                  }
                  update('leadResponsibilityImmediate', current);
                }}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-xs font-bold text-slate-600">{opt}</span>
            </label>
          ))}
        </div>
      </InputGroup>
    </div>

    <div className="pt-8 border-t border-slate-100">
      <InputGroup label="Details">
        <textarea 
          value={data.priorityNeedsDetails}
          onChange={(e) => update('priorityNeedsDetails', e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24"
        />
      </InputGroup>
    </div>
  </div>
);

const Section9 = ({ data, update }: any) => (
  <div className="p-8 space-y-8">
    <h3 className="text-sm font-bold text-slate-800 mb-4">Indicative Resource Requirements</h3>
    <div className="overflow-x-auto border border-slate-200 rounded-xl">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
          <tr>
            <th className="px-4 py-3 border-b border-slate-200">Item / Activity</th>
            <th className="px-4 py-3 border-b border-l border-slate-200">Estimated Quantity</th>
            <th className="px-4 py-3 border-b border-l border-slate-200">Estimated Cost (SBD)</th>
            <th className="px-4 py-3 border-b border-l border-slate-200">Priority</th>
          </tr>
        </thead>
        <tbody>
          {data.resourceRequirements.map((req: any, idx: number) => (
            <tr key={idx} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-2 font-semibold text-slate-700 border-b border-slate-200">{req.item}</td>
              <td className="px-1 py-1 border-b border-l border-slate-200">
                <input 
                  type="text" 
                  value={req.quantity} 
                  onChange={(e) => {
                    const current = [...data.resourceRequirements];
                    current[idx].quantity = e.target.value;
                    update('resourceRequirements', current);
                  }}
                  className="w-full px-2 py-1 bg-transparent outline-none focus:bg-white"
                />
              </td>
              <td className="px-1 py-1 border-b border-l border-slate-200">
                <input 
                  type="text" 
                  value={req.cost} 
                  onChange={(e) => {
                    const current = [...data.resourceRequirements];
                    current[idx].cost = e.target.value;
                    update('resourceRequirements', current);
                  }}
                  className="w-full px-2 py-1 bg-transparent outline-none focus:bg-white"
                />
              </td>
              <td className="px-1 py-1 border-b border-l border-slate-200">
                <select 
                  value={req.priority} 
                  onChange={(e) => {
                    const current = [...data.resourceRequirements];
                    current[idx].priority = e.target.value;
                    update('resourceRequirements', current);
                  }}
                  className="w-full px-2 py-1 bg-transparent outline-none focus:bg-white"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const SectionFinal = ({ data, update, onSync, isSyncing, isOffline, user }: any) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [exportingPDF, setExportingPDF] = useState(false);

  // ... (handleExportPDF stays mostly same, but I'll update handlePhotoUpload below)

  const handleExportPDF = async () => {
    setExportingPDF(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');

      // Create a temporary container for the report
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '800px';
      container.style.padding = '40px';
      container.style.backgroundColor = 'white';
      
      container.innerHTML = `
        <div style="font-family: sans-serif; color: #1e293b;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px;">
            <div>
              <h1 style="font-size: 24px; font-weight: bold; margin: 0; color: #1e3a8a;">Western Province Education Board</h1>
              <p style="font-size: 14px; color: #64748b; margin: 4px 0 0 0;">Education in Emergency - Damage & Statistics Assessment</p>
            </div>
            <div style="text-align: right;">
              <p style="font-size: 12px; font-weight: bold; margin: 0;">REPORT ID: DSA-${Date.now().toString().slice(-6)}</p>
              <p style="font-size: 12px; color: #64748b; margin: 2px 0 0 0;">Date: ${new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
              <h3 style="font-size: 12px; font-weight: bold; color: #3b82f6; margin: 0 0 10px 0; text-transform: uppercase;">1. SCHOOL INFORMATION</h3>
              <p style="margin: 5px 0; font-size: 14px;"><strong>School:</strong> ${data.schoolName || 'N/A'}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Province:</strong> ${data.province || 'N/A'}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Island:</strong> ${data.island || 'N/A'}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Ward:</strong> ${data.wardCommunity || 'N/A'}</p>
            </div>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
              <h3 style="font-size: 12px; font-weight: bold; color: #3b82f6; margin: 0 0 10px 0; text-transform: uppercase;">2. DISASTER DETAILS</h3>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Hazard Type:</strong> ${data.hazardType || 'N/A'}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Hazard Date:</strong> ${data.hazardDate || 'N/A'}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Status:</strong> ${data.operationalStatus || 'N/A'}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Damage Level:</strong> ${data.overallDamageLevel}/4</p>
            </div>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 12px; font-weight: bold; color: #3b82f6; margin: 0 0 10px 0; text-transform: uppercase;">3. IMPACT SUMMARY</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="background: #f1f5f9; text-align: left;">
                  <th style="padding: 10px; border: 1px solid #e2e8f0;">Category</th>
                  <th style="padding: 10px; border: 1px solid #e2e8f0;">Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Students Affected</td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0;">${data.studentsAffected || 0}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Teachers Affected</td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0;">${data.teachersAffected || 0}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Priority Needs</td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0;">${data.priorityNeeds || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 12px; font-weight: bold; color: #3b82f6; margin: 0 0 10px 0; text-transform: uppercase;">4. FACILITY DAMAGE & DOCUMENTATION</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <thead>
                <tr style="background: #f1f5f9; text-align: left;">
                  <th style="padding: 8px; border: 1px solid #e2e8f0;">Facility</th>
                  <th style="padding: 8px; border: 1px solid #e2e8f0;">Damage Status</th>
                  <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Photos</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(data.facilityDamage).map(([fac, info]: [string, any]) => {
                  const damage = Object.entries(info)
                    .filter(([k, v]) => k !== 'photos' && Number(v) > 0)
                    .map(([k, v]) => `${v} ${k}`)
                    .join(', ');
                  return `
                    <tr>
                      <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">${fac}</td>
                      <td style="padding: 8px; border: 1px solid #e2e8f0;">${damage || 'None reported'}</td>
                      <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">${info.photos?.length || 0} attached</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 12px; font-weight: bold; color: #3b82f6; margin: 0 0 10px 0; text-transform: uppercase;">5. RESOURCE REQUIREMENTS</h3>
            ${data.resourceRequirements?.length > 0 ? `
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                  <tr style="background: #f1f5f9; text-align: left;">
                    <th style="padding: 10px; border: 1px solid #e2e8f0;">Item</th>
                    <th style="padding: 10px; border: 1px solid #e2e8f0;">Qty</th>
                    <th style="padding: 10px; border: 1px solid #e2e8f0;">Est. Cost</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.resourceRequirements.map((r: any) => `
                    <tr>
                      <td style="padding: 10px; border: 1px solid #e2e8f0;">${r.item}</td>
                      <td style="padding: 10px; border: 1px solid #e2e8f0;">${r.quantity}</td>
                      <td style="padding: 10px; border: 1px solid #e2e8f0;">$${parseFloat(String(r.cost || 0)) || 0}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p style="font-size: 14px; font-style: italic; color: #94a3b8;">No specific resource requirements listed.</p>'}
          </div>

          <div style="margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <div style="display: flex; justify-content: space-between;">
              <div style="width: 200px;">
                <div style="border-bottom: 1px solid #000; height: 30px;"></div>
                <p style="font-size: 10px; margin-top: 5px; text-transform: uppercase;">Principal Signature</p>
              </div>
              <div style="width: 200px;">
                <div style="border-bottom: 1px solid #000; height: 30px;"></div>
                <p style="font-size: 10px; margin-top: 5px; text-transform: uppercase;">Education Officer Signature</p>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(container);
      
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`DSA_Report_${data.schoolName || 'Assessment'}.pdf`);
      
      document.body.removeChild(container);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setExportingPDF(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus({ type: null, message: '' });

    try {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `assessments/${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('assessments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('assessments')
        .getPublicUrl(filePath);

      const newPhoto = {
        url: publicUrl,
        name: file.name,
        timestamp: new Date().toISOString()
      };

      update('photos', [...(data.photos || []), newPhoto]);
      setUploadStatus({ type: 'success', message: 'Photo uploaded successfully!' });
      setUploading(false);
      setUploadProgress(100);
      setTimeout(() => setUploadStatus({ type: null, message: '' }), 3000);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus({ type: 'error', message: error.message || 'Something went wrong.' });
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...(data.photos || [])];
    newPhotos.splice(index, 1);
    update('photos', newPhotos);
  };

  return (
    <div className="p-8 space-y-12">
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
          <FileText size={18} className="text-blue-600" />
          10. Attachments
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {['Photographs of damage', 'Location sketch/map', 'Additional supporting documents'].map(opt => (
            <label key={opt} className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                checked={data.attachments?.includes(opt)}
                onChange={(e) => {
                  const current = [...(data.attachments || [])];
                  if (e.target.checked) current.push(opt);
                  else {
                    const idx = current.indexOf(opt);
                    if (idx > -1) current.splice(idx, 1);
                  }
                  update('attachments', current);
                }}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm font-semibold text-slate-700">{opt}</span>
            </label>
          ))}
        </div>

        {/* Photo Upload Section */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 border-dashed">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-bold text-slate-800">Photographs of Damage</h4>
              <p className="text-xs text-slate-500">Upload clear photos of structural or facility damage.</p>
            </div>
            <label className={`flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                  <span className="text-blue-600">{uploadProgress}%</span>
                </div>
              ) : (
                <CloudUpload size={16} className="text-blue-600" />
              )}
              {uploading ? 'Uploading...' : 'Upload Photo'}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
            </label>
          </div>

          {uploadStatus.type && (
            <div className={`mb-4 p-2 rounded-lg text-xs font-bold text-center animate-in fade-in slide-in-from-top-2 ${
              uploadStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {uploadStatus.message}
            </div>
          )}

          {(data.photos?.length || 0) > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {data.photos.map((photo: any, idx: number) => (
                <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white">
                  <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => removePhoto(idx)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-[10px] text-white truncate font-medium">{photo.name}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300 border border-slate-100">
                <MapPin size={24} />
              </div>
              <p className="text-sm text-slate-400 font-medium">No photos uploaded yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-12 border-t border-slate-100">
      <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
        <FileText size={18} className="text-blue-600" />
        11. Recommendations
      </h3>
      <InputGroup label="Provide brief, practical recommendations for consideration">
        <textarea 
          value={data.recommendations}
          onChange={(e) => update('recommendations', e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none h-40"
          placeholder="Prioritise safety, continuity of learning, and recovery planning..."
        />
      </InputGroup>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-slate-100">
      <div className="space-y-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4">12.1 Assessor Details</h3>
        <InputGroup label="Name of Assessor">
          <TextInput value={data.assessor.name} onChange={(v: any) => update('assessor.name', v)} />
        </InputGroup>
        <InputGroup label="Position">
          <TextInput value={data.assessor.position} onChange={(v: any) => update('assessor.position', v)} />
        </InputGroup>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputGroup label="Email">
            <TextInput value={data.assessor.email} onChange={(v: any) => update('assessor.email', v)} />
          </InputGroup>
          <InputGroup label="Phone">
            <TextInput value={data.assessor.phone} onChange={(v: any) => update('assessor.phone', v)} />
          </InputGroup>
        </div>
        <InputGroup label="Date">
          <TextInput type="date" value={data.assessor.date} onChange={(v: any) => update('assessor.date', v)} />
        </InputGroup>
      </div>

      <div className="space-y-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4">12.2 Interviewee Details</h3>
        <InputGroup label="Name of Person Interviewed">
          <TextInput value={data.interviewee.name} onChange={(v: any) => update('interviewee.name', v)} />
        </InputGroup>
        <InputGroup label="Position">
          <TextInput value={data.interviewee.position} onChange={(v: any) => update('interviewee.position', v)} />
        </InputGroup>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputGroup label="Email">
            <TextInput value={data.interviewee.email} onChange={(v: any) => update('interviewee.email', v)} />
          </InputGroup>
          <InputGroup label="Phone">
            <TextInput value={data.interviewee.phone} onChange={(v: any) => update('interviewee.phone', v)} />
          </InputGroup>
        </div>
        <InputGroup label="Date">
          <TextInput type="date" value={data.interviewee.date} onChange={(v: any) => update('interviewee.date', v)} />
        </InputGroup>
      </div>
    </div>

    <div className="pt-12 border-t border-slate-100 flex flex-col items-center gap-8">
      <div className="text-center max-w-md">
        <h4 className="font-bold text-slate-800 mb-2 text-xl">Ready to Finalize?</h4>
        <p className="text-sm text-slate-500">Review all sections before submitting. Once submitted, the assessment will be synced to the Western Province Education database.</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center px-4">
        <button 
          onClick={onSync}
          disabled={isSyncing}
          className={`flex-1 sm:max-w-xs flex items-center justify-center gap-3 px-8 py-5 text-white font-bold rounded-2xl shadow-xl transition-all transform active:scale-95 ${
            isSyncing ? 'bg-slate-400 opacity-50 cursor-not-allowed' : 
            isOffline ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
          }`}
        >
          {isSyncing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            isOffline ? <History size={22} /> : <CloudUpload size={22} />
          )}
          {isSyncing ? 'Submitting...' : isOffline ? 'Queue for Offline Sync' : 'Submit to Database'}
        </button>

        <button 
          onClick={handleExportPDF}
          disabled={exportingPDF}
          className={`flex-1 sm:max-w-xs flex items-center justify-center gap-3 px-8 py-5 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-900 shadow-xl shadow-slate-200 transition-all transform active:scale-95 ${exportingPDF ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {exportingPDF ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <FileDown size={22} />
          )}
          {exportingPDF ? 'Exporting...' : 'Download as PDF Report'}
        </button>

        <button 
          onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `DSA_FINAL_${data.schoolName || 'Assessment'}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
          }}
          className="flex-1 sm:max-w-xs flex items-center justify-center gap-3 px-8 py-5 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all transform active:scale-95"
        >
          <Save size={22} className="text-slate-400" />
          Export as JSON File
        </button>
      </div>

      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <div className="w-8 h-px bg-slate-200" />
        Official DSA Submission
        <div className="w-8 h-px bg-slate-200" />
      </div>
    </div>
  </div>
);
};

const AnalysisDashboard = ({ assessments }: { assessments: any[] }) => {
  const [hazardFilter, setHazardFilter] = useState('All');
  const [wardFilter, setWardFilter] = useState('All');
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSavingAI, setIsSavingAI] = useState(false);
  const [aiHistory, setAiHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAIHistory();
  }, []);

  const fetchAIHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('analysis_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      setAiHistory(data || []);
    } catch (error) {
      console.error('Fetch AI History failed:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const saveAIAnalysis = async () => {
    if (!aiSummary || filtered.length === 0) return;
    setIsSavingAI(true);
    try {
      const { error } = await supabase
        .from('analysis_history')
        .insert({
          summary: aiSummary,
          hazard_filter: hazardFilter,
          ward_filter: wardFilter,
          assessment_count: filtered.length,
          stats: stats,
          created_at: new Date().toISOString()
        });
      if (error) throw error;
      alert('AI Analysis saved to cloud history!');
      fetchAIHistory();
    } catch (error) {
      console.error('Save AI Analysis failed:', error);
      alert('Failed to save analysis. Ensure the analysis_history table exists in your Supabase database.');
    } finally {
      setIsSavingAI(false);
    }
  };

  const generateAISummary = async () => {
    if (filtered.length === 0) return;
    setIsGeneratingAI(true);
    setAiSummary(null);

    const dataSnapshot = filtered.map(a => ({
      school: a.schoolName,
      hazard: a.hazardType,
      damage: a.overallDamageLevel,
      students: a.studentsAffected,
      status: a.operationalStatus,
      risks: a.immediateRisks
    })).slice(0, 50); // Limit to top 50 for token sanity

    const prompt = `Analyze the following disaster assessment data for schools in Western Province, Solomon Islands. 
    Provide a concise, professional summary (3-4 paragraphs) covering:
    1. Overall impact magnitude and primary hazards observed.
    2. Critical infrastructure concerns and educational continuity risks.
    3. Urgent recommendations for the Education Provider (WPEP) to prioritize recovery efforts.

    Data Snapshot:
    ${JSON.stringify(dataSnapshot, null, 2)}`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: "You are a crisis management expert and disaster response analyst for the Solomon Islands Ministry of Education. Your tone is professional, urgent, and data-driven."
        }
      });
      setAiSummary(response.text);
    } catch (error) {
      console.error('AI Summary failed:', error);
      setAiSummary('Failed to generate AI insights. Please check your connectivity and try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const exportToCSV = () => {
    if (filtered.length === 0) return;
    
    const headers = [
      'School Name', 'Hazard Type', 'Date of Hazard', 'Ward/Community', 
      'Operational Status', 'Students Affected', 'Teachers Affected', 
      'Overall Damage Level', 'Impact Summary'
    ];
    
    const rows = filtered.map(a => [
      `"${(a.schoolName || '').replace(/"/g, '""')}"`,
      `"${(a.hazardType || '').replace(/"/g, '""')}"`,
      `"${a.hazardDate || ''}"`,
      `"${(a.wardCommunity || '').replace(/"/g, '""')}"`,
      `"${(a.operationalStatus || '').replace(/"/g, '""')}"`,
      a.studentsAffected || 0,
      a.teachersAffected || 0,
      a.overallDamageLevel || 0,
      `"${(a.immediateRisks || '').replace(/"/g, '""')}"`
    ]);
    
    const csvContent = "\ufeff" + [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `wpep_assessments_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    if (!dashboardRef.current) return;
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f8fafc',
        windowWidth: 1200 // Force a desktop-like width for better chart layout in capture
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Header
      pdf.setFillColor(59, 130, 246); // Blue-600
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.text('WPEP Assessment Summary Report', 15, 20);
      
      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 15, 30);
      pdf.text(`Filters: Hazard: ${hazardFilter} | Ward: ${wardFilter}`, 15, 35);
      
      // Summary Stats
      pdf.setTextColor(30, 41, 59); // Slate-800
      pdf.setFontSize(14);
      pdf.text('Dashboard Overview', 15, 50);
      
      const imgWidth = pageWidth - 30;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If height is too big, it might need multiple pages, but for a summary capture 
      // we can try to fit it or scale it.
      const availableHeight = pageHeight - 65;
      let finalImgHeight = imgHeight;
      let finalImgWidth = imgWidth;
      
      if (imgHeight > availableHeight) {
        finalImgHeight = availableHeight;
        finalImgWidth = (canvas.width * finalImgHeight) / canvas.height;
      }
      
      pdf.addImage(imgData, 'PNG', 15, 60, finalImgWidth, finalImgHeight);
      
      pdf.save(`wpep_analysis_report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF Export failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const hazards = ['All', ...Array.from(new Set(assessments.map(a => a.hazardType).filter(Boolean)))];
  const wards = ['All', ...Array.from(new Set(assessments.map(a => a.wardCommunity).filter(Boolean)))];

  const filtered = assessments.filter(a => 
    (hazardFilter === 'All' || a.hazardType === hazardFilter) &&
    (wardFilter === 'All' || a.wardCommunity === wardFilter)
  );

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const stats = {
    total: filtered.length,
    studentsAffected: filtered.reduce((acc, curr) => acc + (curr.studentsAffected || 0), 0),
    teachersAffected: filtered.reduce((acc, curr) => acc + (curr.teachersAffected || 0), 0),
    avgDamage: filtered.length > 0 
      ? (filtered.reduce((acc, curr) => acc + (curr.overallDamageLevel || 0), 0) / filtered.length).toFixed(1)
      : 0,
    totalCost: filtered.reduce((acc, curr) => {
      const assessmentCost = (curr.resourceRequirements || []).reduce((sum: number, req: any) => {
        const costValue = parseFloat(String(req.cost).replace(/[^0-9.]/g, '')) || 0;
        return sum + costValue;
      }, 0);
      return acc + assessmentCost;
    }, 0)
  };

  const damageDistribution = [
    { name: 'None', value: filtered.filter(a => a.overallDamageLevel === 0).length },
    { name: 'Minor', value: filtered.filter(a => a.overallDamageLevel === 1).length },
    { name: 'Moderate', value: filtered.filter(a => a.overallDamageLevel === 2).length },
    { name: 'Significant', value: filtered.filter(a => a.overallDamageLevel === 3).length },
    { name: 'Destroyed', value: filtered.filter(a => a.overallDamageLevel === 4).length },
  ];

  const operationalStatusData = [
    { name: 'Operational', value: filtered.filter(a => a.operationalStatus === 'Operational').length },
    { name: 'Partially', value: filtered.filter(a => a.operationalStatus === 'Partially Operational').length },
    { name: 'Not Operational', value: filtered.filter(a => a.operationalStatus === 'Not Operational').length },
  ];

  const hazardDistribution = filtered.reduce((acc: any[], curr) => {
    const existing = acc.find(a => a.name === curr.hazardType);
    if (existing) existing.value++;
    else acc.push({ name: curr.hazardType || 'Unknown', value: 1 });
    return acc;
  }, []);

  const impactByHazard = filtered.reduce((acc: any[], curr) => {
    const hazard = curr.hazardType || 'Unknown';
    const existing = acc.find(a => a.name === hazard);
    if (existing) {
      existing.students += (curr.studentsAffected || 0);
      existing.teachers += (curr.teachersAffected || 0);
    } else {
      acc.push({ 
        name: hazard, 
        students: (curr.studentsAffected || 0), 
        teachers: (curr.teachersAffected || 0) 
      });
    }
    return acc;
  }, []);

  const impactByWard = filtered.reduce((acc: any[], curr) => {
    const ward = curr.wardCommunity || 'Unknown';
    const existing = acc.find(a => a.name === ward);
    if (existing) {
      existing.students += (curr.studentsAffected || 0);
      existing.teachers += (curr.teachersAffected || 0);
      existing.schools += 1;
    } else {
      acc.push({ 
        name: ward, 
        students: (curr.studentsAffected || 0), 
        teachers: (curr.teachersAffected || 0), 
        schools: 1 
      });
    }
    return acc;
  }, []);

  const impactBySchool = filtered.reduce((acc: any[], curr) => {
    const school = curr.schoolName || 'Unknown';
    acc.push({ 
      name: school, 
      students: (curr.studentsAffected || 0), 
      teachers: (curr.teachersAffected || 0)
    });
    return acc;
  }, []).sort((a, b) => b.students - a.students).slice(0, 10);

  const observedRisksSummary = filtered.reduce((acc: Record<string, number>, curr) => {
    (curr.observedRisks || []).forEach((risk: string) => {
      acc[risk] = (acc[risk] || 0) + 1;
    });
    return acc;
  }, {});

  const immediateRisksSummary = filtered.reduce((acc: Record<string, number>, curr) => {
    if (curr.immediateRisks && curr.immediateRisks.trim()) {
      const risks = curr.immediateRisks.split('\n')
        .flatMap((l: string) => l.split(','))
        .map((r: string) => r.trim())
        .filter(Boolean);
      risks.forEach((risk: string) => {
        acc[risk] = (acc[risk] || 0) + 1;
      });
    }
    return acc;
  }, {});

  const sortedObservedRisks = Object.entries(observedRisksSummary)
    .sort((a: any, b: any) => b[1] - a[1]);

  const sortedImmediateRisks = Object.entries(immediateRisksSummary)
    .sort((a: any, b: any) => b[1] - a[1]);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Filters & Exports */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1 space-y-1.5 w-full">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hazard Type Filter</label>
          <select 
            value={hazardFilter}
            onChange={(e) => setHazardFilter(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {hazards.map((h, idx) => <option key={`${h}-${idx}`} value={h}>{h}</option>)}
          </select>
        </div>
        <div className="flex-1 space-y-1.5 w-full">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ward/Community Filter</label>
          <select 
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {wards.map((w, idx) => <option key={`${w}-${idx}`} value={w}>{w}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-2 mb-0.5">
          <button 
            onClick={() => { setHazardFilter('All'); setWardFilter('All'); }}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap"
          >
            Reset
          </button>
          
          <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block" />

          <button 
            onClick={exportToCSV}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            disabled={filtered.length === 0}
          >
            <FileText size={14} className="text-blue-600" />
            CSV
          </button>

          <button 
            onClick={exportToPDF}
            className={`px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-200 transition-all ${isExporting ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={filtered.length === 0 || isExporting}
          >
            {isExporting ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FileDown size={14} />
            )}
            {isExporting ? 'Preparing...' : 'PDF Report'}
          </button>
          
          <button 
            onClick={generateAISummary}
            className={`px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-purple-200 transition-all ${isGeneratingAI ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={filtered.length === 0 || isGeneratingAI}
          >
            {isGeneratingAI ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            {isGeneratingAI ? 'Analyzing...' : 'AI Insights'}
          </button>
        </div>
      </div>

      <div ref={dashboardRef} className="space-y-8">
        <AnimatePresence>
          {aiSummary && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100 shadow-sm relative overflow-hidden print:shadow-none"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles size={120} className="text-purple-600" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                      <Sparkles size={18} />
                    </div>
                    <h3 className="font-bold text-slate-800">AI Situation Analysis</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={saveAIAnalysis}
                      disabled={isSavingAI}
                      className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider disabled:opacity-50"
                      title="Save to Cloud"
                    >
                      {isSavingAI ? <div className="w-3 h-3 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" /> : <Save size={14} />}
                      Save
                    </button>
                    <button 
                      onClick={() => setAiSummary(null)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed font-medium">
                  {aiSummary.split('\n').map((line, i) => (
                    <p key={i} className={line.trim() === '' ? 'h-2' : 'mb-3'}>{line}</p>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                  <div className="w-4 h-px bg-purple-100" />
                  Gemini AI Generated Intelligence
                  <div className="w-4 h-px bg-purple-100" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {aiHistory.length > 0 && !aiSummary && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <History size={14} className="text-slate-400" />
              Recent AI Analysis Reports
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiHistory.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setAiSummary(report.summary)}
                  className="text-left p-4 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full uppercase tracking-tight">
                      {report.hazard_filter === 'All' ? 'Multi-Hazard' : report.hazard_filter}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 italic">
                    {report.summary}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Assessments</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900">{stats.total}</span>
            <span className="text-xs font-medium text-slate-400 mb-1">submitted</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Students Affected</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-blue-600">{stats.studentsAffected.toLocaleString()}</span>
            <span className="text-xs font-medium text-slate-400 mb-1">total</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Teachers Affected</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-indigo-600">{stats.teachersAffected.toLocaleString()}</span>
            <span className="text-xs font-medium text-slate-400 mb-1">total</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Avg. Damage Level</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-amber-600">{stats.avgDamage}</span>
            <span className="text-xs font-medium text-slate-400 mb-1">/ 4 max</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm bg-blue-50/30">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Total Resource Cost</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-blue-700">
              ${stats.totalCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] font-bold text-blue-400 mb-1 uppercase">SBD Total</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Infrastructure Damage */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-8 flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-600" />
            Infrastructure Damage Distribution
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={damageDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Status */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-8 flex items-center gap-2">
            <PieChartIcon size={18} className="text-indigo-600" />
            Operational Status
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={operationalStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {operationalStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Impact by Hazard Type */}
        <div className="md:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-8 flex items-center gap-2">
            <Activity size={18} className="text-red-600" />
            Impact by Hazard Type (Students & Teachers)
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={impactByHazard} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" />
                <Bar dataKey="students" name="Students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="teachers" name="Teachers" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Impact by Ward */}
        <div className="md:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-8 flex items-center gap-2">
            <MapPin size={18} className="text-green-600" />
            Impact Breakdown by Ward
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={impactByWard} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" />
                <Bar dataKey="students" name="Students Affected" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="teachers" name="Teachers Affected" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 10 Affected Schools */}
        <div className="md:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-8 flex items-center gap-2">
            <School size={18} className="text-blue-600" />
            Top 10 Most Affected Schools
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={impactBySchool} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" />
                <Bar dataKey="students" name="Students" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                <Bar dataKey="teachers" name="Teachers" fill="#818cf8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Risk Summary Section */}
      <div className="pt-8 border-t border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <AlertTriangle size={24} className="text-red-600" />
          Key Risks Identification Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-red-100 shadow-sm border-l-4 border-l-red-500">
            <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
              <UserRound size={18} className="text-red-500" />
              Top Observed Student Risks
            </h4>
            <div className="space-y-4">
              {sortedObservedRisks.length > 0 ? (
                sortedObservedRisks.map(([risk, count]) => (
                  <div key={risk} className="flex items-center justify-between p-4 bg-red-50/30 rounded-xl border border-red-50 transition-all hover:bg-red-50/50">
                    <span className="text-sm font-semibold text-slate-700">{risk}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">{count}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Reports</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic text-center py-8">No observed student risks reported yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-amber-100 shadow-sm border-l-4 border-l-amber-500">
            <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Building2 size={18} className="text-amber-500" />
              Immediate Infrastructure Risks
            </h4>
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              {sortedImmediateRisks.length > 0 ? (
                sortedImmediateRisks.map(([risk, count]) => (
                  <div key={risk} className="flex items-center justify-between p-4 bg-amber-50/30 rounded-xl border border-amber-50 transition-all hover:bg-amber-50/50">
                    <span className="text-sm font-semibold text-slate-700 line-clamp-3">{risk}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">{count}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Occurrences</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic text-center py-8">No immediate infrastructure risks reported yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
