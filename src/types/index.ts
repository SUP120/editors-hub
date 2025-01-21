export type Profile = {
  id: string
  full_name: string
  display_name: string
  avatar_url: string
  bio: string
  email: string
  location: string
  phone_number: string
  is_artist: boolean
}

export type ArtistProfile = {
  id: string
  specialty: string[]
  skills: string[]
  hourly_rate: number
  years_of_experience: number
  education: string[]
  certifications: string[]
  languages: string[]
  portfolio_urls: string[]
  rating: number
  total_reviews: number
  availability_status: string
}

export type Work = {
  id: string
  title: string
  description: string
  price: number
  category: string
  subcategory: string
  images: string[]
  tags: string[]
  status: string
  artist_id: string
  created_at: string
  is_featured: boolean
  video_url?: string
  before_image?: string
  after_image?: string
  sort_order: number
  custom_url_slug: string
  delivery_time: number
  profiles?: Profile
}

export type Review = {
  id: string
  order_id: string
  artist_id: string
  client_id: string
  rating: number
  comment: string
  created_at: string
}

export type Order = {
  id: string
  work_id: string
  client_id: string
  artist_id: string
  status: string
  payment_status: string
  requirements: string
  project_files_link?: string
  completed_work_link?: string
  created_at: string
  total_amount: number
  work: Work
  artist: Profile
  client: Profile
  review?: Review
} 