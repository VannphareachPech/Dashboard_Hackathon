"use client";

import { useEffect, useState } from "react";
import type { ActionItem, ActionStatus } from "@/types/dashboard";
import CreateActionModal from "./CreateActionModal";

const LS_KEY = "b2css_local_actions";
const LS_HIDDEN_KEY = "b2css_hidden_backend_keys";

function actionKey(a: ActionItem) {
  return `${a.suggestedAction}||${a.owner}||${a.area ?? ""}`;
}

interface ActionTrackerProps {
  actions: ActionItem[];
  currentCycle?: string;
}

const statusStyles: Record<ActionStatus, { bg: string; text: string; dot: string }> = {
  Planned:       { bg: "bg-slate-100",   text: "text-slate-600",   dot: "bg-slate-400" },
  "In Progress": { bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-400" },
  Completed:     { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500" },
};

export default function ActionTracker({ actions, currentCycle }: ActionTrackerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<ActionItem | null>(null);
  const [editingLocalIdx, setEditingLocalIdx] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    isLocal: boolean;
    action: ActionItem;
    localIdx?: number;
  } | null>(null);

  const [localActions, setLocalActions] = useState<ActionItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(LS_KEY);
      return stored ? (JSON.parse(stored) as ActionItem[]) : [];
    } catch {
      return [];
    }
  });

  const [hiddenBackendKeys, setHiddenBackendKeys] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem(LS_HIDDEN_KEY);
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(localActions)); } catch { /* silent */ }
  }, [localActions]);

  useEffect(() => {
    try { localStorage.setItem(LS_HIDDEN_KEY, JSON.stringify([...hiddenBackendKeys])); } catch { /* silent */ }
  }, [hiddenBackendKeys]);

  const visibleBackend = actions.filter((a) => !hiddenBackendKeys.has(actionKey(a)));
  const allActions = [...visibleBackend, ...localActions];
  const isLocalRow = (i: number) => i >= visibleBackend.length;

  function handleCreate(action: ActionItem) {
    if (editingLocalIdx !== null) {
      setLocalActions((prev) => prev.map((a, i) => i === editingLocalIdx ? action : a));
    } else if (editingAction && !isLocalRow(allActions.indexOf(editingAction))) {
      setHiddenBackendKeys((prev) => new Set([...prev, actionKey(editingAction)]));
      setLocalActions((prev) => [action, ...prev]);
    } else {
      setLocalActions((prev) => [action, ...prev]);
    }
    setEditingAction(null);
    setEditingLocalIdx(null);
  }

  function handleEdit(isLocal: boolean, action: ActionItem, localIdx?: number) {
    setEditingAction(action);
    setEditingLocalIdx(isLocal ? (localIdx ?? null) : null);
    setModalOpen(true);
  }

  function requestDelete(isLocal: boolean, action: ActionItem, localIdx?: number) {
    setConfirmDelete({ isLocal, action, localIdx });
  }

  function confirmDeleteAction() {
    if (!confirmDelete) return;
    const { isLocal, action, localIdx } = confirmDelete;
    if (isLocal && localIdx !== undefined) {
      setLocalActions((prev) => prev.filter((_, i) => i !== localIdx));
    } else {
      setHiddenBackendKeys((prev) => new Set([...prev, actionKey(action)]));
    }
    setConfirmDelete(null);
  }

  function handleModalClose() {
    setModalOpen(false);
    setEditingAction(null);
    setEditingLocalIdx(null);
  }

  const header = (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-700">Leadership Actions</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Actions currently underway in response to pulse feedback
        </p>
      </div>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm transition-colors whitespace-nowrap"
      >
        Create Action
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2 6h8M6.5 2.5L10 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );

  if (!allActions.length) {
    return (
      <>
        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100 p-5 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">No leadership actions tracked yet.</p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm transition-colors whitespace-nowrap"
          >
            Create Action
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M2 6h8M6.5 2.5L10 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <CreateActionModal
          open={modalOpen}
          onClose={handleModalClose}
          onSubmit={handleCreate}
          currentCycle={currentCycle}
          initialValues={editingAction ?? undefined}
        />
      </>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100 p-5">
        {header}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide w-[15%]">Focus Area</th>
                <th className="text-left py-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide w-[25%]">Action</th>
                <th className="text-left py-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide w-[13%]">Owner</th>
                <th className="text-left py-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide w-[13%]">Status</th>
                <th className="text-left py-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide w-[20%]">Note</th>
                <th className="py-3 w-[8%] text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {allActions.map((a, i) => {
                const local = isLocalRow(i);
                const localIdx = local ? i - visibleBackend.length : undefined;
                const badge = statusStyles[a.status] ?? statusStyles["Planned"];
                return (
                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pr-4 align-middle">
                      <span className="block text-sm font-semibold text-slate-800 whitespace-nowrap">
                        {a.area ?? "—"}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 align-middle text-sm text-slate-600">
                      {a.suggestedAction}
                    </td>
                    <td className="py-3.5 pr-4 align-middle text-sm text-slate-600 font-medium">
                      {a.owner}
                    </td>
                    <td className="py-3.5 pr-4 align-middle">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 align-middle max-w-[160px]">
                      {a.notes ? (
                        <span className="block text-xs text-slate-500 truncate" title={a.notes}>
                          {a.notes}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3.5 align-middle">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => handleEdit(local, a, localIdx)}
                          className="p-2 rounded-md text-slate-400 border border-slate-200 bg-white hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        >
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                            <path d="M11 2l2 2-8 8H3v-2l8-8z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          onClick={() => requestDelete(local, a, localIdx)}
                          className="p-2 rounded-md text-rose-400 border border-rose-200 bg-white hover:bg-rose-50 hover:border-rose-300 transition-all"
                        >
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                            <path d="M2.5 4.5h10M6 4.5V3h3v1.5M11.5 4.5l-.8 8H4.3l-.8-8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <CreateActionModal
        open={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleCreate}
        currentCycle={currentCycle}
        initialValues={editingAction ?? undefined}
      />

      {/* Delete confirmation dialog */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setConfirmDelete(null); }}
        >
          <div className="w-full max-w-sm mx-4 bg-white rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.14)] border border-slate-100">
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <h2 className="text-base font-bold text-[#1E293B]">Delete Action?</h2>
            </div>
            {/* Divider */}
            <div className="border-t border-slate-100" />
            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-sm leading-relaxed text-[#475569]">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-[#1E293B]">
                  &ldquo;{confirmDelete.action.suggestedAction}&rdquo;
                </span>
                ? This action cannot be undone.
              </p>
            </div>
            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 pb-6">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAction}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
