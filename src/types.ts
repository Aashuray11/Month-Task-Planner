export type Category = 'todo' | 'inprogress' | 'review' | 'completed';

export interface Task {
  id: string;
  name: string;
  category: Category;
  start: string; // ISO date (YYYY-MM-DD)
  end: string;   // ISO date (YYYY-MM-DD), inclusive
  videoUrl?: string; // Optional video link (YouTube/Vimeo/Google Drive/direct)
}

export interface FiltersState {
  categories: Set<Category>;
  timeWindowWeeks: 0 | 1 | 2 | 3; // 0 means no limit
  search: string;
}
