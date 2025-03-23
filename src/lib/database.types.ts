export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          created_at: string
          is_artist: boolean
          is_admin: boolean
        }
      }
      orders: {
        Row: {
          id: string
          client_id: string
          artist_id: string
          status: string
          created_at: string
          amount: number
          description: string
        }
      }
      works: {
        Row: {
          id: string
          artist_id: string
          title: string
          description: string
          category: string
          price: number
          created_at: string
          images: string[]
        }
      }
      artist_profiles: {
        Row: {
          id: string
          artist_id: string
          rating: number
          bio: string
          skills: string[]
          created_at: string
        }
      }
      payment_requests: {
        Row: {
          id: string
          artist_id: string
          amount: number
          status: 'pending' | 'approved' | 'rejected'
          requested_at: string
          payment_type: 'upi' | 'bank'
          profiles: {
            full_name: string
          }
        }
      }
      payment_details: {
        Row: {
          id: string
          artist_id: string
          payment_type: 'upi' | 'bank'
          upi_id?: string
          bank_name?: string
          account_number?: string
          ifsc_code?: string
          account_holder_name?: string
          updated_at: string
        }
      }
      transaction_history: {
        Row: {
          id: string
          artist_id: string
          amount: number
          type: 'credit' | 'debit'
          description: string
          order_id?: string
          created_at: string
        }
      }
      artist_wallet: {
        Row: {
          artist_id: string
          current_balance: number
          total_earned: number
          last_updated: string
        }
      }
      artist_incidents: {
        Row: {
          id: string
          artist_id: string
          order_id: string
          incident_type: string
          description: string
          reported_at: string
          resolved: boolean
          artist: {
            full_name: string
            email: string
          }
        }
      }
      artist_violations: {
        Row: {
          id: string
          artist_id: string
          order_id: string
          reason: string
          created_at: string
          profiles: {
            full_name: string
            email: string
          }
        }
      }
    }
    Enums: {}
  }
} 