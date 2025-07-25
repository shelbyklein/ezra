/**
 * Profile settings component for managing user profile and avatar
 */

import React, { useState, useRef } from 'react';
import {
  VStack,
  HStack,
  Box,
  Avatar,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  IconButton,
  useToast,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { FaCamera } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
  created_at: string;
}

export const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  // Fetch user profile
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await api.get('/users/profile');
      return response.data;
    },
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await api.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Profile picture updated',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: () => {
      toast({
        title: 'Failed to upload profile picture',
        status: 'error',
        duration: 5000,
      });
    },
  });

  // Delete avatar mutation
  const deleteAvatarMutation = useMutation({
    mutationFn: async () => {
      await api.delete('/users/avatar');
    },
    onSuccess: () => {
      toast({
        title: 'Profile picture removed',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });

  // Update username mutation
  const updateUsernameMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await api.put('/users/profile', { username });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Username updated',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setIsEditingName(false);
    },
    onError: () => {
      toast({
        title: 'Failed to update username',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Profile picture must be less than 5MB',
          status: 'error',
          duration: 5000,
        });
        return;
      }
      uploadAvatarMutation.mutate(file);
    }
  };

  const handleEditUsername = () => {
    setNewUsername(profile?.username || '');
    setIsEditingName(true);
  };

  const handleSaveUsername = () => {
    if (newUsername && newUsername !== profile?.username) {
      updateUsernameMutation.mutate(newUsername);
    } else {
      setIsEditingName(false);
    }
  };

  if (isLoading) {
    return (
      <Center py={8}>
        <Spinner size="lg" />
      </Center>
    );
  }

  return (
    <VStack id="profile-settings" className="profile-settings-section" align="stretch" spacing={6}>
      {/* Profile Picture Section */}
      <Box id="profile-picture-section">
        <FormLabel>Profile Picture</FormLabel>
        <HStack spacing={4} align="center">
          <Box position="relative">
            <Avatar
              id="user-avatar"
              size="2xl"
              name={profile?.username}
              src={profile?.avatar_url}
            />
            <IconButton
              id="avatar-camera-button"
              aria-label="Upload photo"
              icon={<FaCamera />}
              size="sm"
              colorScheme="blue"
              borderRadius="full"
              position="absolute"
              bottom={0}
              right={0}
              onClick={() => fileInputRef.current?.click()}
              isLoading={uploadAvatarMutation.isPending}
            />
            <Input
              id="avatar-file-input"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              display="none"
            />
          </Box>
          <VStack align="start" spacing={2}>
            <Button
              id="upload-avatar-button"
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              isLoading={uploadAvatarMutation.isPending}
            >
              Upload New Photo
            </Button>
            {profile?.avatar_url && (
              <Button
                id="remove-avatar-button"
                size="sm"
                variant="ghost"
                colorScheme="red"
                leftIcon={<DeleteIcon />}
                onClick={() => deleteAvatarMutation.mutate()}
                isLoading={deleteAvatarMutation.isPending}
              >
                Remove Photo
              </Button>
            )}
          </VStack>
        </HStack>
      </Box>

      {/* Username Section */}
      <FormControl id="username-section">
        <FormLabel htmlFor="username-display">Username</FormLabel>
        {isEditingName ? (
          <HStack>
            <Input
              id="username-input"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter username"
            />
            <Button
              id="save-username-button"
              size="sm"
              colorScheme="blue"
              onClick={handleSaveUsername}
              isLoading={updateUsernameMutation.isPending}
            >
              Save
            </Button>
            <Button
              id="cancel-username-button"
              size="sm"
              variant="ghost"
              onClick={() => setIsEditingName(false)}
            >
              Cancel
            </Button>
          </HStack>
        ) : (
          <HStack>
            <Text>{profile?.username}</Text>
            <IconButton
              aria-label="Edit username"
              icon={<EditIcon />}
              size="sm"
              variant="ghost"
              onClick={handleEditUsername}
            />
          </HStack>
        )}
      </FormControl>

      {/* Email Section */}
      <FormControl>
        <FormLabel>Email</FormLabel>
        <Text>{profile?.email}</Text>
        <Text fontSize="sm" color="gray.500">
          Contact support to change your email address
        </Text>
      </FormControl>

      {/* Account Created */}
      <FormControl>
        <FormLabel>Member Since</FormLabel>
        <Text>
          {profile?.created_at
            ? new Date(profile.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : 'Unknown'}
        </Text>
      </FormControl>
    </VStack>
  );
};