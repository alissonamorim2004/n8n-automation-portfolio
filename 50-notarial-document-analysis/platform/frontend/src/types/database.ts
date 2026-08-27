export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface AnalysisType {
  id: string;
  name: string;
  description: string;
  ai_model: string;
  template: string;
  created_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  analysis_type_id: string;
  file_name: string;
  file_url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result: any;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface TokenUsage {
  id: string;
  document_id: string | null;
  analysis_type_id: string;
  user_id: string;
  tokens_used: number;
  cost: number;
  created_at: string;
}

export interface TokenUsageStats {
  total_tokens: number;
  total_cost: number;
  by_user: Array<{
    user_id: string;
    full_name: string;
    tokens_used: number;
    cost: number;
  }>;
  by_analysis_type: Array<{
    analysis_type_id: string;
    name: string;
    tokens_used: number;
    cost: number;
  }>;
}
