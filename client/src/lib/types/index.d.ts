type Activity = {
  id: string
  title: string
  date: string
  description: string
  category: string
  isCancelled: boolean
  city: string
  venue: string
  latitude: number
  longitude: number
  attendees: Profile[]
  isGoing: boolean
  isHost: boolean
  hostId: string
  hostDisplayName: string
  // useActivities derives this from the host's profile, which may have no
  // photo - keep it optional so the derived Activity still type-checks.
  hostImageUrl?: string
}

type Profile = {
  id: string
  displayName: string
  imageUrl?: string
  bio?: string
  followersCount?: number
  followingCount?: number
  following?: boolean
}

type Photo = {
  id: string
  url: string
}

type User = {
  id: string
  email: string
  displayName: string
  imageUrl?: string
  
}

type ChatComment = {
  id: string 
  createdAt: Date
  body: string
  userId: string
  displayName: string 
  imageUrl?: string
}