import React, { useState, useMemo } from 'react';
import { Target, Globe, Sparkles, Info, Shield, Zap, Mountain, ChevronRight, BookOpen } from 'lucide-react';

interface QFLTernaryDiagramProps {
  q: number;
  f: number;
  l: number;
  size?: number;
}

interface Region {
  id: string;
  name: string;
  description: string;
  technicalNote: string;
  points: string[];
  fill: string;
  stroke: string;
  category: 'Continental' | 'Arc' | 'Orogen';
  labelPos: { x: number, y: number };
}

const QFLTernaryDiagram: React.FC<QFLTernaryDiagramProps> = ({ q = 0, f = 0, l = 0, size = 320 }) => {
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);
  const [isPointHovered, setIsPointHovered] = useState(false);

  // Normalize values to 100% for plotting
  const total = q + f + l;
  const nQ = total > 0 ? (q / total) * 100 : 0;
  const nF = total > 0 ? (f / total) * 100 : 0;
  const nL = total > 0 ? (l / total) * 100 : 0;

  // Triangle geometry constants
  const padding = 60;
  const innerSize = size - padding * 2;
  const h = (Math.sqrt(3) / 2) * innerSize;
  
  // Vertices coordinates
  const apexQ = { x: size / 2, y: padding };
  const baseF = { x: padding, y: padding + h };
  const baseL = { x: size - padding, y: padding + h };

  // Helper to map ternary (q, f, l) to Cartesian (x, y)
  const getXYCoords = (tQ: number, tF: number, tL: number) => {
    const sum = tQ + tF + tL;
    const sQ = sum > 0 ? (tQ / sum) * 100 : 0;
    const sL = sum > 0 ? (tL / sum) * 100 : 0;
    
    const x = padding + (sL * innerSize + (100 - sQ - sL) * 0 + sQ * (innerSize / 2)) / 100;
    const y = padding + ((100 - sQ) * h) / 100;
    return { x, y };
  };

  const getXYString = (tQ: number, tF: number, tL: number) => {
    const { x, y } = getXYCoords(tQ, tF, tL);
    return `${x},${y}`;
  };

  // Define Major Blocks for background overlays
  const majorBlocks = useMemo(() => [
    {
      id: 'Continental',
      name: 'Continental Block',
      points: [getXYString(100, 0, 0), getXYString(35, 65, 0), getXYString(35, 50, 15), getXYString(70, 15, 15), getXYString(88, 6, 6)],
      color: '#3b82f6', // Blue
      gradient: 'grad-continental',
      labelPos: getXYCoords(80, 16, 4)
    },
    {
      id: 'Arc',
      name: 'Magmatic Arc',
      points: [getXYString(0, 100, 0), getXYString(0, 0, 100), getXYString(20, 40, 40), getXYString(35, 50, 15), getXYString(35, 65, 0)],
      color: '#ef4444', // Red
      gradient: 'grad-arc',
      labelPos: getXYCoords(10, 50, 40)
    },
    {
      id: 'Orogen',
      name: 'Recycled Orogen',
      points: [getXYString(100, 0, 0), getXYString(88, 6, 6), getXYString(70, 15, 15), getXYString(35, 50, 15), getXYString(20, 40, 40), getXYString(0, 0, 100)],
      color: '#10b981', // Emerald
      gradient: 'grad-orogen',
      labelPos: getXYCoords(50, 2, 48)
    }
  ], [innerSize, h]);

  // Sub-Regions with high-contrast geological colors and detailed scientific descriptions
  const subRegions = useMemo<Region[]>(() => [
    {
      id: 'craton',
      name: 'Cratonic Interior',
      category: 'Continental',
      description: 'Mature, stable craton interiors with low relief and extreme weathering.',
      technicalNote: 'Dominated by monocrystalline quartz (>95%) derived from deeply weathered shields or platforms. Minimal feldspar or lithics remain due to chemical maturation.',
      points: [getXYString(100, 0, 0), getXYString(92, 8, 0), getXYString(88, 6, 6), getXYString(96, 0, 4)],
      fill: '#bae6fd', stroke: '#0369a1',
      labelPos: getXYCoords(96, 2, 2)
    },
    {
      id: 'trans-continent',
      name: 'Transitional Continent',
      category: 'Continental',
      description: 'Stable shelves or continental margins with moderate tectonic activity.',
      technicalNote: 'Reflects moderate quartz and feldspar content. Sourced from crystalline rocks and sedimentary cover of stable platforms undergoing minor uplift.',
      points: [getXYString(92, 8, 0), getXYString(75, 25, 0), getXYString(70, 15, 15), getXYString(88, 6, 6)],
      fill: '#7dd3fc', stroke: '#075985',
      labelPos: getXYCoords(82, 12, 6)
    },
    {
      id: 'basement',
      name: 'Basement Uplift',
      category: 'Continental',
      description: 'Fault-bounded uplifts of crystalline basement in rift or transform settings.',
      technicalNote: 'High feldspar content reflects erosion of unweathered plutonic/metamorphic basement. Common in Laramide-style uplifts or rift shoulders.',
      points: [getXYString(75, 25, 0), getXYString(35, 65, 0), getXYString(35, 50, 15), getXYString(70, 15, 15)],
      fill: '#38bdf8', stroke: '#0c4a6e',
      labelPos: getXYCoords(55, 35, 10)
    },
    {
      id: 'dissected-arc',
      name: 'Disected Arc',
      category: 'Arc',
      description: 'Deeply eroded magmatic arcs revealing their plutonic granitoid cores.',
      technicalNote: 'Moderate quartz and high feldspar (mostly K-feldspar and plagioclase) from granitic batholiths. Represents advanced stages of arc evolution.',
      points: [getXYString(35, 65, 0), getXYString(0, 100, 0), getXYString(0, 70, 30), getXYString(20, 40, 40), getXYString(35, 50, 15)],
      fill: '#fca5a5', stroke: '#991b1b',
      labelPos: getXYCoords(15, 70, 15)
    },
    {
      id: 'trans-arc',
      name: 'Transitional Arc',
      category: 'Arc',
      description: 'Partially eroded arcs with mixed volcanic and plutonic sediment sources.',
      technicalNote: 'Contains a balanced mix of volcanic lithic fragments and feldspars. Typical of arcs with intermediate levels of erosional incision.',
      points: [getXYString(0, 70, 30), getXYString(0, 40, 60), getXYString(15, 25, 60), getXYString(20, 40, 40)],
      fill: '#f87171', stroke: '#7f1d1d',
      labelPos: getXYCoords(10, 45, 45)
    },
    {
      id: 'undissected-arc',
      name: 'Undisected Arc',
      category: 'Arc',
      description: 'Active volcanic chains where erosion has not yet reached deeper levels.',
      technicalNote: 'Sediments are dominated by volcanic lithic fragments (Lvm) and plagioclase. Quartz is rare, typically volcanic in origin (beta-quartz).',
      points: [getXYString(0, 40, 60), getXYString(0, 0, 100), getXYString(10, 0, 90), getXYString(15, 25, 60)],
      fill: '#ef4444', stroke: '#450a0a',
      labelPos: getXYCoords(2, 18, 80)
    },
    {
      id: 'recycled-orogen',
      name: 'Recycled Orogeny',
      category: 'Orogen',
      description: 'Tectonic settings where older strata are uplifted and re-eroded.',
      technicalNote: 'Characterized by high Quartz and Lithics (sedimentary and metamorphic). Derived from fold-thrust belts during continental collisions.',
      points: [getXYString(100, 0, 0), getXYString(96, 0, 4), getXYString(10, 0, 90), getXYString(0, 0, 100), getXYString(20, 40, 40), getXYString(35, 50, 15), getXYString(70, 15, 15), getXYString(88, 6, 6)],
      fill: '#6ee7b7', stroke: '#064e3b',
      labelPos: getXYCoords(45, 5, 50)
    }
  ], [innerSize, h]);

  // Point detection logic
  const activeRegionId = useMemo(() => {
    if (total === 0) return null;
    if (nQ >= 92) return 'craton';
    if (nQ >= 75 && nF > nL) return 'trans-continent';
    if (nF >= 50 && nQ < 60 && nF > nL) return 'basement';
    if (nL >= 75 && nQ < 15) return 'undissected-arc';
    if (nL >= 50 && nQ < 25) return 'trans-arc';
    if (nF > 40 && nQ < 40) return 'dissected-arc';
    return 'recycled-orogen';
  }, [nQ, nF, nL, total]);

  const activeRegion = subRegions.find(r => r.id === activeRegionId);
  const hoveredRegion = subRegions.find(r => r.id === hoveredRegionId);
  const displayRegion = hoveredRegion || activeRegion;
  
  const activeBlockId = activeRegion?.category || null;
  const currentPos = getXYCoords(nQ, nF, nL);

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="flex flex-col lg:flex-row items-start justify-center gap-12 w-full max-w-7xl">
        
        {/* Ternary Diagram Main Window */}
        <div className="relative bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 group/ternary shrink-0" style={{ width: size + 80, height: size + 80 }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible mx-auto">
            <defs>
              <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              
              <filter id="blockActiveGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="12" result="blur" />
                <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.4 0" />
                <feComposite in="SourceGraphic" operator="over" />
              </filter>

              <linearGradient id="grad-continental" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.12" />
              </linearGradient>
              <linearGradient id="grad-arc" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#dc2626" stopOpacity="0.12" />
              </linearGradient>
              <linearGradient id="grad-orogen" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.12" />
              </linearGradient>
            </defs>

            {majorBlocks.map((block) => {
              const isBlockActive = activeBlockId === block.id;
              return (
                <g key={block.id} className="transition-all duration-700">
                  <polygon
                    points={block.points.join(' ')}
                    fill={`url(#${block.gradient})`}
                    fillOpacity={isBlockActive ? 1 : 0.4}
                    stroke={block.color}
                    strokeWidth={isBlockActive ? "3" : "1"}
                    strokeDasharray={isBlockActive ? "none" : "8 4"}
                    strokeOpacity={isBlockActive ? 0.4 : 0.15}
                    className="transition-all duration-700 pointer-events-none"
                    style={{ filter: isBlockActive ? 'url(#blockActiveGlow)' : 'none' }}
                  />
                  <text
                    x={block.labelPos.x}
                    y={block.labelPos.y}
                    textAnchor="middle"
                    className={`text-[9px] font-black uppercase tracking-[0.4em] transition-all duration-700 pointer-events-none ${isBlockActive ? 'fill-slate-900 opacity-30 scale-110' : 'fill-slate-400 opacity-10'}`}
                    style={{ transform: `rotate(-15deg)`, transformOrigin: `${block.labelPos.x}px ${block.labelPos.y}px` }}
                  >
                    {block.name}
                  </text>
                </g>
              );
            })}

            {subRegions.map((region) => {
              const isActive = activeRegionId === region.id;
              const isHovered = hoveredRegionId === region.id;
              return (
                <g key={region.id}>
                  <polygon
                    points={region.points.join(' ')}
                    fill={region.fill}
                    fillOpacity={isActive || isHovered ? 0.85 : 0.05}
                    stroke={region.stroke}
                    strokeWidth={isActive || isHovered ? 2 : 0.5}
                    strokeDasharray={isActive || isHovered ? "none" : "2 2"}
                    strokeOpacity={isActive || isHovered ? 0.7 : 0.1}
                    onMouseEnter={() => setHoveredRegionId(region.id)}
                    onMouseLeave={() => setHoveredRegionId(null)}
                    className="transition-all duration-300 cursor-help"
                  />
                  {(isActive || isHovered) && (
                    <text
                      x={region.labelPos.x}
                      y={region.labelPos.y}
                      textAnchor="middle"
                      className="text-[7px] font-black uppercase tracking-tighter fill-slate-900 opacity-100 pointer-events-none transition-all"
                    >
                      {region.name}
                    </text>
                  )}
                </g>
              );
            })}

            <path
              d={`M ${apexQ.x},${apexQ.y} L ${baseF.x},${baseF.y} L ${baseL.x},${baseL.y} Z`}
              fill="none"
              stroke="#0f172a"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            <g className="font-black text-[11px] fill-slate-800 tracking-widest pointer-events-none">
              <text x={apexQ.x} y={apexQ.y - 18} textAnchor="middle">QUARTZ (Q)</text>
              <text x={baseF.x - 45} y={baseF.y + 20} textAnchor="middle">FELDSPAR (F)</text>
              <text x={baseL.x + 45} y={baseL.y + 20} textAnchor="middle">LITHICS (L)</text>
            </g>

            {total > 0 && (
              <g 
                onMouseEnter={() => setIsPointHovered(true)} 
                onMouseLeave={() => setIsPointHovered(false)}
                className="cursor-crosshair"
              >
                <circle
                  cx={currentPos.x}
                  cy={currentPos.y}
                  r="14"
                  fill="#10b981"
                  fillOpacity="0.2"
                  className="animate-pulse"
                />
                <circle
                  cx={currentPos.x}
                  cy={currentPos.y}
                  r="6"
                  fill="#059669"
                  stroke="white"
                  strokeWidth="3"
                  className="transition-transform duration-500 group-hover/ternary:scale-125 shadow-xl"
                  style={{ filter: 'url(#glow-emerald)' }}
                />
                
                {isPointHovered && (
                  <g transform={`translate(${currentPos.x}, ${currentPos.y - 45})`}>
                    {/* Tooltip Background */}
                    <rect 
                      x="-60" 
                      y="-35" 
                      width="120" 
                      height="40" 
                      rx="12" 
                      fill="#1e293b" 
                      className="shadow-2xl animate-in zoom-in-95 duration-200" 
                    />
                    {/* Region Name */}
                    <text 
                      textAnchor="middle" 
                      y="-18" 
                      className="fill-emerald-400 font-black text-[8px] uppercase tracking-wider"
                    >
                      {activeRegion?.name || 'Unknown Field'}
                    </text>
                    {/* Percentage Values */}
                    <text 
                      textAnchor="middle" 
                      y="-6" 
                      className="fill-white font-black text-[9px] uppercase tracking-widest"
                    >
                      {nQ.toFixed(0)}Q : {nF.toFixed(0)}F : {nL.toFixed(0)}L
                    </text>
                    {/* Tooltip arrow/triangle */}
                    <path d="M -6 5 L 6 5 L 0 12 Z" fill="#1e293b" />
                  </g>
                )}
              </g>
            )}
          </svg>

          {/* Floating Tooltip for contextual metadata (Integrated with hover) */}
          {displayRegion && (
            <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md border border-slate-200 p-6 rounded-[2.5rem] shadow-2xl z-20 max-w-[240px] animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: displayRegion.stroke }}></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Field Data</span>
              </div>
              <h5 className="text-sm font-black text-slate-800 leading-tight mb-2">
                {displayRegion.name}
              </h5>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium italic mb-2">
                {displayRegion.description}
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Dickinson 1985</span>
                 {activeRegionId === displayRegion.id && (
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">Live Detection</span>
                 )}
              </div>
            </div>
          )}
        </div>

        {/* Improved Legend sidebar with dynamic Info Panel */}
        <div className="flex flex-col gap-6 w-full max-w-md">
          {/* Dynamic Technical Panel (Adjacent Info Panel) */}
          <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-xl border border-white/5 h-64 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <BookOpen size={120} />
            </div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-emerald-500/20 rounded-xl">
                  <Info size={18} className="text-emerald-400" />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Technical Brief</h4>
              </div>

              {displayRegion ? (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <h5 className="text-lg font-black text-white mb-2 leading-tight">{displayRegion.name}</h5>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium mb-3">
                    {displayRegion.technicalNote}
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                    <Sparkles size={12} className="text-amber-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">
                      Provenance: {displayRegion.category}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                  <Target size={32} className="mb-3 text-slate-500" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Hover a field or legend item<br/>to view petrographic details
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Legend Items */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
              <Globe size={16} className="text-emerald-500" />
              Provenance Classification
            </h4>
            
            <div className="space-y-8">
              {majorBlocks.map((block) => (
                <div key={block.id} className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    {block.id === 'Continental' ? <Shield size={14} className="text-blue-500" /> : 
                     block.id === 'Arc' ? <Zap size={14} className="text-red-500" /> : 
                     <Mountain size={14} className="text-emerald-500" />}
                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{block.name}</h5>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {subRegions.filter(r => r.category === block.id).map(region => (
                      <button
                        key={region.id}
                        onMouseEnter={() => setHoveredRegionId(region.id)}
                        onMouseLeave={() => setHoveredRegionId(null)}
                        className={`flex items-center justify-between gap-3 p-3 rounded-2xl transition-all text-left group ${
                          hoveredRegionId === region.id || activeRegionId === region.id 
                            ? 'bg-slate-50 shadow-sm border border-slate-100' 
                            : 'hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-lg shrink-0 border border-black/10 shadow-inner transition-transform"
                            style={{ backgroundColor: region.fill, borderColor: region.stroke }}
                          ></div>
                          <div className="flex flex-col">
                            <span className={`text-[11px] font-bold transition-colors ${
                              activeRegionId === region.id ? 'text-emerald-700' : 'text-slate-700'
                            }`}>
                              {region.name}
                            </span>
                            {activeRegionId === region.id && (
                              <span className="text-[8px] font-black uppercase text-emerald-500 tracking-widest animate-pulse">Current Detection</span>
                            )}
                          </div>
                        </div>
                        <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${hoveredRegionId === region.id ? 'translate-x-0' : 'translate-x-2'}`}>
                          <ChevronRight size={14} className="text-emerald-500" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Simplified Interpretation Summary */}
      {activeRegion && (
        <div className="w-full max-w-5xl bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 animate-in slide-in-from-bottom-8 duration-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-emerald-50 rounded-[1.5rem] border border-emerald-100 shadow-inner">
                <Mountain size={28} className="text-emerald-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Observation Synthesis</span>
                <h4 className="text-2xl font-black tracking-tight text-slate-900">{activeRegion.name}</h4>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <div className={`px-6 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${
                activeBlockId === 'Continental' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                activeBlockId === 'Arc' ? 'bg-red-50 border-red-200 text-red-700' :
                'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}>
                {activeRegion.category} Domain
              </div>
              <div className="flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100">
                <Sparkles size={14} className="text-amber-500" />
                <p className="text-[11px] text-slate-600 font-black uppercase tracking-widest">
                  Modal Composition: {nQ.toFixed(0)}%Q · {nF.toFixed(0)}%F · {nL.toFixed(0)}%L
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QFLTernaryDiagram;
