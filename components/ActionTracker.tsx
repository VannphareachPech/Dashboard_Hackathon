"use client";

import { useEffect, useState } from "react";
import type { ActionItem, ActionStatus } from "@/types/dashboard";
import CreateActionModal from "./CreateActionModal";

const LS_KEY = "b2css_local_actions";
const LS_HIDDEN_KEY = "b2css_hidden_backend_keys";
const LS_PINNED_KEY = "b2css_pinned_action_keys";

function actionKey(a: ActionItem) {
  return `${a.suggestedAction}||${a.owner}||${a.area ?? ""}`;
}

interface ActionTrackerProps {
  actions: ActionItem[];
  currentCycle?: string;
}

const statusStyles: Record<ActionStatus, { bg: string; text: string; dot: string }> = {
  Planned:       { bg: "bg-slate-100",   text: "text-slate-900",   dot: "bg-slate-700" },
  "In Progress": { bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-400" },
  Completed:     { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500" },
};

export default function ActionTracker({ actions, currentCycle }: ActionTrackerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<ActionItem | null>(null);
  const [editingLocalIdx, setEditingLocalIdx] = useState<number | null>(null);
  const [modalViewText, setModalViewText] = useState<{
    title: string;
    action: string;
    note: string;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
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

  const [pinnedActionKeys, setPinnedActionKeys] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem(LS_PINNED_KEY);
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

  useEffect(() => {
    try { localStorage.setItem(LS_PINNED_KEY, JSON.stringify([...pinnedActionKeys])); } catch { /* silent */ }
  }, [pinnedActionKeys]);

  useEffect(() => {
    if (!toastMessage) return;
    const t = window.setTimeout(() => setToastMessage(null), 2200);
    return () => window.clearTimeout(t);
  }, [toastMessage]);

  useEffect(() => {
    if (!modalViewText) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalViewText(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalViewText]);

  const visibleBackend = actions.filter((a) => !hiddenBackendKeys.has(actionKey(a)));

  const allRows = [
    ...visibleBackend.map((a, backendIdx) => {
      const key = actionKey(a);
      const isPinned = a.isPinned === true || pinnedActionKeys.has(key);
      return {
        id: `b-${backendIdx}-${key}`,
        action: { ...a, isPinned },
        isLocal: false,
        localIdx: undefined as number | undefined,
      };
    }),
    ...localActions.map((a, localIdx) => {
      const key = actionKey(a);
      const isPinned = a.isPinned === true || pinnedActionKeys.has(key);
      return {
        id: `l-${localIdx}-${key}`,
        action: { ...a, isPinned },
        isLocal: true,
        localIdx,
      };
    }),
  ].sort((a, b) => Number(b.action.isPinned) - Number(a.action.isPinned));

  const successBanner = toastMessage ? (
    <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-700">
      {toastMessage}
    </div>
  ) : null;

  function handleCreate(action: ActionItem) {
    const isUpdate = editingLocalIdx !== null || editingAction !== null;
    const normalizedAction: ActionItem = {
      ...action,
      isPinned: action.isPinned ?? editingAction?.isPinned ?? false,
    };

    if (editingLocalIdx !== null) {
      setLocalActions((prev) => prev.map((a, i) => i === editingLocalIdx ? normalizedAction : a));
    } else if (editingAction && editingLocalIdx === null) {
      setHiddenBackendKeys((prev) => new Set([...prev, actionKey(editingAction)]));
      setLocalActions((prev) => [normalizedAction, ...prev]);
    } else {
      setLocalActions((prev) => [normalizedAction, ...prev]);
    }

    if (editingAction?.isPinned) {
      const oldKey = actionKey(editingAction);
      const newKey = actionKey(normalizedAction);
      setPinnedActionKeys((prev) => {
        const next = new Set(prev);
        next.delete(oldKey);
        next.add(newKey);
        return next;
      });
    }

    setEditingAction(null);
    setEditingLocalIdx(null);
    setToastMessage(isUpdate ? "Action updated successfully." : "Action created successfully.");
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

  function togglePin(isLocal: boolean, action: ActionItem, localIdx?: number) {
    if (isLocal && localIdx !== undefined) {
      setLocalActions((prev) =>
        prev.map((row, i) =>
          i === localIdx ? { ...row, isPinned: !Boolean(action.isPinned) } : row
        )
      );
      return;
    }

    const key = actionKey(action);
    setPinnedActionKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const createActionButton = (
    <button
      type="button"
      onClick={() => setModalOpen(true)}
      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition-colors whitespace-nowrap"
    >
      Create Action
      <svg className="h-4 w-4" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path d="M2 6h8M6.5 2.5L10 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );

  if (!allRows.length) {
    return (
      <>
        {successBanner}
        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100 p-5 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">No leadership actions tracked yet.</p>
          {createActionButton}
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
      {successBanner}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100 p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-700">Leadership Action Items</h3>
            <p className="mt-1 text-xs text-slate-500">
              Commitments raised from pulse insights, tracked to completion.
            </p>
          </div>
          {createActionButton}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-3 pr-2 w-[4%] min-w-[46px] text-center" aria-label="Pin" />
                <th className="min-w-[240px] pr-4 text-left py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Focus Area</th>
                <th className="min-w-[200px] px-4 text-left py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                <th className="w-[100px] min-w-[100px] px-1 text-left py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Owner</th>
                <th className="w-[112px] min-w-[112px] px-1 text-left py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="flex-1 min-w-[320px] px-4 text-left py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Note</th>
                <th className="py-3 w-[5%] min-w-[86px] text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {allRows.map((row) => {
                const a = row.action;
                const badge = statusStyles[a.status] ?? statusStyles["Planned"];
                return (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pr-2 align-middle text-center">
                      <button
                        type="button"
                        title={a.isPinned ? "Unpin record" : "Pin record"}
                        onClick={() => togglePin(row.isLocal, a, row.localIdx)}
                        className={[
                          "p-2 rounded-md border transition-all focus-visible:outline-none focus-visible:ring-2",
                          a.isPinned
                            ? "bg-amber-100/70 border-amber-200 text-amber-800 shadow-inner hover:bg-amber-200/70 focus-visible:ring-amber-300/60"
                            : "bg-indigo-50 border-indigo-100/60 text-indigo-400 opacity-70 hover:opacity-100 hover:text-indigo-600 focus-visible:ring-indigo-300/60",
                        ].join(" ")}
                        aria-pressed={a.isPinned ? "true" : "false"}
                        aria-label={a.isPinned ? "Unpin action record" : "Pin action record"}
                      >
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                          <path
                            d="M5 2.5h5v1.2l-1.1 1v3.1l1.5 1.5H4.6l1.5-1.5V4.7L5 3.7V2.5zm2.5 6.8v3.2"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </td>
                    <td className="min-w-[240px] pr-4 text-left py-3.5 align-middle">
                      <span className="block text-sm font-semibold text-slate-800 whitespace-nowrap">
                        {a.area ?? "—"}
                      </span>
                    </td>
                    <td className="min-w-[200px] px-4 text-left py-3.5 align-middle text-sm text-slate-600">
                      <button
                        type="button"
                        onClick={() =>
                          setModalViewText({
                            title: "Action & Note Detail",
                            action: a.suggestedAction || "No action detail provided.",
                            note: a.notes || "—",
                          })
                        }
                        className="group block w-full truncate text-left text-sm text-slate-600 cursor-pointer hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/50 rounded-sm transition-colors"
                        title={a.suggestedAction}
                      >
                        <span className="underline-offset-2 group-hover:underline">{a.suggestedAction}</span>
                      </button>
                    </td>
                    <td className="w-[100px] min-w-[100px] px-1 py-3.5 align-middle text-sm text-slate-600 font-medium">
                      {a.owner}
                    </td>
                    <td className="w-[112px] min-w-[112px] px-1 text-left py-3.5 align-middle">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {a.status}
                      </span>
                    </td>
                    <td className="flex-1 min-w-[320px] px-4 text-left py-3.5 align-middle">
                      {a.notes ? (
                        <button
                          type="button"
                          onClick={() =>
                            setModalViewText({
                              title: "Action & Note Detail",
                              action: a.suggestedAction || "No action detail provided.",
                              note: a.notes || "—",
                            })
                          }
                          className="group block w-full truncate text-left text-xs text-slate-500 cursor-pointer hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/50 rounded-sm leading-5 transition-colors"
                          title={a.notes}
                        >
                          <span className="underline-offset-2 group-hover:underline">{a.notes}</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3.5 align-middle">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => handleEdit(row.isLocal, a, row.localIdx)}
                          className="p-2 rounded-md text-slate-400 border border-slate-200 bg-white hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        >
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                            <path d="M11 2l2 2-8 8H3v-2l8-8z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          onClick={() => requestDelete(row.isLocal, a, row.localIdx)}
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

      {/* Action/Note inspection modal */}
      {modalViewText && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-[2px] px-4"
          role="dialog"
          aria-modal="true"
          aria-label={modalViewText.title}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModalViewText(null);
          }}
        >
          <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-[0_20px_60px_rgba(15,23,42,0.28)] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">{modalViewText.title}</h3>
              <button
                type="button"
                aria-label="Close detail view"
                onClick={() => setModalViewText(null)}
                className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="max-h-[60vh] overflow-y-auto bg-slate-50 rounded-xl p-5 border border-slate-100/80 whitespace-pre-wrap">
                <div className="border-b border-slate-200/60 pb-3 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Action:</span>
                  <p className="text-base font-semibold text-slate-800">{modalViewText.action}</p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Note:</span>
                  <p className="text-sm text-slate-600 leading-relaxed">{modalViewText.note}</p>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 flex justify-end">
              <button
                type="button"
                onClick={() => setModalViewText(null)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

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
