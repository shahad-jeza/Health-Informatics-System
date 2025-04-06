import { AdminSummaryDto } from "../../models/summary.model";


// The state interface for the summary feature
export interface SummaryState {
  summary: AdminSummaryDto | null;
  loading: boolean;
  error: any;
}

export const initialState: SummaryState = {
  summary: null,
  loading: false,
  error: null
};