import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/api';

// Async thunks
export const fetchPosts = createAsyncThunk(
  'social/fetchPosts',
  async ({ filter = 'all', page = 1, limit = 10, refresh = false }, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_ENDPOINTS.POSTS, {
        params: { filter, page, limit }
      });
      return { data: response.data, refresh };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch posts' });
    }
  }
);

export const fetchPostById = createAsyncThunk(
  'social/fetchPostById',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.POSTS}/${postId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch post' });
    }
  }
);

export const createPost = createAsyncThunk(
  'social/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_ENDPOINTS.POSTS, postData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create post' });
    }
  }
);

export const updatePost = createAsyncThunk(
  'social/updatePost',
  async ({ postId, postData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_ENDPOINTS.POSTS}/${postId}`, postData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update post' });
    }
  }
);

export const deletePost = createAsyncThunk(
  'social/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_ENDPOINTS.POSTS}/${postId}`);
      return postId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete post' });
    }
  }
);

export const likePost = createAsyncThunk(
  'social/likePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_ENDPOINTS.POSTS}/${postId}/like`);
      return { postId, liked: response.data.liked };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to like post' });
    }
  }
);

export const savePost = createAsyncThunk(
  'social/savePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_ENDPOINTS.POSTS}/${postId}/save`);
      return { postId, saved: response.data.saved };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to save post' });
    }
  }
);

export const fetchComments = createAsyncThunk(
  'social/fetchComments',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.POSTS}/${postId}/comments`);
      return { postId, comments: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch comments' });
    }
  }
);

export const createComment = createAsyncThunk(
  'social/createComment',
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_ENDPOINTS.POSTS}/${postId}/comments`, { content });
      return { postId, comment: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create comment' });
    }
  }
);

export const likeComment = createAsyncThunk(
  'social/likeComment',
  async ({ postId, commentId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_ENDPOINTS.POSTS}/${postId}/comments/${commentId}/like`);
      return { postId, commentId, liked: response.data.liked };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to like comment' });
    }
  }
);

export const deleteComment = createAsyncThunk(
  'social/deleteComment',
  async ({ postId, commentId }, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_ENDPOINTS.POSTS}/${postId}/comments/${commentId}`);
      return { postId, commentId };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete comment' });
    }
  }
);

// Helper function to update post in array
const updatePostInArray = (posts, postId, updateFunc) => {
  return posts.map(post => {
    if (post._id === postId) {
      return updateFunc(post);
    }
    return post;
  });
};

// Initial state
const initialState = {
  posts: [],
  currentPost: null,
  comments: [],
  loading: false,
  refreshing: false,
  error: null,
  currentPage: 1,
  hasMore: true,
  commentLoading: false,
};

// Slice
const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    clearComments: (state) => {
      state.comments = [];
    },
    resetSocialState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch posts
      .addCase(fetchPosts.pending, (state, action) => {
        const { refresh } = action.meta.arg;
        state.loading = true;
        state.refreshing = refresh || false;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        const { data, refresh } = action.payload;
        
        if (refresh) {
          state.posts = data;
          state.currentPage = 2; // Next page would be 2
        } else {
          state.posts = [...state.posts, ...data];
          state.currentPage += 1;
        }
        
        state.hasMore = data.length > 0;
        state.loading = false;
        state.refreshing = false;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload;
      })
      
      // Fetch post by ID
      .addCase(fetchPostById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.currentPost = action.payload;
        state.loading = false;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts = [action.payload, ...state.posts];
        state.loading = false;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update post
      .addCase(updatePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.posts = updatePostInArray(state.posts, action.payload._id, () => action.payload);
        
        if (state.currentPost && state.currentPost._id === action.payload._id) {
          state.currentPost = action.payload;
        }
        
        state.loading = false;
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete post
      .addCase(deletePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(post => post._id !== action.payload);
        
        if (state.currentPost && state.currentPost._id === action.payload) {
          state.currentPost = null;
        }
        
        state.loading = false;
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Like post
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, liked } = action.payload;
        
        state.posts = updatePostInArray(state.posts, postId, (post) => ({
          ...post,
          isLiked: liked,
          likesCount: liked ? (post.likesCount || 0) + 1 : (post.likesCount || 1) - 1,
        }));
        
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost = {
            ...state.currentPost,
            isLiked: liked,
            likesCount: liked ? (state.currentPost.likesCount || 0) + 1 : (state.currentPost.likesCount || 1) - 1,
          };
        }
      })
      
      // Save post
      .addCase(savePost.fulfilled, (state, action) => {
        const { postId, saved } = action.payload;
        
        state.posts = updatePostInArray(state.posts, postId, (post) => ({
          ...post,
          isSaved: saved,
        }));
        
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost = {
            ...state.currentPost,
            isSaved: saved,
          };
        }
      })
      
      // Fetch comments
      .addCase(fetchComments.pending, (state) => {
        state.commentLoading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments = action.payload.comments;
        state.commentLoading = false;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.commentLoading = false;
        state.error = action.payload;
      })
      
      // Create comment
      .addCase(createComment.pending, (state) => {
        state.commentLoading = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.comments = [action.payload.comment, ...state.comments];
        
        // Update comment count in posts and current post
        const postId = action.payload.postId;
        
        state.posts = updatePostInArray(state.posts, postId, (post) => ({
          ...post,
          commentsCount: (post.commentsCount || 0) + 1,
        }));
        
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost = {
            ...state.currentPost,
            commentsCount: (state.currentPost.commentsCount || 0) + 1,
          };
        }
        
        state.commentLoading = false;
      })
      .addCase(createComment.rejected, (state, action) => {
        state.commentLoading = false;
        state.error = action.payload;
      })
      
      // Like comment
      .addCase(likeComment.fulfilled, (state, action) => {
        const { commentId, liked } = action.payload;
        
        state.comments = state.comments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              isLiked: liked,
              likesCount: liked ? (comment.likesCount || 0) + 1 : (comment.likesCount || 1) - 1,
            };
          }
          return comment;
        });
      })
      
      // Delete comment
      .addCase(deleteComment.pending, (state) => {
        state.commentLoading = true;
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { postId, commentId } = action.payload;
        
        state.comments = state.comments.filter(comment => comment._id !== commentId);
        
        // Update comment count in posts and current post
        state.posts = updatePostInArray(state.posts, postId, (post) => ({
          ...post,
          commentsCount: Math.max((post.commentsCount || 1) - 1, 0),
        }));
        
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost = {
            ...state.currentPost,
            commentsCount: Math.max((state.currentPost.commentsCount || 1) - 1, 0),
          };
        }
        
        state.commentLoading = false;
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.commentLoading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { clearCurrentPost, clearComments, resetSocialState } = socialSlice.actions;
export default socialSlice.reducer;