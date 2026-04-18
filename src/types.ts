
export type DocType = 'وارد' | 'صادر';

export interface Document {
  id: string;
  type: DocType;
  number: string;
  date: string;
  subject: string;
  sender: string;
  recipient: string;
  priority: 'عادي' | 'عاجل' | 'سري جداً';
  status: 'قيد التنفيذ' | 'مكتمل' | 'مرفوض';
  notes?: string;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  name: string;
}
