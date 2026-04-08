export type Position =
  | 'Torwart'
  | 'Innenverteidiger'
  | 'Außenverteidiger'
  | 'Defensives Mittelfeld'
  | 'Zentrales Mittelfeld'
  | 'Offensives Mittelfeld'
  | 'Linksaußen'
  | 'Rechtsaußen'
  | 'Mittelstürmer'

export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  club_name: string | null
  position: string | null
  avatar_url: string | null
  bio: string | null
  total_earnings: number
  created_at: string
}

export interface Video {
  id: string
  player_id: string
  title: string
  video_url: string
  view_count: number
  created_at: string
}

