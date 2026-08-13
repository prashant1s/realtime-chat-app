import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || "Something went wrong";

const USERS_POLL_INTERVAL = 8000;
const MESSAGES_POLL_INTERVAL = 3000;

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  usersPollId: null,
  messagesPollId: null,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  },

  // No Socket.io on Vercel serverless, so the sidebar polls for presence
  // (users' lastSeen) and the open conversation polls for new messages.
  startUsersPolling: () => {
    if (get().usersPollId) return;
    const id = setInterval(() => get().getUsers(), USERS_POLL_INTERVAL);
    set({ usersPollId: id });
  },
  stopUsersPolling: () => {
    const id = get().usersPollId;
    if (id) clearInterval(id);
    set({ usersPollId: null });
  },

  startMessagesPolling: (userId) => {
    get().stopMessagesPolling();
    const id = setInterval(() => get().getMessages(userId), MESSAGES_POLL_INTERVAL);
    set({ messagesPollId: id });
  },
  stopMessagesPolling: () => {
    const id = get().messagesPollId;
    if (id) clearInterval(id);
    set({ messagesPollId: null });
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
