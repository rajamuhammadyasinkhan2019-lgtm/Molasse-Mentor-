
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { NotebookEntry, MineralEntry } from '../types';
import QFLTernaryDiagram from './QFLTernaryDiagram';
import { analyzeGeologicalImage } from '../services/geminiService';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  Save, 
  Database,
  Search,
  Book,
  X,
  Camera,
  Eye,
  FileText,
  Layers,
  Lightbulb,
  Triangle,
  PlusCircle,
  History,
  Globe,
  Milestone,
  ArrowRight,
  Activity,
  Zap,
  Sun,
  Maximize2,
  Minimize2,
  ZoomIn,
  Info,
  Hash,
  Palette,
  Ruler,
  Microscope,
  Dna,
  DraftingCompass,
  Magnet,
  Sparkles,
  Upload,
  RotateCw,
  ImageIcon,
  ChevronDown,
  Check,
  FileImage,
  Maximize,
  ArrowUpDown,
  Component,
  Anchor,
  Compass,
  Calculator,
  Users,
  MessageSquare,
  Loader2
} from 'lucide-react';

interface FieldNotebookProps {
  entries: NotebookEntry[];
  onSave: (entry: NotebookEntry) => void;
  onDelete: (id: string) => void;
  onConsultAI?: (image: string, context: string) => void;
}

const MINERAL_OPTIONS = [
  // Quartz Group
  "Quartz", "Monocrystalline Quartz", "Polycrystalline Quartz", "Chert", "Chalcedony",
  // Feldspar Group
  "Plagioclase", "K-Feldspar", "Orthoclase", "Microcline", "Sanidine", "Albite", "Anorthite",
  // Lithic Group
  "Volcanic Lithic", "Metamorphic Lithic", "Sedimentary Lithic",
  // Mica Group
  "Muscovite", "Biotite", "Sericite", "Chlorite", "Lepidolite",
  // Pyroxene Group
  "Augite", "Diopside", "Enstatite", "Hypersthene", "Aegirine",
  // Amphibole Group
  "Hornblende", "Tremolite", "Actinolite", "Glaucophane", "Riebeckite", "Anthophyllite",
  // Olivine Group
  "Olivine", "Forsterite", "Fayalite",
  // Carbonates
  "Calcite", "Dolomite", "Aragonite", "Siderite", "Ankerite",
  // Al-Silicates (Metamorphic)
  "Garnet", "Staurolite", "Kyanite", "Sillimanite", "Andalusite", "Cordierite", "Epidote", "Zoisite", "Clinozoisite",
  // Accessory Minerals
  "Zircon", "Apatite", "Titanite (Sphene)", "Tourmaline", "Rutile", "Monazite", "Allanite", "Fluorite",
  // Iron Oxides / Sulfides
  "Magnetite", "Hematite", "Ilmenite", "Pyrite", "Pyrrhotite", "Chalcopyrite", "Galena", "Sphalerite",
  // Alteration / Others
  "Glauconite", "Serpentine", "Talc", "Kaolinite", "Illite", "Smectite", "Montmorillonite",
  "Zeolite", "Prehnite", "Pumpellyite", "Scapolite",
  // Sedimentary Specific
  "Intraclast", "Ooid", "Pellet",
  "Clay Matrix", "Carbonate Cement", "Silica Cement", "Iron Oxide Cement",
  "Porosity", "Organic Matter", "Bitumen", "Gypsum", "Halite", "Anhydrite"
].sort();

const Q_MINERALS = ["Quartz", "Monocrystalline Quartz", "Polycrystalline Quartz", "Chert", "Chalcedony"];
const F_MINERALS = ["Plagioclase", "K-Feldspar", "Orthoclase", "Microcline", "Sanidine", "Albite", "Anorthite"];
const L_MINERALS = ["Volcanic Lithic", "Metamorphic Lithic", "Sedimentary Lithic"];

const MineralAutocomplete: React.FC<{
  value: string;
  onChange: (val: string) => void;
  onFocus?: () => void;
}> = ({ value, onChange, onFocus }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = query === '' 
    ? MINERAL_OPTIONS 
    : MINERAL_OPTIONS.filter(m => m.toLowerCase().includes(query.toLowerCase()));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') setIsOpen(true);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev < filtered.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filtered.length) {
          selectMineral(filtered[activeIndex]);
        } else if (filtered.length > 0) {
          selectMineral(filtered[0]);
        } else {
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  const selectMineral = (m: string) => {
    onChange(m);
    setQuery(m);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  useEffect(() => {
    if (activeIndex !== -1 && listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  return (
    <div className="relative w-full h-full" ref={wrapperRef}>
      <div className="relative h-full flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => {
            setIsOpen(true);
            setActiveIndex(-1);
            onFocus?.();
          }}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          className="w-full h-full bg-transparent border-none px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-300 font-medium"
          placeholder="Mineral name..."
        />
        <ChevronDown size={14} className={`absolute right-2 text-slate-300 transition-transform pointer-events-none ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (filtered.length > 0) && (
        <div 
          ref={listRef}
          className="absolute z-[60] mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95"
        >
          {filtered.map((m, idx) => (
            <button
              key={m}
              type="button"
              onClick={() => selectMineral(m)}
              onMouseEnter={() => setActiveIndex(idx)}
              className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors flex items-center justify-between border-b border-slate-50 last:border-0 ${
                activeIndex === idx ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700'
              }`}
            >
              <span>{m}</span>
              {value === m && <Check size={12} className="text-emerald-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Lightbox: React.FC<{ src: string; altText: string; onClose: () => void }> = ({ src, altText, onClose }) => {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(1, scale + delta), 4);
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const reset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 cursor-default animate-in fade-in duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="High-resolution petrographic inspection view"
    >
      <div className="absolute top-6 left-8 text-white">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] opacity-80 mb-1">Observation Inspection</h4>
        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Scroll to Zoom • Drag to Pan</p>
      </div>

      <div className="absolute top-6 right-8 flex gap-4">
        <button 
          onClick={(e) => { e.stopPropagation(); reset(); }}
          className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all border border-white/10"
          title="Reset View"
        >
          <RotateCw size={20} />
        </button>
        <button 
          onClick={onClose}
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full transition-all shadow-xl shadow-emerald-900/40"
          title="Close Inspection"
        >
          <X size={20} />
        </button>
      </div>

      <div 
        className="relative overflow-hidden w-full h-full flex items-center justify-center"
        onWheel={handleWheel}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          ref={imgRef}
          src={src}
          alt={altText}
          className={`max-w-none transition-transform duration-75 ease-out select-none cursor-${isDragging ? 'grabbing' : 'grab'}`}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            height: '80vh',
            width: 'auto',
            objectFit: 'contain'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          draggable={false}
        />
      </div>

      <div className="absolute bottom-10 flex gap-2">
        <div className="bg-black/60 px-4 py-2 rounded-full border border-white/10 text-white text-xs font-mono" aria-live="polite">
          Zoom: {(scale * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
};

const ZoomableImage: React.FC<{ src: string; altText?: string; onConsultAI?: () => void }> = ({ src, altText = "Geological texture", onConsultAI }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !containerRef.current) return;

    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setPosition({ x, y });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsZoomed(!isZoomed);
    }
  };

  return (
    <>
      <div className="relative group/zoom">
        <div 
          ref={containerRef}
          role="button"
          tabIndex={0}
          className={`w-full h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative cursor-${isZoomed ? 'zoom-out' : 'zoom-in'} bg-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
          onClick={() => setIsZoomed(!isZoomed)}
          onKeyDown={handleKeyDown}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isZoomed && setIsZoomed(false)}
        >
          <img 
            src={src} 
            alt={altText} 
            className={`w-full h-full object-cover transition-transform duration-500 ease-out`}
            style={{
              transform: isZoomed ? 'scale(2.5)' : 'scale(1)',
              transformOrigin: `${position.x}% ${position.y}%`
            }}
          />
          
          <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-sm border border-slate-200 text-slate-600 transition-transform group-hover/zoom:scale-110">
              {isZoomed ? <Minimize2 size={18} /> : <ZoomIn size={18} />}
            </div>
          </div>

          {!isZoomed && (
            <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-white uppercase tracking-widest opacity-0 group-hover/zoom:opacity-100 transition-opacity pointer-events-none">
              Click to Inspect Detail
            </div>
          )}
        </div>

        <div className="absolute top-4 left-4 flex gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowLightbox(true); }}
            className="p-2.5 bg-white text-slate-800 rounded-xl opacity-0 group-hover/zoom:opacity-100 transition-all hover:scale-110 hover:shadow-lg shadow-emerald-200 border border-slate-200"
            title="Open High-Res Inspector"
          >
            <Maximize size={18} />
          </button>
          {onConsultAI && (
            <button 
              onClick={(e) => { e.stopPropagation(); onConsultAI(); }}
              className="p-2.5 bg-emerald-600 text-white rounded-xl opacity-0 group-hover/zoom:opacity-100 transition-all hover:scale-110 hover:shadow-lg shadow-emerald-200"
              title="Consult AI Mentor"
            >
              <MessageSquare size={18} />
            </button>
          )}
        </div>
      </div>

      {showLightbox && (
        <Lightbox src={src} altText={altText} onClose={() => setShowLightbox(false)} />
      )}
    </>
  );
};

const INITIAL_ENTRY: NotebookEntry = {
  id: '',
  sampleId: '',
  date: new Date().toISOString().split('T')[0],
  owner: '',
  image: undefined,
  thinSectionImage: undefined,
  location: { manual: '' },
  handSample: {
    color: '', texture: '', grainSize: '', structures: '', 
    hardness: '', luster: '', magnetism: '', fossils: ''
  },
  thinSection: {
    mineralList: [{ name: '', percentage: 0 }],
    minerals: '', 
    percentages: '', 
    textures: '', 
    pplFeatures: '',
    xplFeatures: '',
    opticalProperties: '', 
    pplXplFeatures: '',
    qfl: { q: 0, f: 0, l: 0 }
  },
  interpretation: '',
  inferredProvenance: '',
  tectonicSetting: '',
  questions: ''
};

const FieldNotebook: React.FC<FieldNotebookProps> = ({ entries, onSave, onDelete, onConsultAI }) => {
  const [mode, setMode] = useState<'list' | 'edit' | 'view'>('list');
  const [currentEntry, setCurrentEntry] = useState<NotebookEntry>(INITIAL_ENTRY);
  const [activeTab, setActiveTab] = useState<'general' | 'hand' | 'thin' | 'summary'>('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingThin, setIsDraggingThin] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState<'hand' | 'thin' | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thinSectionInputRef = useRef<HTMLInputElement>(null);

  const calculatedQFL = useMemo(() => {
    let q = 0, f = 0, l = 0;
    (currentEntry.thinSection.mineralList || []).forEach(m => {
      const name = m.name.toLowerCase();
      if (Q_MINERALS.some(qn => qn.toLowerCase() === name)) q += m.percentage;
      else if (F_MINERALS.some(fn => fn.toLowerCase() === name)) f += m.percentage;
      else if (L_MINERALS.some(ln => ln.toLowerCase() === name)) l += m.percentage;
    });
    return { q, f, l };
  }, [currentEntry.thinSection.mineralList]);

  useEffect(() => {
    if (calculatedQFL.q > 0 || calculatedQFL.f > 0 || calculatedQFL.l > 0) {
      setCurrentEntry(prev => ({
        ...prev,
        thinSection: {
          ...prev.thinSection,
          qfl: calculatedQFL
        }
      }));
    }
  }, [calculatedQFL]);

  const handleStartNew = () => {
    setCurrentEntry({ ...INITIAL_ENTRY, id: Date.now().toString() });
    setMode('edit');
    setActiveTab('general');
  };

  const handleEdit = (entry: NotebookEntry) => {
    const mineralList = entry.thinSection.mineralList || [{ name: '', percentage: 0 }];
    setCurrentEntry({
      ...entry,
      thinSection: {
        ...entry.thinSection,
        mineralList,
        pplFeatures: entry.thinSection.pplFeatures || entry.thinSection.opticalProperties || '',
        xplFeatures: entry.thinSection.xplFeatures || entry.thinSection.pplXplFeatures || ''
      }
    });
    setMode('edit');
    setActiveTab('general');
  };

  const handleView = (entry: NotebookEntry) => {
    setCurrentEntry(entry);
    setMode('view');
  };

  const handleSave = () => {
    onSave(currentEntry);
    setMode('list');
  };

  const processFile = (file: File, type: 'hand' | 'thin') => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        if (type === 'hand') {
          setCurrentEntry(prev => ({ ...prev, image: base64 }));
        } else {
          setCurrentEntry(prev => ({ ...prev, thinSectionImage: base64 }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAIAnalysis = async (type: 'hand' | 'thin') => {
    const imageData = type === 'hand' ? currentEntry.image : currentEntry.thinSectionImage;
    if (!imageData) return;

    setIsAnalyzing(type);
    try {
      const result = await analyzeGeologicalImage(imageData, type);
      
      if (type === 'hand') {
        setCurrentEntry(prev => ({
          ...prev,
          handSample: {
            ...prev.handSample,
            color: result.color || prev.handSample.color,
            texture: result.texture || prev.handSample.texture,
            grainSize: result.grainSize || prev.handSample.grainSize,
            structures: result.structures || prev.handSample.structures,
            fossils: result.fossils || prev.handSample.fossils,
            hardness: result.hardness || prev.handSample.hardness,
            luster: result.luster || prev.handSample.luster,
            magnetism: result.magnetism || prev.handSample.magnetism,
          }
        }));
      } else {
        setCurrentEntry(prev => ({
          ...prev,
          thinSection: {
            ...prev.thinSection,
            mineralList: result.mineralList || prev.thinSection.mineralList,
            pplFeatures: result.pplFeatures || prev.thinSection.pplFeatures,
            xplFeatures: result.xplFeatures || prev.thinSection.xplFeatures,
            textures: result.textures || prev.thinSection.textures,
          }
        }));
      }
    } catch (err) {
      alert("Error during automatic analysis. Please check your connection.");
    } finally {
      setIsAnalyzing(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'hand' | 'thin') => {
    const file = e.target.files?.[0];
    if (file) processFile(file, type);
  };

  const handleDrop = (e: React.DragEvent, type: 'hand' | 'thin') => {
    e.preventDefault();
    if (type === 'hand') setIsDragging(false);
    else setIsDraggingThin(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file, type);
  };

  const handleDragOver = (e: React.DragEvent, type: 'hand' | 'thin') => {
    e.preventDefault();
    if (type === 'hand') setIsDragging(true);
    else setIsDraggingThin(true);
  };

  const handleDragLeave = (type: 'hand' | 'thin') => {
    if (type === 'hand') setIsDragging(false);
    else setIsDraggingThin(false);
  };

  const removeImage = (e: React.MouseEvent, type: 'hand' | 'thin') => {
    e.stopPropagation();
    const msg = type === 'hand' ? "Remove this sample photo?" : "Remove this photomicrograph?";
    if (window.confirm(msg)) {
      if (type === 'hand') {
        setCurrentEntry(prev => ({ ...prev, image: undefined }));
      } else {
        setCurrentEntry(prev => ({ ...prev, thinSectionImage: undefined }));
      }
    }
  };

  const addMineralRow = () => {
    setCurrentEntry(prev => ({
      ...prev,
      thinSection: {
        ...prev.thinSection,
        mineralList: [...(prev.thinSection.mineralList || []), { name: '', percentage: 0 }]
      }
    }));
  };

  const updateMineralRow = (index: number, field: keyof MineralEntry, value: string | number) => {
    const newList = [...(currentEntry.thinSection.mineralList || [])];
    newList[index] = { ...newList[index], [field]: value };
    setCurrentEntry(prev => ({
      ...prev,
      thinSection: { ...prev.thinSection, mineralList: newList }
    }));
  };

  const removeMineralRow = (index: number) => {
    const newList = [...(currentEntry.thinSection.mineralList || [])].filter((_, i) => i !== index);
    setCurrentEntry(prev => ({
      ...prev,
      thinSection: { ...prev.thinSection, mineralList: newList }
    }));
  };

  const sortMineralsByPercentage = () => {
    const sorted = [...(currentEntry.thinSection.mineralList || [])].sort((a, b) => b.percentage - a.percentage);
    setCurrentEntry(prev => ({
      ...prev,
      thinSection: { ...prev.thinSection, mineralList: sorted }
    }));
  };

  const filteredEntries = entries.filter(e => 
    e.sampleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.interpretation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateTotalVol = () => {
    return (currentEntry.thinSection.mineralList || []).reduce((acc, curr) => acc + (curr.percentage || 0), 0);
  };

  // VIEW MODE
  if (mode === 'view') {
    const descriptiveAlt = `Geological specimen ${currentEntry.sampleId}.`;
    const thinAlt = `Thin section photomicrograph of ${currentEntry.sampleId}.`;

    return (
      <div className="flex flex-col h-full bg-[#fffdfa]" role="region" aria-labelledby="view-title">
        <header className="p-4 border-b border-orange-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <button 
            onClick={() => setMode('list')} 
            className="flex items-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft size={20} aria-hidden="true" />
            <span className="font-medium">Back</span>
          </button>
          <h2 id="view-title" className="font-bold text-slate-800">
            Observation: {currentEntry.sampleId}
          </h2>
          <div className="flex gap-2">
             <button 
                onClick={() => { if(window.confirm("Delete this record permanently?")) { onDelete(currentEntry.id); setMode('list'); } }}
                className="p-2 text-slate-400 hover:text-red-600 transition-colors"
              >
                <Trash2 size={20} />
              </button>
              <button 
                onClick={() => handleEdit(currentEntry)}
                className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-transform active:scale-95"
              >
                <Edit3 size={16} aria-hidden="true" /> Edit
              </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-12">
          <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Sample Identity</span>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{currentEntry.sampleId}</h1>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-emerald-500" />
                  <span>Collected on {currentEntry.date}</span>
                </div>
                {currentEntry.owner && (
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-emerald-500" />
                    <span>Investigator: {currentEntry.owner}</span>
                  </div>
                )}
                {currentEntry.location.lat && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-emerald-500" />
                    <span>{currentEntry.location.lat.toFixed(4)}, {currentEntry.location.lng?.toFixed(4)}</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  <FileText size={18} className="text-emerald-600" />
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Hand Sample Description</h3>
                </div>
                <div className="p-6 space-y-8">
                  {currentEntry.image ? (
                    <ZoomableImage 
                      src={`data:image/jpeg;base64,${currentEntry.image}`} 
                      altText={descriptiveAlt}
                      onConsultAI={onConsultAI ? () => onConsultAI(currentEntry.image!, `Analyze this hand sample image (ID: ${currentEntry.sampleId}). Context: ${currentEntry.handSample.color}, ${currentEntry.handSample.texture}.`) : undefined}
                    />
                  ) : (
                    <div className="w-full h-80 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
                      <ImageIcon size={48} className="mb-2 opacity-50" />
                      <p className="text-xs font-bold uppercase tracking-widest">No Field Photo Attached</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-8">
                    {[
                      { label: 'Color', key: 'color', icon: Palette, color: 'text-rose-500' },
                      { label: 'Grain Size', key: 'grainSize', icon: Ruler, color: 'text-amber-500' },
                      { label: 'Texture', key: 'texture', icon: Microscope, color: 'text-blue-500' },
                      { label: 'Hardness', key: 'hardness', icon: DraftingCompass, color: 'text-slate-500' },
                      { label: 'Sed. Structures', key: 'structures', icon: Layers, color: 'text-emerald-500' },
                      { label: 'Fossils', key: 'fossils', icon: Dna, color: 'text-fuchsia-500' },
                      { label: 'Luster', key: 'luster', icon: Sparkles, color: 'text-amber-400' },
                      { label: 'Magnetism', key: 'magnetism', icon: Magnet, color: 'text-red-500' }
                    ].map((item) => (
                      <div key={item.key} className="space-y-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <item.icon size={12} className={item.color} />
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 leading-tight whitespace-pre-wrap">{(currentEntry.handSample as any)[item.key] || '—'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  <Layers size={18} className="text-emerald-600" />
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Petrographic Data</h3>
                </div>
                <div className="p-6 space-y-8">
                  {currentEntry.thinSectionImage && (
                    <div className="space-y-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-widest">Thin Section Photomicrograph</span>
                      <ZoomableImage 
                        src={`data:image/jpeg;base64,${currentEntry.thinSectionImage}`} 
                        altText={thinAlt}
                        onConsultAI={onConsultAI ? () => onConsultAI(currentEntry.thinSectionImage!, `Please analyze this thin section photomicrograph for sample ${currentEntry.sampleId}.`) : undefined}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Sun size={16} className="text-amber-500" />
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">PPL Observations</h4>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {currentEntry.thinSection.pplFeatures || 'No PPL features recorded.'}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap size={16} className="text-emerald-500" />
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">XPL Observations</h4>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {currentEntry.thinSection.xplFeatures || 'No XPL features recorded.'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Mineral Assembly</span>
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100/50 text-[10px] font-bold text-slate-400 uppercase">
                          <tr>
                            <th className="px-4 py-2 text-left">Mineral</th>
                            <th className="px-4 py-2 text-right">Vol %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {currentEntry.thinSection.mineralList?.filter(m => m.name || m.percentage > 0).map((mineral, i) => (
                            <tr key={i} className="hover:bg-white transition-colors">
                              <td className="px-4 py-3 font-semibold text-slate-800">{mineral.name || 'Unnamed Mineral'}</td>
                              <td className="px-4 py-3 text-right font-mono text-emerald-600">{mineral.percentage}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <section className="bg-emerald-900 text-white rounded-3xl border border-emerald-800 shadow-xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Globe size={140} />
                </div>
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-800 rounded-lg">
                      <Lightbulb size={24} className="text-emerald-300" />
                    </div>
                    <h3 className="font-black text-lg uppercase tracking-wider text-white">Initial Interpretation</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                      <QFLTernaryDiagram 
                        q={currentEntry.thinSection.qfl?.q || 0} 
                        f={currentEntry.thinSection.qfl?.f || 0} 
                        l={currentEntry.thinSection.qfl?.l || 0} 
                        size={220}
                      />
                    </div>
                    {currentEntry.inferredProvenance && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Inferred Provenance</span>
                        <p className="text-sm font-medium leading-relaxed opacity-90">{currentEntry.inferredProvenance}</p>
                      </div>
                    )}
                    {currentEntry.tectonicSetting && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Tectonic Setting</span>
                        <p className="text-sm font-medium leading-relaxed opacity-90">{currentEntry.tectonicSetting}</p>
                      </div>
                    )}
                    {currentEntry.interpretation && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Synthesis & Model</span>
                        <p className="text-sm leading-relaxed opacity-80 whitespace-pre-wrap">{currentEntry.interpretation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EDIT MODE
  if (mode === 'edit') {
    return (
      <div className="flex flex-col h-full bg-[#fffdfa]" role="dialog" aria-modal="true" aria-labelledby="entry-title">
        <header className="p-4 border-b border-orange-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <button onClick={() => setMode('list')} className="flex items-center text-slate-500 hover:text-slate-800 transition-colors">
            <ChevronLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
          <h2 id="entry-title" className="font-bold text-slate-800">
            {currentEntry.id === '' ? 'New Observation' : `Edit ${currentEntry.sampleId || 'Record'}`}
          </h2>
          <button 
            onClick={handleSave}
            disabled={!currentEntry.sampleId}
            className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50 active:scale-95 transition-all shadow-md shadow-emerald-200"
          >
            <Save size={16} /> Save
          </button>
        </header>

        <div className="flex border-b border-orange-50 bg-orange-50/30 overflow-x-auto no-scrollbar">
          {[
            { id: 'general', label: 'Field Info' },
            { id: 'hand', label: 'Hand Sample' },
            { id: 'thin', label: 'Thin Section' },
            { id: 'summary', label: 'Interpretation' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'text-emerald-700 border-b-2 border-emerald-600 bg-white' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-4xl mx-auto w-full pb-20">
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-2">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 space-y-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <Camera size={20} className="text-emerald-600" />
                    </div>
                    <div className="flex flex-col">
                      <label className="block text-xs font-black text-slate-800 uppercase tracking-widest">Sample Documentation</label>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Hand Sample or Outcrop Photo</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentEntry.image && (
                      <button 
                        onClick={(e) => removeImage(e, 'hand')}
                        className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 uppercase tracking-widest transition-colors mr-2 px-3 py-2 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    )}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-emerald-600 text-white hover:bg-emerald-700 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-emerald-100"
                    >
                      <Upload size={14} /> {currentEntry.image ? 'Replace Photo' : 'Capture Sample'}
                    </button>
                  </div>
                </div>
                
                <div 
                  className={`aspect-video rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer transition-all duration-500 ${
                    isDragging 
                      ? 'border-emerald-500 bg-emerald-50 scale-[1.01]' 
                      : 'border-slate-100 bg-slate-50/50 hover:border-emerald-200 hover:bg-emerald-50/20'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => handleDragOver(e, 'hand')}
                  onDragLeave={() => handleDragLeave('hand')}
                  onDrop={(e) => handleDrop(e, 'hand')}
                >
                  {currentEntry.image ? (
                    <>
                      <img src={`data:image/jpeg;base64,${currentEntry.image}`} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt="Sample preview" />
                      
                      {/* AI Scan Overlay */}
                      <div className="absolute inset-0 bg-emerald-950/20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleAIAnalysis('hand'); }}
                          disabled={isAnalyzing === 'hand'}
                          className="bg-white/95 text-emerald-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                          {isAnalyzing === 'hand' ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="text-amber-500" />}
                          {isAnalyzing === 'hand' ? 'AI Observing...' : 'Smart Scan with AI'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white text-slate-200 p-8 rounded-full mb-5 shadow-sm border border-slate-50 group-hover:scale-110 group-hover:text-emerald-400 group-hover:shadow-emerald-100 transition-all duration-700">
                        <Camera size={48} strokeWidth={1.5} />
                      </div>
                      <div className="text-center">
                        <span className="text-sm text-slate-700 font-black block mb-1">Click to Capture or Upload</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.25em]">Professional Geological Evidence</span>
                      </div>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={(e) => handleImageUpload(e, 'hand')} 
                    accept="image/*" 
                    className="hidden" 
                    capture="environment"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Sample ID *</label>
                    <input 
                      type="text" value={currentEntry.sampleId} onChange={e => setCurrentEntry({...currentEntry, sampleId: e.target.value})}
                      placeholder="e.g. M-01-A" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Date</label>
                    <input type="date" value={currentEntry.date} onChange={e => setCurrentEntry({...currentEntry, date: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Owner / Collaborator</label>
                    <input 
                      type="text" value={currentEntry.owner || ''} onChange={e => setCurrentEntry({...currentEntry, owner: e.target.value})}
                      placeholder="Investigator name" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hand' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-2">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                    <FileText size={12} className="text-emerald-500" />
                    Primary Lithology
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['color', 'grainSize', 'texture'].map(field => (
                      <div key={field} className={isAnalyzing === 'hand' ? 'animate-pulse opacity-60' : ''}>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{field.replace(/([A-Z])/g, ' $1')}</label>
                        <input 
                          type="text" value={(currentEntry.handSample as any)[field]} 
                          placeholder={`e.g. ${field === 'color' ? 'Dark Grey' : field === 'texture' ? 'Clastic' : 'Fine'}`}
                          onChange={e => setCurrentEntry({...currentEntry, handSample: {...currentEntry.handSample, [field]: e.target.value}})} 
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" 
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Database size={12} className="text-emerald-500" />
                    Structural & Biological Observations
                  </h4>
                  <div className={`space-y-4 ${isAnalyzing === 'hand' ? 'animate-pulse opacity-60' : ''}`}>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sedimentary Structures</label>
                      <input 
                        type="text" value={currentEntry.handSample.structures} placeholder="e.g. Cross-bedding"
                        onChange={e => setCurrentEntry({...currentEntry, handSample: {...currentEntry.handSample, structures: e.target.value}})} 
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fossils / Paleontological</label>
                      <textarea 
                        value={currentEntry.handSample.fossils} 
                        placeholder="Describe biogenic features..."
                        onChange={e => setCurrentEntry({...currentEntry, handSample: {...currentEntry.handSample, fossils: e.target.value}})} 
                        className="w-full border border-emerald-100 bg-emerald-50/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 min-h-[80px] resize-none" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'thin' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-2">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 space-y-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <Microscope size={20} className="text-emerald-600" />
                    </div>
                    <div className="flex flex-col">
                      <label className="block text-xs font-black text-slate-800 uppercase tracking-widest">Photomicrograph Documentation</label>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">High-Res Thin Section Image</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentEntry.thinSectionImage && (
                      <button 
                        onClick={(e) => removeImage(e, 'thin')}
                        className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 uppercase tracking-widest"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    )}
                    <button 
                      onClick={() => thinSectionInputRef.current?.click()}
                      className="bg-emerald-600 text-white hover:bg-emerald-700 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                    >
                      <Upload size={14} /> {currentEntry.thinSectionImage ? 'Replace Image' : 'Add Photomicrograph'}
                    </button>
                  </div>
                </div>
                
                <div 
                  className={`aspect-square max-w-sm mx-auto rounded-full border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer transition-all duration-500 ${
                    isDraggingThin 
                      ? 'border-emerald-500 bg-emerald-50 scale-[1.01]' 
                      : 'border-slate-100 bg-slate-50/50 hover:border-emerald-200'
                  }`}
                  onClick={() => thinSectionInputRef.current?.click()}
                  onDragOver={(e) => handleDragOver(e, 'thin')}
                  onDragLeave={() => handleDragLeave('thin')}
                  onDrop={(e) => handleDrop(e, 'thin')}
                >
                  {currentEntry.thinSectionImage ? (
                    <>
                      <img src={`data:image/jpeg;base64,${currentEntry.thinSectionImage}`} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt="Micro-view" />
                      
                      {/* AI Scan Overlay */}
                      <div className="absolute inset-0 bg-emerald-950/20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleAIAnalysis('thin'); }}
                          disabled={isAnalyzing === 'thin'}
                          className="bg-white/95 text-emerald-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                          {isAnalyzing === 'thin' ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="text-amber-500" />}
                          {isAnalyzing === 'thin' ? 'AI Scanning...' : 'Scan Micro-features'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white text-slate-200 p-8 rounded-full mb-3 shadow-sm border border-slate-50 group-hover:text-emerald-400 transition-all">
                        <Camera size={40} strokeWidth={1.5} />
                      </div>
                      <div className="text-center px-4">
                        <span className="text-[11px] text-slate-700 font-black block">Microscope View</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">PPL or XPL Frame</span>
                      </div>
                    </>
                  )}
                  <input type="file" ref={thinSectionInputRef} onChange={(e) => handleImageUpload(e, 'thin')} accept="image/*" className="hidden" />
                </div>
              </div>

              <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden ${isAnalyzing === 'thin' ? 'animate-pulse opacity-60' : ''}`}>
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Microscope size={18} className="text-emerald-600" />
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-[0.1em]">Mineral Assembly</h4>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addMineralRow} className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                      <PlusCircle size={16} /> Add Mineral
                    </button>
                  </div>
                </div>
                
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <th className="px-5 py-3 text-left font-black">Mineral Species</th>
                        <th className="px-5 py-3 text-right font-black w-32">Volumetric %</th>
                        <th className="px-5 py-3 text-center w-16">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(currentEntry.thinSection.mineralList || []).map((m, i) => (
                        <tr key={i} className="group/row hover:bg-emerald-50/20 transition-colors">
                          <td className="p-0 border-r border-slate-50">
                            <MineralAutocomplete value={m.name} onChange={(val) => updateMineralRow(i, 'name', val)} />
                          </td>
                          <td className="p-0 border-r border-slate-50 w-32">
                            <input 
                              type="number" value={m.percentage} 
                              onChange={e => updateMineralRow(i, 'percentage', parseInt(e.target.value) || 0)} 
                              className="w-full h-full bg-transparent border-none px-5 py-3 text-sm text-right font-mono font-bold text-emerald-700 outline-none" 
                            />
                          </td>
                          <td className="p-2 text-center w-16">
                            <button onClick={() => removeMineralRow(i)} className="text-slate-300 hover:text-red-500">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isAnalyzing === 'thin' ? 'animate-pulse opacity-60' : ''}`}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Sun size={14} className="text-amber-500" />
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">PPL Observations</label>
                  </div>
                  <textarea 
                    value={currentEntry.thinSection.pplFeatures} 
                    placeholder="Describe pleochroism, relief..."
                    onChange={e => setCurrentEntry({...currentEntry, thinSection: {...currentEntry.thinSection, pplFeatures: e.target.value}})} 
                    className="w-full border border-slate-100 bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 min-h-[120px] resize-none" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap size={14} className="text-emerald-500" />
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">XPL Observations</label>
                  </div>
                  <textarea 
                    value={currentEntry.thinSection.xplFeatures} 
                    placeholder="Describe interference colors..."
                    onChange={e => setCurrentEntry({...currentEntry, thinSection: {...currentEntry.thinSection, xplFeatures: e.target.value}})} 
                    className="w-full border border-slate-100 bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 min-h-[120px] resize-none" 
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-2 pb-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Component size={16} className="text-emerald-700" />
                        <h4 className="text-xs font-black text-emerald-800 uppercase tracking-[0.1em]">Dickinson Classification</h4>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {['q', 'f', 'l'].map(k => (
                        <div key={k}>
                          <label className="block text-[9px] font-black uppercase text-emerald-900 mb-1 opacity-60">{k === 'q' ? 'Quartz' : k === 'f' ? 'Feldspar' : 'Lithics'}</label>
                          <input 
                            type="number" readOnly value={(currentEntry.thinSection.qfl as any)[k] || 0} 
                            className="w-full bg-white border border-emerald-200 rounded-xl p-3 text-sm font-black text-emerald-800 outline-none shadow-sm cursor-not-allowed" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Synthesis & Interpretation</label>
                      <textarea 
                        value={currentEntry.interpretation} 
                        onChange={e => setCurrentEntry({...currentEntry, interpretation: e.target.value})}
                        placeholder="Comprehensive synthesis..." 
                        className="w-full border border-slate-200 rounded-2xl px-5 py-5 text-sm min-h-[180px] leading-relaxed outline-none focus:ring-2 focus:ring-emerald-500/10 bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="sticky top-24">
                    <QFLTernaryDiagram 
                      q={currentEntry.thinSection.qfl?.q || 0} 
                      f={currentEntry.thinSection.qfl?.f || 0} 
                      l={currentEntry.thinSection.qfl?.l || 0} 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="p-6 bg-white border-b border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Field Notebook</h2>
          <p className="text-sm text-slate-400">Petrological Sample Database</p>
        </div>
        <button onClick={handleStartNew} className="bg-emerald-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-200">
          <Plus size={20} /> New Observation
        </button>
      </header>
      <div className="p-6 max-w-4xl mx-auto w-full flex-1 overflow-y-auto">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Filter observations..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          {filteredEntries.map(entry => (
            <div key={entry.id} onClick={() => handleView(entry)} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all cursor-pointer group flex flex-col h-full">
              <div className="flex justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-100 shadow-inner bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    {entry.image ? (
                      <img src={`data:image/jpeg;base64,${entry.image}`} className="w-full h-full object-cover" alt="Thumbnail" />
                    ) : entry.thinSectionImage ? (
                      <img src={`data:image/jpeg;base64,${entry.thinSectionImage}`} className="w-full h-full object-cover" alt="Thumbnail" />
                    ) : (
                      <Database size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-emerald-700">{entry.sampleId}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{entry.date}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                {entry.interpretation && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 italic leading-relaxed">"{entry.interpretation}"</p>
                )}
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                <span className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform">View Details <ArrowRight size={10} /></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FieldNotebook;
