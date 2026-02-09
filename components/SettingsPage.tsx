
import React, { useRef } from 'react';
import { Save, Building, Image as ImageIcon, Link as LinkIcon, Camera, Database, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { AppConfig } from '../types';

interface SettingsPageProps {
  config: AppConfig;
  updateConfig: (config: Partial<AppConfig>) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ config, updateConfig }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateConfig({ logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const isConnected = config.googleSheetsLink && config.googleSheetsLink.includes('docs.google.com/spreadsheets');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-10 border-b border-gray-100 bg-indigo-50/30 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-gray-800">Perfil da Empresa</h3>
            <p className="text-gray-500 font-medium">Personalize a identidade visual e básica da sua hospedagem</p>
          </div>
          <Building className="text-indigo-200" size={48} />
        </div>

        <div className="p-10 space-y-10">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleLogoChange}
              />
              <div className="w-40 h-40 bg-gray-100 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl flex items-center justify-center transition-all group-hover:scale-105">
                {config.logoUrl ? (
                  <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={48} className="text-gray-300" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Camera size={32} className="text-white" />
              </div>
              <p className="text-center mt-3 text-xs font-black text-indigo-500 uppercase tracking-widest">Alterar Logo</p>
            </div>

            <div className="flex-1 space-y-6 w-full">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Building size={14} /> Nome da Empresa
                </label>
                <input 
                  type="text" 
                  value={config.companyName}
                  onChange={e => updateConfig({ companyName: e.target.value })}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-700 text-lg shadow-inner"
                  placeholder="Ex: Pousada Recanto dos Sonhos"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-10 border-b border-gray-100 bg-emerald-50/30 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-gray-800">Banco de Dados Cloud</h3>
            <p className="text-gray-500 font-medium">Conecte o aplicativo à sua planilha do Google Sheets</p>
          </div>
          <Database className="text-emerald-200" size={48} />
        </div>

        <div className="p-10 space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <FileSpreadsheet size={14} className="text-emerald-500" /> Link do Arquivo Google Sheets
            </label>
            <div className="relative">
              <input 
                type="text" 
                value={config.googleSheetsLink}
                onChange={e => updateConfig({ googleSheetsLink: e.target.value })}
                className="w-full p-5 pl-14 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs text-gray-600 shadow-inner"
                placeholder="https://docs.google.com/spreadsheets/d/SEU_ID_AQUI/edit"
              />
              <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            </div>
            
            {isConnected ? (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-left-2">
                <CheckCircle2 size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Link Validado com Sucesso</span>
              </div>
            ) : (
              <div className="text-[10px] text-gray-400 font-medium italic px-4">
                * Certifique-se de que a planilha segue o modelo de colunas padrão do HospedaFinance.
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <LinkIcon size={14} /> Pasta de Anexos (Google Drive)
            </label>
            <input 
              type="text" 
              value={config.googleDriveFolder}
              onChange={e => updateConfig({ googleDriveFolder: e.target.value })}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm text-gray-500 shadow-inner"
              placeholder="ID da pasta para salvar comprovantes..."
            />
          </div>
          
          <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
             <h5 className="text-indigo-800 font-black mb-2 flex items-center gap-2">
               <Database size={16} /> Como funciona a Sincronização?
             </h5>
             <p className="text-indigo-700 text-sm font-medium leading-relaxed">
               Ao salvar um lançamento no App, os dados são enviados para a planilha vinculada acima. O App lê esta mesma planilha para gerar os gráficos e o DRE em tempo real, permitindo que você tenha o controle total dos dados mesmo fora do aplicativo.
             </p>
          </div>
        </div>

        <div className="p-10 bg-gray-50 border-t border-gray-100 flex justify-end">
           <button 
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95"
           >
             <Save size={24} />
             SALVAR CONFIGURAÇÕES
           </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
