
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

export type DailySummaryType = 
  | 'delivery_passports' 
  | 'receive_passports'  
  | 'receive_seizure_records' 
  | 'residency_renewal_requests' 
  | 'incoming_memos' 
  | 'outgoing_memos';

export interface PassportDetail {
  id: string;
  fullName: string;
  nationality: string;
  passportNumber: string;
  phone?: string;
  address?: string;
  work?: string;
  entryDate?: string;
  visitType?: string;
  visitExpiry?: string;
  sponsorName?: string;
  sponsorPhone?: string;
}

export interface DailySummaryEntry {
  id: string;
  type: DailySummaryType;
  createdAt: string;
  date: string;
  attachments: { name: string; url: string; size?: string }[];
  
  delivery_passports?: {
    fullName: string;
    nationality: string;
    passportNumber: string;
    docNumber?: string;
    phone?: string;
    address?: string;
    work?: string;
    entryDate?: string;
    visitType?: string;
    visitExpiry?: string;
    sponsorName?: string;
    sponsorPhone?: string;
  };
  
  receive_passports?: {
    portName: string;
    recordNumber: string;
    recordDate: string;
    passportsCount: number;
    passportDetails: PassportDetail[];
    docNumber?: string;
  };

  receive_seizure_records?: {
    portName: string;
    recordNumber: string;
    recordDate: string;
    passportsCount: number;
    passportDetails: PassportDetail[];
    docNumber?: string;
  };

  residency_renewal_requests?: {
    memoNumber: string;
    memoDate: string;
    personName: string;
    affiliation: 'un_office' | 'un_envoy' | 'other';
    jobTitle: string;
    governorate: string;
    actionsTaken: string;
    status: 'completed' | 'pending';
    docNumber?: string;
    nationality?: string;
    passportNumber?: string;
    phone?: string;
    address?: string;
    work?: string;
    entryDate?: string;
    visitType?: string;
    visitExpiry?: string;
    sponsorName?: string;
    sponsorPhone?: string;
  };

  incoming_memos?: {
    incomingNumber: string;
    senderSector: string;
    address: string;
    subjectSummary: string;
    actionsTaken: string;
    status: 'needs_response' | 'pending' | 'responded';
    responseDocNumber?: string;
    docNumber?: string;
  };

  outgoing_memos?: {
    outgoingNumber: string;
    recipientSector: string;
    address: string;
    subjectSummary: string;
    actionsTaken: string;
    status: 'needs_response' | 'pending' | 'responded';
    incomingRefNumber?: string;
    docNumber?: string;
  };
}

export interface PersonalTask {
  id: string;
  title: string;
  dueDate?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}


