import { useEffect, useState } from 'react';
import { useTasks } from '../context/TaskContext';
import type { Category, Task } from '../types';
import { toISO, addDays, parseISO } from '../utils/dateUtils';

export function TaskModal({
  state,
  onClose,
}: {
  state: { open: boolean; editing?: Task; startISO?: string; endISO?: string };
  onClose: () => void;
}) {
  const { addTask, updateTask, removeTask } = useTasks();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('todo' as Category);
  const [startISO, setStartISO] = useState('');
  const [endISO, setEndISO] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    if (state.open) {
      if (state.editing) {
        setName(state.editing.name);
        setCategory(state.editing.category);
        setStartISO(state.editing.start);
        setEndISO(state.editing.end);
        setVideoUrl(state.editing.videoUrl || '');
      } else {
        setName('');
        setCategory('todo');
        setStartISO(state.startISO || toISO(new Date()));
        setEndISO(state.endISO || toISO(addDays(new Date(), 1)));
        setVideoUrl('');
      }
    }
  }, [state]);

  function submit() {
    if (!name.trim()) return;
    if (state.editing) {
      updateTask(state.editing.id, { name, category, start: startISO, end: endISO, videoUrl: videoUrl.trim() || undefined });
    } else {
      addTask({ name, category, start: startISO, end: endISO, videoUrl: videoUrl.trim() || undefined } as any);
    }
    onClose();
  }

  if (!state.open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-white rounded shadow p-4 space-y-3">
        <h2 className="text-lg font-semibold">{state.editing ? 'Edit Task' : 'Create Task'}</h2>
        <div className="space-y-2">
          <label className="block text-sm">Task name</label>
          <input className="w-full border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="block text-sm">Category</label>
          <select className="w-full border rounded px-3 py-2" value={category} onChange={e => setCategory(e.target.value as Category)}>
            <option value="todo">To Do</option>
            <option value="inprogress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Start</label>
            <input type="date" className="w-full border rounded px-3 py-2" value={startISO} onChange={e => setStartISO(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm">End</label>
            <input type="date" className="w-full border rounded px-3 py-2" value={endISO} onChange={e => setEndISO(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm">Video URL (YouTube/Vimeo/Google Drive)</label>
          <input
            type="url"
            className="w-full border rounded px-3 py-2"
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            placeholder="https://..."
          />
          {videoUrl ? (
            <div className="mt-2">
              <Embed url={videoUrl} />
            </div>
          ) : null}
        </div>
        <div className="flex justify-between">
          {state.editing ? (
            <button className="text-red-600" onClick={() => (removeTask(state.editing!.id), onClose())}>
              Delete
            </button>
          ) : (
            <span />
          )}
          <div className="space-x-2">
            <button className="px-3 py-2 border rounded" onClick={onClose}>
              Cancel
            </button>
            <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={submit}>
              {state.editing ? 'Save' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function toEmbed(url: string) {
  try {
    const u = new URL(url);
    // YouTube
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    // Vimeo
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    // Google Drive file
    if (u.hostname.includes('drive.google.com')) {
      // formats: /file/d/<id>/view
      const parts = u.pathname.split('/');
      const idx = parts.indexOf('d');
      if (parts.includes('file') && idx > -1 && parts[idx + 1]) {
        const id = parts[idx + 1];
        return `https://drive.google.com/file/d/${id}/preview`;
      }
    }
    // Fallback: return original (may not allow embedding)
    return url;
  } catch {
    return url;
  }
}

function Embed({ url }: { url: string }) {
  const src = toEmbed(url);
  return (
    <div className="aspect-video w-full overflow-hidden rounded border">
      <iframe
        src={src}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
        title="task-video"
      />
    </div>
  );
}

export default TaskModal;
