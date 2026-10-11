export interface DSATopicDef {
  key: string;
  name: string;
  category: string;
  defaultTarget: number;
}

export const DSA_TOPICS: DSATopicDef[] = [
  { key: 'arrays', name: 'Arrays', category: 'Linear DS', defaultTarget: 30 },
  { key: 'strings', name: 'Strings', category: 'Linear DS', defaultTarget: 25 },
  { key: 'two_pointers', name: 'Two Pointers', category: 'Technique', defaultTarget: 20 },
  { key: 'sliding_window', name: 'Sliding Window', category: 'Technique', defaultTarget: 20 },
  { key: 'linked_lists', name: 'Linked Lists', category: 'Linear DS', defaultTarget: 25 },
  { key: 'stack', name: 'Stack', category: 'Linear DS', defaultTarget: 20 },
  { key: 'queue', name: 'Queue', category: 'Linear DS', defaultTarget: 15 },
  { key: 'binary_search', name: 'Binary Search', category: 'Algorithms', defaultTarget: 25 },
  { key: 'recursion', name: 'Recursion', category: 'Core Algorithms', defaultTarget: 20 },
  { key: 'backtracking', name: 'Backtracking', category: 'Core Algorithms', defaultTarget: 20 },
  { key: 'trees', name: 'Trees (Binary & N-ary)', category: 'Non-Linear DS', defaultTarget: 35 },
  { key: 'bst', name: 'Binary Search Trees (BST)', category: 'Non-Linear DS', defaultTarget: 20 },
  { key: 'heap', name: 'Heap / Priority Queue', category: 'Advanced DS', defaultTarget: 20 },
  { key: 'hashing', name: 'Hashing & HashMaps', category: 'Core DS', defaultTarget: 25 },
  { key: 'graphs', name: 'Graphs (BFS/DFS/Dijkstra)', category: 'Advanced DS', defaultTarget: 35 },
  { key: 'greedy', name: 'Greedy Algorithms', category: 'Algorithms', defaultTarget: 20 },
  { key: 'dp', name: 'Dynamic Programming', category: 'Advanced Algorithms', defaultTarget: 40 },
  { key: 'bit_manipulation', name: 'Bit Manipulation', category: 'Low-Level', defaultTarget: 15 },
  { key: 'tries', name: 'Tries', category: 'Advanced DS', defaultTarget: 15 },
  { key: 'intervals', name: 'Intervals', category: 'Technique', defaultTarget: 15 },
];

export const PRESET_HABITS = [
  { name: 'Wake up early', category: 'Health', icon: 'Sunrise', color: '#F59E0B' },
  { name: 'Study 6+ hours', category: 'Learning', icon: 'GraduationCap', color: '#6366F1' },
  { name: 'Gym / Workout', category: 'Fitness', icon: 'Dumbbell', color: '#10B981' },
  { name: 'Drink 3L water', category: 'Health', icon: 'Droplets', color: '#06B6D4' },
  { name: 'Read 20+ pages', category: 'Learning', icon: 'BookOpen', color: '#8B5CF6' },
  { name: 'No social media', category: 'Focus', icon: 'ShieldAlert', color: '#EF4444' },
  { name: 'No Shorts/Reels', category: 'Focus', icon: 'Smartphone', color: '#F43F5E' },
  { name: 'Sleep before 11:30 PM', category: 'Health', icon: 'Moon', color: '#3B82F6' },
  { name: 'Meditation (10m)', category: 'Focus', icon: 'Sparkles', color: '#EC4899' },
  { name: 'Stretching', category: 'Fitness', icon: 'Activity', color: '#14B8A6' },
];

export const PLACEMENT_SUBJECTS = [
  { key: 'dsa', name: 'DSA & Problem Solving', icon: 'Code2', target: 100 },
  { key: 'dbms', name: 'Database Management (DBMS)', icon: 'Database', target: 100 },
  { key: 'os', name: 'Operating Systems (OS)', icon: 'Cpu', target: 100 },
  { key: 'cn', name: 'Computer Networks (CN)', icon: 'Globe', target: 100 },
  { key: 'system_design', name: 'System Design (HLD/LLD)', icon: 'Layers', target: 100 },
  { key: 'oop', name: 'Object-Oriented Programming (OOP)', icon: 'Boxes', target: 100 },
  { key: 'aptitude', name: 'Quantitative & Aptitude', icon: 'Calculator', target: 100 },
  { key: 'projects', name: 'Flagship Projects & Demos', icon: 'FolderGit2', target: 100 },
  { key: 'behavioral', name: 'Behavioral & Leadership Principles', icon: 'Users', target: 100 },
  { key: 'mock_interviews', name: 'Mock Interviews', icon: 'Video', target: 100 },
];
