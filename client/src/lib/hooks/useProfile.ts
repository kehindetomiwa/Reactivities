import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import { useMemo } from "react";
import type { EditProfileSchema } from "../Schemas/editProfileSchema";

export const useProfile = (id?: string) => {

  const queryClient = useQueryClient();
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const response = await agent.get<Profile>(`/profiles/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const {data: photos, isLoading: loadingPhotos } = 
  useQuery<Photo[]>({
    queryKey: ["photos", id],
    queryFn: async () => {
      const response = await agent.get<Photo[]>(`/profiles/${id}/photos`);
      return response.data
    },
    enabled: !!id,
  })

  const uploadPhoto = useMutation<Photo, Error, Blob>({
    mutationFn: async(file: Blob) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await agent.post('/profiles/add-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data'}
      });
      return response.data
    },
    onSuccess: async (photo) => {
      await queryClient.invalidateQueries({
        queryKey: ['photos', id]
      });
      // setQueryData targets one key; setQueriesData takes a *filters object*,
      // so passing a bare array silently matched nothing and the avatar in the
      // NavBar never picked up the first uploaded photo.
      queryClient.setQueryData<User | null>(['user'], (data) => {
          if(!data) return data;
          return {
            ...data,
            imageUrl: data.imageUrl ?? photo.url
          }
      });
      queryClient.setQueryData<Profile>(['profile', id], (data) => {
          if(!data) return data;
          return {
            ...data,
            imageUrl: data.imageUrl ?? photo.url
          }
      });
    }
  })

  const settMainPhoto = useMutation({
    mutationFn: async (photo: Photo) => {
      await agent.put(`/profiles/${photo.id}/setMain`)
    },
    onSuccess: (_, photo) => {
      queryClient.setQueryData(['user'], (userData: User) => {
        if(!userData) return userData;
        return {
          ...userData,
          imageUrl: photo.url
        }
      });
      queryClient.setQueryData(['profile', id], (profile: Profile) => {
        if(!profile) return profile;
        return {
          ...profile,
          imageUrl: photo.url
        }
      })
    }
  })

  const deletePhoto = useMutation({
    mutationFn: async (photoId: string) => {
      await agent.delete(`/profiles/${ photoId }/photos`)
    },
    onSuccess: (_,photoId) => {
      queryClient.setQueryData(['photos', id], (photos: Photo[]) => {
        return photos?.filter(x => x.id !== photoId)
      })
    }

  })

  const updateProfile = useMutation({
    mutationFn: async (profile: EditProfileSchema) => {
      await agent.put(`/profiles`, profile);
    },
    onSuccess: (_, profile) => {
      // Set on success rather than invalidate: the API returns no body, and the
      // NavBar reads displayName off ['user'] while the header reads ['profile'].
      queryClient.setQueryData<Profile>(['profile', id], (data) => {
        if (!data) return data;
        return {
          ...data,
          displayName: profile.displayName,
          bio: profile.bio,
        };
      });
      queryClient.setQueryData<User | null>(['user'], (data) => {
        if (!data) return data;
        return {
          ...data,
          displayName: profile.displayName,
        };
      });
    },
  });

  const isCurrentUser = useMemo(() => {
    return id === queryClient.getQueryData<User>(['user'])?.id

  }, [id, queryClient]);

  return {
    profile,
    loadingProfile,
    photos,
    loadingPhotos,
    isCurrentUser,
    uploadPhoto,
    settMainPhoto,
    deletePhoto,
    updateProfile

  };
};
