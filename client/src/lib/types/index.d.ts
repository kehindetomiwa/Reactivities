// Mirrors Application/Core/PageList.cs — `NextCursor` is nullable there and
// comes back as null on the last page.
type PagedList<T, TCursor> = {
  items: T[];
  nextCursor: TCursor | null;
};

type Activity = {
  id: string;
  title: string;
  date: string;
  description: string;
  category: string;
  isCancelled: boolean;
  city: string;
  venue: string;
  latitude: number;
  longitude: number;
  attendees: Profile[];
  isGoing: boolean;
  isHost: boolean;
  hostId: string;
  hostDisplayName?: string;
  // useActivities derives this from the host's profile, which may have no
  // photo - keep it optional so the derived Activity still type-checks.
  hostImageUrl?: string;
};

// Mirrors Application/Profiles/DTOs/UserActivityDto.cs - the trimmed-down
// activity shape the profile Events tab renders.
type UserActivity = {
  id: string;
  title: string;
  category: string;
  date: string;
};

type Profile = {
  id: string;
  displayName: string;
  imageUrl?: string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  following?: boolean;
};

type Photo = {
  id: string;
  url: string;
};

type User = {
  id: string;
  email: string;
  displayName: string;
  imageUrl?: string;
};

type ChatComment = {
  id: string;
  createdAt: Date;
  body: string;
  userId: string;
  displayName: string;
  imageUrl?: string;
};
