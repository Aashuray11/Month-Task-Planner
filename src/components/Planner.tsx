import { useMemo, useState } from 'react';
import { TaskProvider, useTasks } from '../context/TaskContext';
import type { Task, Category } from '../types';
import { addDays, differenceInCalendarDays, getMonthGrid, isSameDay, parseISO, startOfMonth, toISO } from '../utils/dateUtils';
import Filters from './Filters';
import TaskModal from './TaskModal';

export function Planner() {
  return (
    <TaskProvider>
      <Inner />
    </TaskProvider>
  );
}

function Inner() {
  const today = new Date();
  const [month, setMonth] = useState(startOfMonth(today));
  const [selection, setSelection] = useState(null as any);
  const [modal, setModal] = useState({ open: false } as any);
  const [interaction, setInteraction] = useState(null as any);
  const [video, setVideo] = useState({ open: false, url: '' });
  const { tasks, filters, updateTask } = useTasks();

  const days = useMemo(() => getMonthGrid(month), [month]);
  const visible = useMemo(() => {
    let list = tasks.filter(t => filters.categories.has(t.category));
    if (filters.search) list = list.filter(t => t.name.toLowerCase().includes(filters.search.toLowerCase()));
    if (filters.timeWindowWeeks) {
      const ws = days[0];
      const we = addDays(ws, filters.timeWindowWeeks * 7 - 1);
      list = list.filter(t => parseISO(t.end) >= ws && parseISO(t.start) <= we);
    }
    return list;
  }, [tasks, filters, days]);

  function endGrid() {
    if (interaction && interaction.task) {
      const p = previewOf(interaction);
      if (p) updateTask(interaction.task.id, { start: p.start, end: p.end });
      setInteraction(null);
      return;
    }
    if (!selection) return;
    const a = selection.startISO <= selection.endISO ? selection.startISO : selection.endISO;
    const b = selection.startISO <= selection.endISO ? selection.endISO : selection.startISO;
    setSelection(null);
    setModal({ open: true, startISO: a, endISO: b });
  }

  return (
    <div className="space-y-4">
      <Toolbar month={month} setMonth={setMonth} />
      <Filters />
      <div className="border rounded bg-white overflow-x-auto" onMouseUp={endGrid}>
        <div className="min-w-[700px] md:min-w-0">
          <Header />
          <div className="grid grid-cols-7 grid-rows-6">
          {days.map((d, i) => (
            <Day
              key={i}
              date={d}
              today={today}
              tasks={applyPreview(visible, interaction)}
              selection={selection}
              onSelectStart={iso => setSelection({ startISO: iso, endISO: iso })}
              onSelectUpdate={iso => setSelection((r: any) => (r ? { ...r, endISO: iso } : r))}
              onHover={iso => setInteraction((prev: any) => (prev ? { ...prev, currentISO: iso } : prev))}
              onStartMove={(task, iso) => setInteraction({ type: 'move', task, anchorISO: iso, currentISO: iso, origStart: task.start, origEnd: task.end })}
              onStartResize={(task, side, iso) => setInteraction({ type: side === 'start' ? 'resize-start' : 'resize-end', task, anchorISO: iso, currentISO: iso, origStart: task.start, origEnd: task.end })}
              onEdit={t => setModal({ open: true, editing: t })}
              onPlayVideo={(url: string) => setVideo({ open: true, url })}
            />
          ))}
          </div>
        </div>
      </div>
      <TaskModal state={modal} onClose={() => setModal({ open: false })} />
      {video.open ? (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setVideo({ open: false, url: '' })}>
          <div className="w-full max-w-4xl" onClick={e => e.stopPropagation()}>
            <VideoFrame url={video.url} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Toolbar({ month, setMonth }: any) {
  const label = month.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  return (
    <div className="flex items-center gap-2">
      <button className="px-3 py-1 rounded border" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>Prev</button>
      <div className="font-semibold flex-1 text-center">{label}</div>
      <button className="px-3 py-1 rounded border" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>Next</button>
      <button className="px-3 py-1 rounded border" onClick={() => setMonth(startOfMonth(new Date()))}>Today</button>
    </div>
  );
}

function Header() {
  const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <div className="grid grid-cols-7 text-center text-xs md:text-sm font-medium border-b bg-slate-50">
      {names.map(n => (<div key={n} className="p-1 md:p-2">{n}</div>))}
    </div>
  );
}

function Day({ date, today, tasks, selection, onSelectStart, onSelectUpdate, onHover, onStartMove, onStartResize, onEdit, onPlayVideo }: any) {
  const iso = toISO(date);
  const inSel = selection ? iso >= (selection.startISO < selection.endISO ? selection.startISO : selection.endISO) && iso <= (selection.startISO > selection.endISO ? selection.startISO : selection.endISO) : false;
  const dayTasks: Task[] = tasks.filter((t: Task) => t.start <= iso && t.end >= iso);
  return (
    <div
      className={'relative min-h-[72px] md:min-h-[112px] border p-1 md:p-2 select-none ' + (isSameDay(date, today) ? 'bg-blue-50 ' : '') + (inSel ? 'ring-2 ring-blue-400 ' : '')}
      onMouseDown={() => onSelectStart(iso)}
      onMouseEnter={() => { onSelectUpdate(iso); onHover(iso); }}
    >
      <div className="text-[10px] md:text-xs text-right text-slate-600">{date.getDate()}</div>
      <div className="mt-1 space-y-1">
        {dayTasks.map(t => (
          <Chip
            key={t.id}
            task={t}
            iso={iso}
            onClick={() => onEdit(t)}
            onStartMove={() => onStartMove(t, iso)}
            onStartResizeStart={() => onStartResize(t, 'start', iso)}
            onStartResizeEnd={() => onStartResize(t, 'end', iso)}
            onPlayVideo={onPlayVideo}
          />
        ))}
      </div>
    </div>
  );
}

function Chip({ task, iso, onClick, onStartMove, onStartResizeStart, onStartResizeEnd, onPlayVideo }: any) {
  const isStart = task.start === iso;
  const isEnd = task.end === iso;
  const color = colorOf(task.category);
  return (
    <div className="group text-[10px] md:text-xs leading-tight cursor-pointer" title={`${task.name} (${task.start} → ${task.end})`} onMouseDown={(e: any) => { const el = e.target as HTMLElement; if (el.dataset.handle) return; onStartMove(); }}>
      <div className="px-1.5 md:px-2 py-0.5 md:py-1 rounded text-white" style={{ backgroundColor: color, borderTopLeftRadius: isStart ? 6 : 0, borderBottomLeftRadius: isStart ? 6 : 0, borderTopRightRadius: isEnd ? 6 : 0, borderBottomRightRadius: isEnd ? 6 : 0 }}>
        <div className="flex items-center gap-1.5 md:gap-2">
          {isStart ? (<span data-handle="start" onMouseDown={(e: any) => { e.stopPropagation(); onStartResizeStart(); }} className="inline-block w-1.5 h-3 mr-0.5 md:mr-1 rounded-sm bg-white/80 cursor-ew-resize" />) : null}
          <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap" onClick={onClick}>{task.name}</span>
          {task.videoUrl ? (
            <button
              className="shrink-0 text-white/90 hover:text-white underline text-[9px] md:text-[10px] px-1 py-0.5 rounded bg-white/10 border border-white/20"
              title="Play video"
              onClick={(e: any) => { e.stopPropagation(); onPlayVideo(task.videoUrl); }}
            >Play</button>
          ) : null}
          {isEnd ? (<span data-handle="end" onMouseDown={(e: any) => { e.stopPropagation(); onStartResizeEnd(); }} className="inline-block w-1.5 h-3 ml-0.5 md:ml-1 rounded-sm bg-white/80 cursor-ew-resize" />) : null}
        </div>
      </div>
    </div>
  );
}

function colorOf(cat: Category) {
  switch (cat) {
    case 'todo': return '#93c5fd';
    case 'inprogress': return '#facc15';
    case 'review': return '#f472b6';
    case 'completed': return '#34d399';
  }
}

function previewOf(i: any): Task | null {
  if (!i || !i.task || !i.currentISO) return null;
  const cur = parseISO(i.currentISO);
  const os = parseISO(i.origStart);
  const oe = parseISO(i.origEnd);
  if (i.type === 'move') {
    const delta = differenceInCalendarDays(cur, parseISO(i.anchorISO));
    return { ...i.task, start: toISO(addDays(os, delta)), end: toISO(addDays(oe, delta)) };
  }
  if (i.type === 'resize-start') {
    const ns = toISO(parseISO(i.currentISO));
    return { ...i.task, start: ns <= toISO(oe) ? ns : toISO(oe) };
  }
  if (i.type === 'resize-end') {
    const ne = toISO(parseISO(i.currentISO));
    return { ...i.task, end: ne >= toISO(os) ? ne : toISO(os) };
  }
  return null;
}

function applyPreview(tasks: Task[], i: any): Task[] {
  if (!i || !i.task) return tasks;
  const p = previewOf(i);
  if (!p) return tasks;
  return tasks.map(t => (t.id === i.task.id ? p : t));
}

function toEmbedUrl(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    if (u.hostname.includes('drive.google.com')) {
      const parts = u.pathname.split('/');
      const idx = parts.indexOf('d');
      if (parts.includes('file') && idx > -1 && parts[idx + 1]) {
        const id = parts[idx + 1];
        return `https://drive.google.com/file/d/${id}/preview`;
      }
    }
    return url;
  } catch {
    return url;
  }
}

function VideoFrame({ url }: { url: string }) {
  const src = toEmbedUrl(url);
  return (
    <div className="aspect-video w-full overflow-hidden rounded bg-black">
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
