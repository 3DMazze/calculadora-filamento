import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Lock, 
  Download, 
  Zap, 
  Settings, 
  Cpu, 
  ArrowRight,
  ShieldAlert,
  Layers
} from 'lucide-react';

// --- BANCO DE DADOS DE HARDWARE E MATERIAIS ---
const MATERIALS = {
  PLA: { name: 'PLA', density: 1.24, maxTemp: 220 },
  PETG: { name: 'PETG', density: 1.27, maxTemp: 240 },
  ABS: { name: 'ABS', density: 1.04, maxTemp: 250 },
  TPU: { name: 'TPU (95A)', density: 1.21, maxTemp: 230 },
  PACF: { name: 'PA-CF (Nylon Carbon)', density: 1.18, maxTemp: 280 }
};

const HOTENDS = {
  v6: { name: 'E3D V6 / Stock Creality', maxFlow: 12 },
  bambuStock: { name: 'Bambu Lab Stock (X1C/P1P)', maxFlow: 21 },
  volcano: { name: 'E3D Volcano', maxFlow: 25 },
  rapido: { name: 'Phaetus Rapido HF', maxFlow: 35 },
  cht: { name: 'Bondtech CHT / High Flow', maxFlow: 38 }
};

export default function FilamentRateCalculator() {
  // --- ESTADOS DO USUÁRIO ---
  const [userPlan, setUserPlan] = useState('free'); // 'free' ou 'pro'
  
  // Parametros de Entrada
  const [nozzleDiameter, setNozzleDiameter] = useState(0.4);
  const [layerHeight, setLayerHeight] = useState(0.2);
  const [lineWidth, setLineWidth] = useState(0.42);
  const [printSpeed, setPrintSpeed] = useState(120);
  const [selectedMaterial, setSelectedMaterial] = useState('PLA');
  const [selectedHotend, setSelectedHotend] = useState('bambuStock');
  const [customMaxFlow, setCustomMaxFlow] = useState(21);

  // --- MOTOR DE CÁLCULO MATEMÁTICO ---
  const calculations = useMemo(() => {
    const h = parseFloat(layerHeight);
    const w = parseFloat(lineWidth);
    const v = parseFloat(printSpeed);
    const density = MATERIALS[selectedMaterial].density;
    const maxFlowLimit = HOTENDS[selectedHotend] ? HOTENDS[selectedHotend].maxFlow : parseFloat(customMaxFlow);

    // 1. Área de Corte Transversal Realista (Fórmula de Fatiadores: Stadium/Oval Achatado)
    // Area = (w - h) * h + PI * (h / 2)^2
    const crossSectionalArea = ((w - h) * h) + (Math.PI * Math.pow(h / 2, 2));

    // 2. Fluxo Volumétrico (mm³/s)
    const volumetricFlow = crossSectionalArea * v;

    // 3. Fluxo Mássico (g/h) -> (mm³/s * g/cm³ * 3600) / 1000
    const massFlowPerHour = (volumetricFlow * density * 3600) / 1000;

    // 4. Velocidade Máxima Teórica antes de Under-Extrusion
    const maxTheoreticalSpeed = maxFlowLimit / crossSectionalArea;

    // 5. Análise de Carga do Hotend (%)
    const loadPercentage = (volumetricFlow / maxFlowLimit) * 100;

    // 6. Verificação de Integridade Geométrica
    const isLayerHeightValid = h <= nozzleDiameter * 0.8;
    const isLineWidthValid = w >= nozzleDiameter;

    return {
      crossSectionalArea: crossSectionalArea.toFixed(4),
      volumetricFlow: volumetricFlow.toFixed(2),
      massFlowPerHour: massFlowPerHour.toFixed(1),
      maxTheoreticalSpeed: maxTheoreticalSpeed.toFixed(0),
      loadPercentage: loadPercentage.toFixed(1),
      maxFlowLimit,
      isLayerHeightValid,
      isLineWidthValid
    };
  }, [layerHeight, lineWidth, printSpeed, selectedMaterial, selectedHotend, customMaxFlow, nozzleDiameter]);

  // Status de Risco de Sub-extrusão
  const getStatus = () => {
    const load = parseFloat(calculations.loadPercentage);
    if (load > 100) return { label: 'CRÍTICO: Sub-extrusão Severa', color: 'bg-red-500/10 text-red-400 border-red-500/30' };
    if (load > 85) return { label: 'ALERTA: Próximo ao Limite Térmico', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' };
    return { label: 'OPERAÇÃO SEGURA', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
  };

  const status = getStatus();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      {/* HEADER */}
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-indigo-500" />
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
              Volumetric Flow Rate Engine
            </h1>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">
              v2.0 Real Geometry
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Calculadora de precisão geométrica e limite de extrusão para manufatura aditiva.
          </p>
        </div>

        {/* TOGGLE PLANO (Simulação) */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-1.5 rounded-lg">
          <button
            onClick={() => setUserPlan('free')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              userPlan === 'free' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Plano FREE
          </button>
          <button
            onClick={() => setUserPlan('pro')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
              userPlan === 'pro' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-indigo-400 hover:text-indigo-300'
            }`}
          >
            <Zap className="h-3 w-3" /> Plano PRO
          </button>
        </div>
      </header>

      {/* DASHBOARD MAIN GRID */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PAINEL DE ENTRADA (COLUNA ESQUERDA - 7 COLS) */}
        <section className="lg:col-span-7 space-y-6">
          
          {/* HARDWARE & MATERIAL PRESETS */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-indigo-400" /> Presets de Hardware & Material
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Hotend / Extrusora</label>
                <select
                  value={selectedHotend}
                  onChange={(e) => setSelectedHotend(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {Object.entries(HOTENDS).map(([key, item]) => (
                    <option key={key} value={key}>{item.name} (~{item.maxFlow} mm³/s)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Filamento (Polímero)</label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {Object.entries(MATERIALS).map(([key, item]) => (
                    <option key={key} value={key}>{item.name} ({item.density} g/cm³)</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* PARÂMETROS GEOMÉTRICOS E VELOCIDADE */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Settings className="h-4 w-4 text-indigo-400" /> Parâmetros de Impressão
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Diâmetro do Bico (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={nozzleDiameter}
                  onChange={(e) => setNozzleDiameter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Altura da Camada (mm)</label>
                <input
                  type="number"
                  step="0.02"
                  value={layerHeight}
                  onChange={(e) => setLayerHeight(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Largura da Linha (mm)</label>
                <input
                  type="number"
                  step="0.01"
                  value={lineWidth}
                  onChange={(e) => setLineWidth(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Velocidade (mm/s)</label>
                <input
                  type="number"
                  step="5"
                  value={printSpeed}
                  onChange={(e) => setPrintSpeed(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* ALERTAS DE VALIDAÇÃO TÉCNICA */}
            {(!calculations.isLayerHeightValid || !calculations.isLineWidthValid) && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2 text-xs text-amber-300">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  {!calculations.isLayerHeightValid && <p>• Altura da camada excede 80% do diâmetro do bico (Risco de baixa adesão).</p>}
                  {!calculations.isLineWidthValid && <p>• Largura de linha menor que o diâmetro do bico (Geometria instável).</p>}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* PAINEL DE RESULTADOS E DECISÃO (COLUNA DIREITA - 5 COLS) */}
        <section className="lg:col-span-5 space-y-6">
          
          {/* CARDS DE OUTPUTS */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Análise de Performance</h2>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-mono font-semibold ${status.color}`}>
                {status.label}
              </span>
            </div>

            {/* BARRA DE CAPACIDADE TÉRMICA */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-400">Uso da Capacidade do Hotend</span>
                <span className={parseFloat(calculations.loadPercentage) > 100 ? 'text-red-400 font-bold' : 'text-slate-200'}>
                  {calculations.loadPercentage}%
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    parseFloat(calculations.loadPercentage) > 100 ? 'bg-red-500' : parseFloat(calculations.loadPercentage) > 85 ? 'bg-yellow-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(parseFloat(calculations.loadPercentage), 100)}%` }}
                />
              </div>
            </div>

            {/* METRICAS CHAVE */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                <span className="text-xs text-slate-400 block mb-1">Vazão Volumétrica</span>
                <span className="text-2xl font-bold font-mono text-white">{calculations.volumetricFlow}</span>
                <span className="text-xs text-slate-500 ml-1">mm³/s</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                <span className="text-xs text-slate-400 block mb-1">Consumo Mássico</span>
                <span className="text-2xl font-bold font-mono text-white">{calculations.massFlowPerHour}</span>
                <span className="text-xs text-slate-500 ml-1">g/h</span>
              </div>
            </div>

            {/* SOLVER INVERSO */}
            <div className="bg-indigo-950/30 border border-indigo-500/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold mb-1">
                <Zap className="h-4 w-4" /> Velocidade Máxima Segura Recomenadada
              </div>
              <div className="text-3xl font-extrabold font-mono text-indigo-200">
                {calculations.maxTheoreticalSpeed} <span className="text-sm font-normal text-indigo-400">mm/s</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Limite exato para manter o fluxo abaixo de {calculations.maxFlowLimit} mm³/s no hotend selecionado.
              </p>
            </div>
          </div>

          {/* RECURSOS RESTRITOS / MONETIZAÇÃO (PAYWALL) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 relative overflow-hidden">
            {userPlan === 'free' && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                <Lock className="h-8 w-8 text-indigo-400 mb-2" />
                <h3 className="text-base font-bold text-white">Recursos de Automação PRO</h3>
                <p className="text-xs text-slate-400 mt-1 mb-4 max-w-xs">
                  Exporte perfis direto para OrcaSlicer/Bambu Studio e gere G-Code de calibração automática.
                </p>
                <button
                  onClick={() => setUserPlan('pro')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  Desbloquear Plano PRO <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Download className="h-4 w-4 text-indigo-400" /> Exportação & Automação
            </h2>

            <div className="space-y-3">
              <button className="w-full bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-medium py-2.5 px-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <span>Exportar Perfil OrcaSlicer / Bambu Studio (`.json`)</span>
                <Download className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button className="w-full bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-medium py-2.5 px-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <span>Gerar G-Code de Torre de Vazão Volumétrica</span>
                <Layers className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
