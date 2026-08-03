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
}

type Profile = {
  id: string
  displayName: string
  imageUrl?: string
  bio?: string
}

type User = {
  id: string
  email: string
  displayName: string
  imageUrl?: string
  
}