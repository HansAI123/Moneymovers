import React, { useState } from "react";
import {
  X,
  Briefcase,
  DollarSign,
  Percent,
  Layers,
  Trash2,
  AlertTriangle,
  Plus,
  Check,
} from "lucide-react";
import { ProjectWorkspace } from "../types/fund";

interface WorkspaceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveWorkspace: (workspace: ProjectWorkspace) => void;
  onDeleteWorkspace?: (workspaceId: string) => void;
  editingWorkspace?: ProjectWorkspace | null;
  existingCount: number;
}

export const WorkspaceManagerModal: React.FC<WorkspaceManagerModalProps> = ({
  isOpen,
  onClose,
  onSaveWorkspace,
  onDeleteWorkspace,
  editingWorkspace,
  existingCount,
}) => {
  const isEditing = !!editingWorkspace;

  const [name, setName] = useState(editingWorkspace?.name || `Income Strategy #${existingCount + 1}`);
  const [description, setDescription] = useState(
    editingWorkspace?.description || "Covered call cash flow allocation with capital preservation thesis"
  );
  const [initialCapital, setInitialCapital] = useState<number>(
    editingWorkspace?.initialCapital || 100000
  );
  const [targetYieldPct, setTargetYieldPct] = useState<number>(
    editingWorkspace?.targetYieldPct || 8.5
  );
  const [accountType, setAccountType] = useState<"taxable" | "traditional_ira" | "roth_ira">(
    editingWorkspace?.accountType || "taxable"
  );
  const [marginalTaxRatePct, setMarginalTaxRatePct] = useState<number>(
    editingWorkspace?.marginalTaxRatePct || 24
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newWorkspace: ProjectWorkspace = {
      id: editingWorkspace?.id || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: editingWorkspace?.userId || "user_active",
      name: name.trim(),
      description: description.trim(),
      accountType,
      initialCapital: Math.max(1000, Number(initialCapital) || 100000),
      targetYieldPct: Math.max(1, Number(targetYieldPct) || 8.5),
      marginalTaxRatePct: Math.max(0, Math.min(60, Number(marginalTaxRatePct) || 24)),
      createdAt: editingWorkspace?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      holdings: editingWorkspace?.holdings || [
        { ticker: "JEPI", weight_pct: 40 },
        { ticker: "SPYI", weight_pct: 35 },
        { ticker: "JEPQ", weight_pct: 25 },
      ],
    };

    onSaveWorkspace(newWorkspace);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {isEditing ? "Configure Project Workspace" : "Create New Project Workspace"}
            </h2>
            <p className="text-xs text-slate-400">
              Each workspace holds an independent asset allocation, simulation goals, and tax parameters.
            </p>
          </div>
        </div>

        {/* Delete Confirmation View */}
        {showDeleteConfirm ? (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Project Deletion</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">{editingWorkspace?.name}</strong>? All simulation models and custom weightings in this workspace will be removed.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editingWorkspace && onDeleteWorkspace) {
                    onDeleteWorkspace(editingWorkspace.id);
                  }
                  onClose();
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Project Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Project / Workspace Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Retirement Cash Flow IRA"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Description / Thesis */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Strategy Thesis / Mandate
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Index call spreads with Section 1256 tax shielding"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Account Type Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Account Jurisdiction & Tax Shelter
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType("taxable")}
                  className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    accountType === "taxable"
                      ? "border-sky-500 bg-sky-500/10 text-white"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="text-xs font-semibold">Taxable</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Brokerage account</div>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType("traditional_ira")}
                  className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    accountType === "traditional_ira"
                      ? "border-sky-500 bg-sky-500/10 text-white"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="text-xs font-semibold">Trad. IRA / 401k</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Tax deferred</div>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType("roth_ira")}
                  className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    accountType === "roth_ira"
                      ? "border-sky-500 bg-sky-500/10 text-white"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="text-xs font-semibold">Roth IRA</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Tax exempt</div>
                </button>
              </div>
            </div>

            {/* Financial Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Initial Capital */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Initial Capital ($)
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(Number(e.target.value))}
                    className="w-full pl-8 pr-2 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              {/* Target Yield */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Yield (%)
                </label>
                <div className="relative">
                  <Percent className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  <input
                    type="number"
                    min={1}
                    max={100}
                    step={0.5}
                    value={targetYieldPct}
                    onChange={(e) => setTargetYieldPct(Number(e.target.value))}
                    className="w-full pl-8 pr-2 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              {/* Marginal Tax Rate */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tax Bracket (%)
                </label>
                <div className="relative">
                  <Percent className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  <input
                    type="number"
                    min={0}
                    max={60}
                    step={1}
                    disabled={accountType !== "taxable"}
                    value={accountType !== "taxable" ? 0 : marginalTaxRatePct}
                    onChange={(e) => setMarginalTaxRatePct(Number(e.target.value))}
                    className="w-full pl-8 pr-2 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500 font-mono disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              {isEditing && onDeleteWorkspace ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Project</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEditing ? "Save Configuration" : "Create Project"}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
