import { create } from "zustand";

const useActivityStore = create((set) => ({
  activities: [],
  snackbarOpen: false,
  snackbarMessage: "",
  snackbarSeverity: "success",
  addActivity: (activity) =>
    set((state) => ({
      activities: [
        ...state.activities,
        { ...activity, id: activity.id || Date.now() }, // Ensure id is unique
      ],
    })),
  setActivities: (activities) =>
    set(() => ({
      activities: Array.isArray(activities) ? activities : [], // Ensure activities is an array
    })),
  removeActivity: (activityId) =>
    set((state) => ({
      activities: state.activities.filter(
        (activity) => activity.activityId !== activityId
      ),
    })),
  updateActivity: (updatedActivity) =>
    set((state) => ({
      activities: state.activities.map((activity) =>
        activity.activityId === updatedActivity.activityId
          ? updatedActivity
          : activity
      ),
    })),
  setSnackbar: (message, severity) =>
    set(() => ({
      snackbarOpen: true,
      snackbarMessage: message,
      snackbarSeverity: severity,
    })),
  closeSnackbar: () =>
    set(() => ({
      snackbarOpen: false,
      snackbarMessage: "",
      snackbarSeverity: "success",
    })),
}));

export default useActivityStore;
