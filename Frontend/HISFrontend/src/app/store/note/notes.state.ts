export interface Note {
  noteId: string;              
  appointmentId: string;      
  medicalHistoryId?: string;   
  noteText: string;
  createdAt?: string;          
}

export interface NotesState {
  notes: Note[];
  loading: boolean;
  error: string | null;
}

export const initialNotesState: NotesState = {
  notes: [],
  loading: false,
  error: null

};