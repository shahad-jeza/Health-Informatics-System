export interface Note {
    id: number;
    appointmentId: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    createdBy: number;
  }
  
  export interface NoteState {
    notes: Note[];
    loading: boolean;
    error: string | null;
    selectedNoteId: number | null;
  }
  
