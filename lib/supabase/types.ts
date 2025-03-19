export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      direct_messages: {
        Row: {
          id: string
          content: string
          sender_id: string
          receiver_id: string
          read: boolean
          edited: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          sender_id: string
          receiver_id: string
          read?: boolean
          edited?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          sender_id?: string
          receiver_id?: string
          read?: boolean
          edited?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      global_messages: {
        Row: {
          id: string
          content: string
          user_id: string
          edited: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          user_id: string
          edited?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          user_id?: string
          edited?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      message_reactions: {
        Row: {
          id: string
          message_id: string | null
          user_id: string
          reaction: string
          created_at: string
        }
        Insert: {
          id?: string
          message_id?: string | null
          user_id: string
          reaction: string
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string | null
          user_id?: string
          reaction?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          status: string
          last_seen: string
          created_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          status?: string
          last_seen?: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          status?: string
          last_seen?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 