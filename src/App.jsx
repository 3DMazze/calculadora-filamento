import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Layers, 
  History, 
  Settings, 
  Plus, 
  Trash2, 
  LogOut, 
  Save, 
  Zap, 
  Wrench, 
  UserCheck, 
  TrendingUp, 
  Percent, 
  PackageCheck,
  Check
} from 'lucide-react';

export default function App() {
  // --- NAVEGAÇÃO DE ABAS ---
  const [activeTab, setActiveTab] = useState('calcular');

  // --- ABA: AJUSTES (PARÂMETROS GLOBAIS) ---
  const [settings, setSettings] = useState({
    userNom: 'Rodrigo Mazze',
    userEmail: 'rodrigo.lokky@gmail.com',
    energyCost: 1.25,        // R$/kWh
    printerPower: 200,       // Watts
    wearCost: 0.50,          // R$/h
    laborCost: 0.00,         // Valor da Mão de Obra
    laborType: 'fixed',      // 'fixed' (Valor Fixo) ou 'hourly' (Por Hora)
    packagingCost: 2.00,     // R$ por embalagem/kit
    defaultMargin: 100,      // %
    defaultTax: 6            // %
  });

  // --- ABA: FILAMENTOS ---
  const [filaments, setFilaments] = useState([
    { id: 1, name: 'PLA VERMELHO', type: 'PLA', pricePerKg: 89.00, details: 'Vermelho • 1kg' },
    { id: 2, name: 'PETG LARANJA', type: 'PETG', pricePerKg: 110.85, details: 'Preto • 1kg' },
    { id: 3, name: 'PETG BRANCO', type: 'PETG', pricePerKg: 76.90, details: 'Branco • 1kg' },
    { id: 4, name: 'PETG PRETO', type: 'PETG', pricePerKg: 76.90, details: 'Preto • 1kg' },
  ]);

  // Form de novo filamento
  const [newFilamentName, setNewFilamentName] = useState('');
  const [newFilamentType, setNewFilamentType] = useState('PLA');
  const [newFilamentPrice, setNewFilamentPrice] = useState('89.00');

  // --- ABA: CALCULADORA (ORÇAMENTO) ---
  const [projectName, setProjectName] = useState('Dragão');
  const [selectedFilamentId, setSelectedFilamentId] = useState(1);
  const [gramsPerUnit, setGramsPerUnit] = useState(200);
  const [timePerUnitHours, setTimePerUnitHours] = useState(4);
  const [kitQuantity, setKitQuantity] = useState(10);
  const [kitTotalTimeHours, setKitTotalTimeHours] = useState(15); // Ex: 1 unid = 4h, mas kit com 10 = 15h
  const [marginPercent, setMarginPercent] = useState(200);
  const [taxPercent, setTaxPercent] = useState(6);

  // --- ABA: HISTÓRICO ---
  const [history, setHistory] = useState([
    {
      id: 1,
      name: 'Maçã',
      date: '03/09/2026',
      filament: 'PLA VERMELHO',
      grams: 1100,
      margin: 270,
      totalPrice: 560.45
    }
  ]);

  // --- MOTOR DE CÁLCULO REATIVO ---
  const currentFilament = filaments.find(f => f.id === selectedFilamentId) || filaments[0];

  // Quantidades totais do Kit
  const totalGramsKit = (parseFloat(gramsPerUnit) || 0) * (parseInt(kitQuantity) || 1);
  const totalHoursKit = parseFloat(kitTotalTimeHours) || 0;

  // Custos do Kit
  const filamentCostKit = (totalGramsKit / 1000) * (currentFilament ? currentFilament.pricePerKg : 0);
  const energyKWhKit = ((parseFloat(settings.printerPower) || 0) / 1000) * totalHoursKit;
  const energyCostKit = energyKWhKit * (parseFloat(settings.energyCost) || 0);
  const wearCostKit = totalHoursKit * (parseFloat(settings.wearCost) || 0);
  
  // Mão de obra (Fixo vs Hora)
  const laborCostKit = settings.laborType === 'fixed' 
    ? (parseFloat(settings.laborCost) || 0)
    : (parseFloat(settings.laborCost) || 0) * totalHoursKit;

  const packagingCostKit = (parseFloat(settings.packagingCost) || 0);

  // Custo Base Total do Kit
  const baseCostKit = filamentCostKit + energyCostKit + wearCostKit + laborCostKit + packagingCostKit;
  
  // Margem de Lucro e Imposto
  const marginValueKit = baseCostKit * ((parseFloat(marginPercent) || 0) / 100);
  const subtotalWithMargin = baseCostKit + marginValueKit;
  const taxValueKit = subtotalWithMargin * ((parseFloat(taxPercent) || 0) / 100);
  
  // Valores Finais
  const finalKitPrice = subtotalWithMargin + taxValueKit;
  const finalUnitPrice = (parseInt(kitQuantity) || 1) > 0 ? finalKitPrice / parseInt(kitQuantity) : finalKitPrice;

  // Funções de Ação
  const handleAddFilament = (e) => {
    e.preventDefault();
    if (!newFilamentName) return;
    const newItem = {
      id: Date.now(),
      name: newFilamentName.toUpperCase(),
      type: newFilamentType,
      pricePerKg: parseFloat(newFilamentPrice) || 0,
      details: `${newFilamentType} • 1kg`
    };
    setFilaments([...filaments, newItem]);
    setNewFilamentName('');
  };

  const handleDeleteFilament = (id) => {
    setFilaments(filaments.filter(f => f.id !== id));
  };

  const handleSaveBudget = () => {
    const newEntry = {
      id: Date.now(),
      name: projectName || 'Projeto Sem Nome',
      date: new Date().toLocaleDateString('pt-BR'),
      filament: currentFilament ? currentFilament.name : 'N/A',
      grams: totalGramsKit,
      margin: marginPercent,
      totalPrice: finalKitPrice
    };
    setHistory([newEntry, ...history]);
    alert('Orçamento salvo com sucesso no Histórico!');
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-slate-100 font-sans flex flex-col justify-between select-none">
      
      {/* CONTEÚDO PRINCIPAL DE ACORDO COM A ABA */}
      <div className="flex-1 pb-24">

        {/* ==================== ABA 1: CALCULADORA ==================== */}
        {activeTab === 'calcular' && (
          <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            <header className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-[#ff5500] tracking-widest uppercase">Novo Orçamento</p>
                <h1 className="text-2xl font-black tracking-tight text-white">Calculadora</h1>
              </div>
              <button onClick={() => setActiveTab('ajustes')} className="p-2.5 bg-[#181818] border border-neutral-800 rounded-xl hover:bg-neutral-800 transition">
                <Settings className="w-5 h-5 text-[#ff5500]" />
              </button>
            </header>

            {/* NOME DO PROJETO */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">Nome do Projeto</label>
              <input 
                type="text" 
                value={projectName} 
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-[#141414] border border-neutral-800 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-[#ff5500]"
              />
            </div>

            {/* SELEÇÃO DE FILAMENTO */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">Filamento</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {filaments.map((f) => {
                  const isSelected = f.id === selectedFilamentId;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFilamentId(f.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected 
                          ? 'bg-[#1a0f0a] border-[#ff5500] text-white shadow-lg shadow-[#ff5500]/10' 
                          : 'bg-[#141414] border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <p className={`text-xs font-black ${isSelected ? 'text-[#ff5500]' : 'text-white'}`}>{f.name}</p>
                      <p className="text-[10px] mt-0.5 text-neutral-400">R$ {f.pricePerKg.toFixed(2).replace('.', ',')}/kg</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GRAMAS & QUANTIDADE DO KIT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">Gramas Usadas (Por Peça)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={gramsPerUnit} 
                    onChange={(e) => setGramsPerUnit(e.target.value)}
                    className="w-full bg-[#141414] border border-neutral-800 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-[#ff5500]"
                  />
                  <span className="absolute right-4 top-3.5 text-xs text-neutral-500 font-bold">g</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#ff5500] tracking-wider uppercase flex justify-between">
                  <span>Quantidade (KIT)</span>
                  <span className="text-neutral-500">Total: {totalGramsKit}g</span>
                </label>
                <input 
                  type="number" 
                  value={kitQuantity} 
                  onChange={(e) => setKitQuantity(e.target.value)}
                  className="w-full bg-[#141414] border border-[#ff5500]/40 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#ff5500]"
                />
              </div>
            </div>

            {/* TEMPO INDIVIDUAL VS TEMPO DO KIT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">Tempo de Impressão (1 Peça)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={timePerUnitHours} 
                    onChange={(e) => setTimePerUnitHours(e.target.value)}
                    className="w-full bg-[#141414] border border-neutral-800 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-[#ff5500]"
                  />
                  <span className="absolute right-4 top-3.5 text-xs text-neutral-500 font-bold">horas</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#ff5500] tracking-wider uppercase flex justify-between">
                  <span>Tempo Total do Kit ({kitQuantity}x)</span>
                  <span className="text-neutral-500">Otimizado</span>
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={kitTotalTimeHours} 
                    onChange={(e) => setKitTotalTimeHours(e.target.value)}
                    className="w-full bg-[#141414] border border-[#ff5500]/40 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#ff5500]"
                  />
                  <span className="absolute right-4 top-3.5 text-xs text-neutral-500 font-bold">horas</span>
                </div>
              </div>
            </div>

            {/* MARGEM DE LUCRO */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">Margem de Lucro</label>
              <div className="grid grid-cols-4 gap-2">
                {[50, 100, 150, 200].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMarginPercent(m)}
                    className={`py-3 rounded-xl border text-xs font-black transition-all ${
                      marginPercent === m 
                        ? 'bg-[#ff5500] border-[#ff5500] text-white shadow-lg shadow-[#ff5500]/20' 
                        : 'bg-[#141414] border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    {m}%
                  </button>
                ))}
              </div>
            </div>

            {/* INPUTS MANUAIS DE MARGEM E IMPOSTO */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">Margem Customizada %</label>
                <input 
                  type="number" 
                  value={marginPercent} 
                  onChange={(e) => setMarginPercent(e.target.value)}
                  className="w-full bg-[#141414] border border-neutral-800 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-[#ff5500]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">Imposto %</label>
                <input 
                  type="number" 
                  value={taxPercent} 
                  onChange={(e) => setTaxPercent(e.target.value)}
                  className="w-full bg-[#141414] border border-neutral-800 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-[#ff5500]"
                />
              </div>
            </div>

            {/* DETALHAMENTO DE CUSTOS DO KIT */}
            <div className="bg-[#141414] border border-neutral-800/80 rounded-2xl p-5 space-y-3">
              <p className="text-[11px] font-bold text-[#ff5500] tracking-widest uppercase mb-1">Detalhamento ({kitQuantity}x Kits)</p>
              
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Filamento ({totalGramsKit}g)</span>
                <span className="font-bold text-white">R$ {filamentCostKit.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Energia ({totalHoursKit}h)</span>
                <span className="font-bold text-white">R$ {energyCostKit.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Desgaste de Máquina</span>
                <span className="font-bold text-white">R$ {wearCostKit.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Embalagem</span>
                <span className="font-bold text-white">R$ {packagingCostKit.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Mão de Obra ({settings.laborType === 'fixed' ? 'Fixo' : 'Por hora'})</span>
                <span className="font-bold text-white">R$ {laborCostKit.toFixed(2).replace('.', ',')}</span>
              </div>

              <div className="border-t border-neutral-800 pt-3 flex justify-between text-sm font-black text-white">
                <span>Custo base total</span>
                <span className="text-white">R$ {baseCostKit.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-400">
                <span>Margem ({marginPercent}%)</span>
                <span>R$ {marginValueKit.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-400">
                <span>Imposto ({taxPercent}%)</span>
                <span>R$ {taxValueKit.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            {/* CARDS DE VALOR FINAL & BOTAO SALVAR */}
            <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">UNITÁRIO</p>
                  <p className="text-2xl font-black text-white mt-1">R$ {finalUnitPrice.toFixed(2).replace('.', ',')}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#ff5500] uppercase tracking-wider">KIT ({kitQuantity}x)</p>
                  <p className="text-2xl font-black text-[#ff5500] mt-1">R$ {finalKitPrice.toFixed(2).replace('.', ',')}</p>
                </div>
              </div>

              <button 
                onClick={handleSaveBudget}
                className="w-full bg-[#ff5500] hover:bg-[#e04b00] active:scale-[0.99] transition text-white font-black py-4 rounded-xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#ff5500]/20"
              >
                <Save className="w-4 h-4" /> Salvar Orçamento
              </button>
            </div>
          </div>
        )}

        {/* ==================== ABA 2: FILAMENTOS ==================== */}
        {activeTab === 'filamentos' && (
          <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            <header className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-[#ff5500] tracking-widest uppercase">Materiais</p>
                <h1 className="text-2xl font-black tracking-tight text-white">Filamentos</h1>
              </div>
            </header>

            {/* LISTA DE FILAMENTOS */}
            <div className="space-y-3">
              {filaments.map((f) => (
                <div key={f.id} className="bg-[#141414] border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="bg-[#ff5500]/10 text-[#ff5500] text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-[#ff5500]/20">
                      {f.type}
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-white">{f.name}</h3>
                      <p className="text-xs text-neutral-500">{f.details}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-black text-[#ff5500]">R$ {f.pricePerKg.toFixed(2).replace('.', ',')}</p>
                      <p className="text-[10px] text-neutral-500">/ kg</p>
                    </div>
                    <button onClick={() => handleDeleteFilament(f.id)} className="text-neutral-600 hover:text-red-500 p-2 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* FORMULARIO NOVO FILAMENTO */}
            <form onSubmit={handleAddFilament} className="bg-[#141414] border border-neutral-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-black text-white">Novo filamento</h2>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Nome</label>
                <input 
                  type="text" 
                  placeholder="Ex: PLA Preto Premium"
                  value={newFilamentName}
                  onChange={(e) => setNewFilamentName(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff5500]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Material</label>
                <div className="flex flex-wrap gap-2">
                  {['PLA', 'ABS', 'PETG', 'TPU', 'Nylon', 'ASA'].map((mat) => (
                    <button
                      type="button"
                      key={mat}
                      onClick={() => setNewFilamentType(mat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        newFilamentType === mat 
                          ? 'bg-[#ff5500] border-[#ff5500] text-white' 
                          : 'bg-[#0d0d0d] border-neutral-800 text-neutral-400'
                      }`}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Preço por KG (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={newFilamentPrice}
                  onChange={(e) => setNewFilamentPrice(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff5500]"
                />
              </div>

              <button type="submit" className="w-full bg-[#ff5500] hover:bg-[#e04b00] text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Adicionar Filamento
              </button>
            </form>
          </div>
        )}

        {/* ==================== ABA 3: HISTÓRICO ==================== */}
        {activeTab === 'historico' && (
          <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            <header className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-[#ff5500] tracking-widest uppercase">Orçamentos</p>
                <h1 className="text-2xl font-black tracking-tight text-white">Histórico</h1>
              </div>
            </header>

            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="bg-[#141414] border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white">{item.name}</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">{item.date} • {item.filament} • {item.grams}g</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black px-2 py-0.5 rounded-md">
                      {item.margin}%
                    </span>
                    <p className="text-base font-black text-[#ff5500] mt-1">R$ {item.totalPrice.toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== ABA 4: AJUSTES ==================== */}
        {activeTab === 'ajustes' && (
          <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            <header className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-[#ff5500] tracking-widest uppercase">Parâmetros</p>
                <h1 className="text-2xl font-black tracking-tight text-white">Ajustes</h1>
              </div>
            </header>

            {/* CARD DE USUÁRIO */}
            <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#ff5500] rounded-xl flex items-center justify-center font-black text-white text-base">
                  {settings.userNom.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">{settings.userNom}</h3>
                  <p className="text-xs text-neutral-500">{settings.userEmail}</p>
                </div>
              </div>
              <button className="p-2 text-neutral-500 hover:text-white transition">
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* CAMPOS DE CUSTOS OPERACIONAIS */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Custos Operacionais</p>

              {/* Custo Energia */}
              <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#ff5500]/10 rounded-xl text-[#ff5500]">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Custo energia</h4>
                    <p className="text-[10px] text-neutral-500">R$/kWh</p>
                  </div>
                </div>
                <input 
                  type="number" 
                  step="0.01"
                  value={settings.energyCost}
                  onChange={(e) => setSettings({...settings, energyCost: e.target.value})}
                  className="w-24 bg-[#0d0d0d] border border-neutral-800 rounded-xl px-3 py-2 text-right text-xs font-bold text-white focus:outline-none focus:border-[#ff5500]"
                />
              </div>

              {/* Potência Impressora */}
              <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#ff5500]/10 rounded-xl text-[#ff5500]">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Potência impressora</h4>
                    <p className="text-[10px] text-neutral-500">Watts</p>
                  </div>
                </div>
                <input 
                  type="number" 
                  value={settings.printerPower}
                  onChange={(e) => setSettings({...settings, printerPower: e.target.value})}
                  className="w-24 bg-[#0d0d0d] border border-neutral-800 rounded-xl px-3 py-2 text-right text-xs font-bold text-white focus:outline-none focus:border-[#ff5500]"
                />
              </div>

              {/* Desgaste por Hora */}
              <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#ff5500]/10 rounded-xl text-[#ff5500]">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Desgaste / hora</h4>
                    <p className="text-[10px] text-neutral-500">R$/h</p>
                  </div>
                </div>
                <input 
                  type="number" 
                  step="0.10"
                  value={settings.wearCost}
                  onChange={(e) => setSettings({...settings, wearCost: e.target.value})}
                  className="w-24 bg-[#0d0d0d] border border-neutral-800 rounded-xl px-3 py-2 text-right text-xs font-bold text-white focus:outline-none focus:border-[#ff5500]"
                />
              </div>

              {/* Embalagem (NOVO CAMPO SOLICITADO) */}
              <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#ff5500]/10 rounded-xl text-[#ff5500]">
                    <PackageCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Custo de Embalagem</h4>
                    <p className="text-[10px] text-neutral-500">R$ por kit/caixa</p>
                  </div>
                </div>
                <input 
                  type="number" 
                  step="0.50"
                  value={settings.packagingCost}
                  onChange={(e) => setSettings({...settings, packagingCost: e.target.value})}
                  className="w-24 bg-[#0d0d0d] border border-neutral-800 rounded-xl px-3 py-2 text-right text-xs font-bold text-white focus:outline-none focus:border-[#ff5500]"
                />
              </div>

              {/* Mão de Obra (MODIFICADO: FIXO OU HORA) */}
              <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#ff5500]/10 rounded-xl text-[#ff5500]">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">Mão de obra</h4>
                      <p className="text-[10px] text-neutral-500">
                        {settings.laborType === 'fixed' ? 'Valor Fixo (R$)' : 'Por Hora (R$/h)'}
                      </p>
                    </div>
                  </div>
                  <input 
                    type="number" 
                    value={settings.laborCost}
                    onChange={(e) => setSettings({...settings, laborCost: e.target.value})}
                    className="w-24 bg-[#0d0d0d] border border-neutral-800 rounded-xl px-3 py-2 text-right text-xs font-bold text-white focus:outline-none focus:border-[#ff5500]"
                  />
                </div>

                {/* Alternador de Modo de Mão de Obra */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-800/60">
                  <button
                    onClick={() => setSettings({...settings, laborType: 'fixed'})}
                    className={`py-1.5 rounded-lg text-[10px] font-bold transition ${
                      settings.laborType === 'fixed' 
                        ? 'bg-[#ff5500] text-white' 
                        : 'bg-[#0d0d0d] text-neutral-400 hover:text-white'
                    }`}
                  >
                    Valor Fixo
                  </button>
                  <button
                    onClick={() => setSettings({...settings, laborType: 'hourly'})}
                    className={`py-1.5 rounded-lg text-[10px] font-bold transition ${
                      settings.laborType === 'hourly' 
                        ? 'bg-[#ff5500] text-white' 
                        : 'bg-[#0d0d0d] text-neutral-400 hover:text-white'
                    }`}
                  >
                    Por Hora (R$/h)
                  </button>
                </div>
              </div>

              {/* Margem Padrão */}
              <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#ff5500]/10 rounded-xl text-[#ff5500]">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Margem padrão</h4>
                    <p className="text-[10px] text-neutral-500">%</p>
                  </div>
                </div>
                <input 
                  type="number" 
                  value={settings.defaultMargin}
                  onChange={(e) => setSettings({...settings, defaultMargin: e.target.value})}
                  className="w-24 bg-[#0d0d0d] border border-neutral-800 rounded-xl px-3 py-2 text-right text-xs font-bold text-white focus:outline-none focus:border-[#ff5500]"
                />
              </div>

              {/* Imposto Padrão */}
              <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#ff5500]/10 rounded-xl text-[#ff5500]">
                    <Percent className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Imposto padrão</h4>
                    <p className="text-[10px] text-neutral-500">%</p>
                  </div>
                </div>
                <input 
                  type="number" 
                  value={settings.defaultTax}
                  onChange={(e) => setSettings({...settings, defaultTax: e.target.value})}
                  className="w-24 bg-[#0d0d0d] border border-neutral-800 rounded-xl px-3 py-2 text-right text-xs font-bold text-white focus:outline-none focus:border-[#ff5500]"
                />
              </div>
            </div>

            <button 
              onClick={() => alert('Ajustes salvos!')}
              className="w-full bg-[#ff5500] hover:bg-[#e04b00] text-white font-black py-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#ff5500]/20"
            >
              <Save className="w-4 h-4" /> Salvar Ajustes
            </button>
          </div>
        )}

      </div>

      {/* BARRA DE NAVEGAÇÃO INFERIOR (BOTTOM NAV) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d]/95 backdrop-blur-md border-t border-neutral-800 py-2.5 px-4 z-50">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          
          <button 
            onClick={() => setActiveTab('calcular')} 
            className={`flex flex-col items-center gap-1 py-1 transition ${
              activeTab === 'calcular' ? 'text-[#ff5500]' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Calculator className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-wider">Calcular</span>
          </button>

          <button 
            onClick={() => setActiveTab('filamentos')} 
            className={`flex flex-col items-center gap-1 py-1 transition ${
              activeTab === 'filamentos' ? 'text-[#ff5500]' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-wider">Filamentos</span>
          </button>

          <button 
            onClick={() => setActiveTab('historico')} 
            className={`flex flex-col items-center gap-1 py-1 transition ${
              activeTab === 'historico' ? 'text-[#ff5500]' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-wider">Histórico</span>
          </button>

          <button 
            onClick={() => setActiveTab('ajustes')} 
            className={`flex flex-col items-center gap-1 py-1 transition ${
              activeTab === 'ajustes' ? 'text-[#ff5500]' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-wider">Ajustes</span>
          </button>

        </div>
      </nav>

    </div>
  );
}
