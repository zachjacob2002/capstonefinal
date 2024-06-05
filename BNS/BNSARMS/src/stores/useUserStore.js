// useUserStore.js
import { create } from "zustand";

const useUserStore = create((set) => ({
  users: [],
  setUsers: (users) => set({ users }),
  addUser: (user) =>
    set((state) => ({
      users: [...state.users, user],
    })),
  updateUser: (updatedUser) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === updatedUser.id ? updatedUser : user
      ),
    })),
  deleteUser: (userId) =>
    set((state) => ({
      users: state.users.filter((user) => user.id !== userId),
    })),
}));

export default useUserStore;
