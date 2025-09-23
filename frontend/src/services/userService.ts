import { UserInterface } from '@/types/chat';

export const getAllUsers = async (): Promise<UserInterface[]> => {
  try {
    const response = await fetch('http://localhost:5000/api/v1/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      cache: 'no-store',
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to fetch users:', response.status, errorData);
      throw new Error(`Failed to fetch users: ${response.status} ${errorData.message || response.statusText}`);
    }
    const data = await response.json();
    console.log('Fetched users:', data); // Add this line for debugging
    return data;
  } catch (error) {
    console.error('Error in getAllUsers:', error); // More specific error logging
    throw error;
  }
};
