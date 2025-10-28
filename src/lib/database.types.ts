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
      draws: {
        Row: {
          id: string
          date: string
          slot: string
          draw_no: string
          digit_1: string
          digit_2: string
          digit_3: string
          digit_4: string
          digit_5: string
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          slot: string
          draw_no: string
          digit_1: string
          digit_2: string
          digit_3: string
          digit_4: string
          digit_5: string
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          slot?: string
          draw_no?: string
          digit_1?: string
          digit_2?: string
          digit_3?: string
          digit_4?: string
          digit_5?: string
          published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      news_posts: {
        Row: {
          id: string
          title: string
          body: string
          author: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          body: string
          author?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          body?: string
          author?: string
          created_at?: string
          updated_at?: string
        }
      }
      faqs: {
        Row: {
          id: string
          question: string
          answer: string
          order_index: number
        }
        Insert: {
          id?: string
          question: string
          answer: string
          order_index?: number
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          order_index?: number
        }
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          phone: string
          email: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          email: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string
          message?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}