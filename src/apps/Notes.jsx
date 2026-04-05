import { useEffect, useRef } from 'react';
import { FilePlus, Trash2, StickyNote } from 'lucide-react';
import { useAppStorage } from '../lib/appStorage.js';

const defaultNotesState = { notes: [], activeNoteId: null };

const Notes = ({ appId }) => {
  const [data, setData] = useAppStorage(appId, defaultNotesState);
  const migrationDone = useRef(false);

  useEffect(() => {
    migrationDone.current = false;
  }, [appId]);

  useEffect(() => {
    if (migrationDone.current) return;
    const list = Array.isArray(data.notes) ? data.notes : [];
    const legacyText = typeof data.text === 'string' ? data.text : '';

    if (list.length > 0) {
      migrationDone.current = true;
      return;
    }

    if (legacyText.trim()) {
      migrationDone.current = true;
      const id = crypto.randomUUID();
      setData({
        notes: [{ id, title: 'Untitled', content: legacyText }],
        activeNoteId: id,
      });
      return;
    }

    migrationDone.current = true;
  }, [appId, data.notes, data.text, setData]);

  const notes = Array.isArray(data.notes) ? data.notes : [];
  const activeNote = notes.find((n) => n.id === data.activeNoteId) ?? null;

  const addNote = () => {
    const id = crypto.randomUUID();
    setData((prev) => {
      const prevNotes = Array.isArray(prev.notes) ? prev.notes : [];
      return {
        notes: [...prevNotes, { id, title: 'Untitled', content: '' }],
        activeNoteId: id,
      };
    });
  };

  const removeNote = (noteId) => {
    setData((prev) => {
      const prevNotes = Array.isArray(prev.notes) ? prev.notes : [];
      const nextNotes = prevNotes.filter((n) => n.id !== noteId);
      let nextActive = prev.activeNoteId;
      if (nextActive === noteId) {
        const idx = prevNotes.findIndex((n) => n.id === noteId);
        nextActive = nextNotes[idx]?.id ?? nextNotes[idx - 1]?.id ?? null;
      }
      return { notes: nextNotes, activeNoteId: nextActive };
    });
  };

  const updateActiveNote = (patch) => {
    setData((prev) => {
      const prevNotes = Array.isArray(prev.notes) ? prev.notes : [];
      const id = prev.activeNoteId;
      if (!id) return prev;
      return {
        ...prev,
        notes: prevNotes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
      };
    });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in duration-300 bg-white dark:bg-slate-800">
      <aside className="w-56 shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60">
        <div className="p-3 border-b border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={addNote}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            <FilePlus size={18} strokeWidth={2} />
            New note
          </button>
        </div>
        <ul className="flex-1 overflow-y-auto p-2 space-y-0.5 min-h-0">
          {notes.length === 0 ? (
            <li className="px-2 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
              No notes yet
            </li>
          ) : (
            notes.map((note) => {
              const selected = note.id === data.activeNoteId;
              return (
                <li key={note.id}>
                  <div
                    className={`group flex items-center gap-1 rounded-lg border transition-colors ${
                      selected
                        ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40'
                        : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setData((prev) => ({ ...prev, activeNoteId: note.id }))}
                      className={`flex-1 min-w-0 text-left py-2 pl-3 pr-1 text-sm truncate ${
                        selected
                          ? 'text-indigo-900 dark:text-indigo-100 font-medium'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {note.title?.trim() || 'Untitled'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNote(note.id);
                      }}
                      title="Delete note"
                      className="shrink-0 p-2 rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} strokeWidth={2} />
                    </button>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {activeNote ? (
          <>
            <div className="shrink-0 p-4 border-b border-slate-200 dark:border-slate-700">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => updateActiveNote({ title: e.target.value })}
                placeholder="Title"
                className="w-full text-lg font-semibold bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0 border-0 p-0"
              />
            </div>
            <textarea
              value={activeNote.content}
              onChange={(e) => updateActiveNote({ content: e.target.value })}
              placeholder="Write something…"
              className="flex-1 w-full min-h-0 p-4 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500/30"
              spellCheck
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500 p-8">
            <StickyNote size={40} strokeWidth={1.5} className="opacity-50" />
            <p className="text-sm text-center">Select a note or create a new one</p>
            {notes.length === 0 && (
              <button
                type="button"
                onClick={addNote}
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                New note
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
