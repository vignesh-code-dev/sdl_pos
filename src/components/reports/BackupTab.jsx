import React from "react";
import { Database, RefreshCw, Save, Sliders, AlertCircle, ShieldAlert } from "lucide-react";

export default function BackupTab({
  activeTab,
  backupCycle,
  onBackupCycleChange,
  lastBackupDate,
  onManualBackup,
  onImportBackup,
  fileInputRef,
  onTriggerImport
}) {
  if (activeTab !== "backups") return null;

  // Let's compute actual local db storage usage to display as a gorgeous diagnostic stat!
  const getMetricsSize = () => {
    let bytesSum = 0;
    const schemas = [
      "billmate_invoices",
      "billmate_expenses",
      "billmate_deposit_accounts",
      "billmate_customers",
      "billmate_products",
      "billmate_users"
    ];
    schemas.forEach((key) => {
      const payload = localStorage.getItem(key) || "";
      bytesSum += payload.length * 2; // approx JS string size 2 bytes per char
    });
    
    // Convert to readable Format (KB or MB)
    const kb = bytesSum / 1024;
    if (kb > 1024) {
      return `${(kb / 1024).toFixed(2)} Megabytes`;
    }
    return `${kb.toFixed(1)} Kilobytes`;
  };

  return (
    <div id="backup-console-pane" className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans no-print">
      
      {/* 1. Automated Policies Settings */}
      <div className="bg-pos-card border border-pos-border rounded p-5 shadow-sm flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center gap-1.5 leading-none">
            <Sliders size={15} className="text-brand-primary" />
            <span>Auto Archival Routine</span>
          </h4>
          <p className="text-xs text-slate-400 font-sans leading-relaxed mb-4">
            Dictate POS state archival intervals. Local data remains stored securely in client sandbox folders.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                Archival Sync Cycle
              </label>
              <select
                id="backup-cycle-dropdown"
                value={backupCycle}
                onChange={onBackupCycleChange}
                className="block w-full py-2 px-3 text-xs border border-pos-border rounded focus:outline-none focus:border-brand-primary bg-slate-50 transition-colors font-sans cursor-pointer text-slate-700"
              >
                <option value="Off">Archival (Disabled)</option>
                <option value="Daily">Daily Rotational Sync</option>
                <option value="Every 2 Days">Every 2 Days System Capture</option>
                <option value="Weekly">Weekly Scheduled Archive</option>
                <option value="Monthly">Monthly General Backup</option>
              </select>
            </div>

            <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1">Backup Protection</span>
              <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
                Archival systems ensure your active ledger schemas, products, client tabs, and cashier records can be restored instantly in case of manual cookie cleanups.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-pos-border/40 text-[10px] text-slate-400 font-sans">
          Policy status: <span className="text-emerald-700 font-bold">{backupCycle === "Off" ? "DORMANT" : "ACTIVE SENTRY"}</span>
        </div>
      </div>

      {/* 2. Manual Export & Database Statistics */}
      <div className="bg-pos-card border border-pos-border rounded p-5 shadow-sm flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center gap-1.5 leading-none">
            <Save size={15} className="text-brand-primary" />
            <span>Generate Local Dump</span>
          </h4>
          <p className="text-xs text-slate-400 font-sans leading-relaxed mb-4">
            Download full database snapshots in compiled JSON format. Maintain offline file vaults for secure record protection.
          </p>

          <div className="space-y-3.5">
            <div className="bg-slate-50 border border-pos-border/40 rounded p-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400 font-medium">Database Footprint</span>
                <span className="text-slate-800 font-bold">{getMetricsSize()}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium font-sans">Last Backup Stamp</span>
                <span className="text-slate-800 font-bold text-xs">{lastBackupDate}</span>
              </div>
            </div>

            <button
              id="download-manual-backup-btn"
              type="button"
              onClick={onManualBackup}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer transition-all uppercase tracking-wider"
            >
              <Database size={14} />
              <span>Generate Backup File (.json)</span>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-pos-border/40 text-[10px] font-sans text-slate-400">
          Database Signature: <span className="font-mono text-slate-600 text-[11px] font-bold select-all">POS-DB-MASTER</span>
        </div>
      </div>

      {/* 3. Restore snapshot Dump */}
      <div className="bg-pos-card border border-pos-border rounded p-5 shadow-sm flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center gap-1.5 leading-none">
            <RefreshCw size={15} className="text-brand-primary" />
            <span>Restore DB snapshot</span>
          </h4>
          <p className="text-xs text-slate-400 font-sans leading-relaxed mb-4">
            Upload valid BillMate JSON snapshots to overwrite current memory indexes. Existing registers will be fully synced with import files.
          </p>

          <div className="space-y-4">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImportBackup}
              accept=".json"
              className="hidden"
            />

            <button
              id="trigger-restore-upload-btn"
              type="button"
              onClick={onTriggerImport}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold border border-emerald-600 hover:bg-emerald-50 text-emerald-700 rounded cursor-pointer transition-all uppercase tracking-wider bg-transparent"
            >
              <RefreshCw size={14} className="animate-spin" style={{ animationDuration: '3s' }} />
              <span>Import Snapshot Dump</span>
            </button>

            <div className="p-3 bg-amber-50/50 border border-amber-100 text-amber-800 rounded flex items-start gap-2">
              <ShieldAlert size={14} className="flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-extrabold block">Data Deletion Caveat</span>
                <span className="text-[10px] text-slate-600 font-sans leading-relaxed block mt-0.5">
                  Importing database snapshots replaces existing invoices, customer credits, and expense catalogs completely. Please generate a preliminary localized backup first.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-pos-border/40 text-[10px] text-slate-400 font-sans">
          Ingress Status: <span className="text-slate-500 font-bold">READY TO VERIFY</span>
        </div>
      </div>
    </div>
  );
}
