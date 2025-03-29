import { Note as ModelNote } from '../../models/note.model';

export interface Note extends ModelNote {
  createdAt: string; 
}

export interface NotesState {
  notes: Note[];
  notesByAppointment: Record<number, Note[]>;
  selectedNoteId: number | null;
  loading: boolean;
  error: string | null;
}

export const initialNotesState: NotesState = {
  notes: [],
  notesByAppointment: {},
  selectedNoteId: null,
  loading: false,
  error: null
};