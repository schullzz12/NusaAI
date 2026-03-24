// ============================================
// Database types (mirrors Supabase schema)
// ============================================

export interface User {
  id: string;
  email: string;
  display_name: string;
  credits: number;
  plan: "starter" | "reguler" | "sultan";
  is_verified_age: boolean;
  created_at: string;
}

export interface Character {
  id: string;
  name: string;
  persona: string;
  avatar_url: string;
  greeting: string;
  system_prompt: string;
  is_active: boolean;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  character_id: string;
  role: "user" | "assistant";
  content: string;
  image_url?: string | null;
  credits_used: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: "topup" | "usage";
  amount: number;
  credits: number;
  status: "pending" | "paid" | "failed" | "expired";
  xendit_invoice_id?: string;
  description: string;
  created_at: string;
}

// ============================================
// API types
// ============================================

export interface ChatRequest {
  character_id: string;
  message: string;
}

export interface ChatResponse {
  message: string;
  credits_remaining: number;
}

export interface GenerateImageRequest {
  character_id: string;
  prompt: string;
}

export interface GenerateImageResponse {
  image_url: string;
  credits_remaining: number;
}

// ============================================
// RunPod types
// ============================================

export interface RunPodChatPayload {
  input: {
    prompt: string;
    max_tokens: number;
    temperature: number;
    top_p: number;
    stop?: string[];
  };
}

export interface RunPodChatResponse {
  id: string;
  status: "COMPLETED" | "IN_PROGRESS" | "FAILED";
  output?: {
    text: string;
  };
}

export interface RunPodImagePayload {
  input: {
    prompt: string;
    negative_prompt?: string;
    width: number;
    height: number;
    num_inference_steps: number;
    guidance_scale: number;
    seed?: number;
  };
}

export interface RunPodImageResponse {
  id: string;
  status: "COMPLETED" | "IN_PROGRESS" | "FAILED";
  output?: {
    image_url?: string;
    images?: string[]; // base64
  };
}

// ============================================
// Xendit types
// ============================================

export interface XenditInvoice {
  external_id: string;
  amount: number;
  description: string;
  customer: {
    email: string;
  };
  success_redirect_url: string;
  failure_redirect_url: string;
  invoice_duration: number;
  payment_methods: string[];
}

export interface XenditWebhookPayload {
  id: string;
  external_id: string;
  status: "PAID" | "EXPIRED" | "FAILED";
  amount: number;
  paid_at?: string;
  payment_method?: string;
}

// ============================================
// Credit costs
// ============================================

export const CREDIT_COSTS = {
  CHAT_MESSAGE: 1,
  IMAGE_GENERATION: 5,
} as const;

export const PLANS = {
  starter: { name: "Starter", price: 0, credits: 50 },
  reguler: { name: "Reguler", price: 49000, credits: 1000 },
  sultan: { name: "Sultan", price: 99000, credits: 3000 },
} as const;
