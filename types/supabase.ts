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
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          id: string
          category_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      flashcards: {
        Row: {
          id: string
          subcategory_id: string
          native_text: string
          foreign_text: string
          pronunciation: string | null
          notes: string | null
          difficulty_level: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subcategory_id: string
          native_text: string
          foreign_text: string
          pronunciation?: string | null
          notes?: string | null
          difficulty_level?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subcategory_id?: string
          native_text?: string
          foreign_text?: string
          pronunciation?: string | null
          notes?: string | null
          difficulty_level?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_subcategory_id_fkey"
            columns: ["subcategory_id"]
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          }
        ]
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          flashcard_id: string
          stage: number
          status: string
          last_reviewed_at: string | null
          next_review_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          flashcard_id: string
          stage: number
          status: string
          last_reviewed_at?: string | null
          next_review_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          flashcard_id?: string
          stage?: number
          status?: string
          last_reviewed_at?: string | null
          next_review_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_flashcard_id_fkey"
            columns: ["flashcard_id"]
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
