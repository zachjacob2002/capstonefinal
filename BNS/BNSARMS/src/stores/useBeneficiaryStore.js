// useBeneficiaryStore.js
import { create } from "zustand";

const useBeneficiaryStore = create((set) => ({
  beneficiaries: [],
  setBeneficiaries: (beneficiaries) => set({ beneficiaries }),
  addOrUpdateBeneficiary: (beneficiary, id) =>
    set((state) => ({
      beneficiaries: id
        ? state.beneficiaries.map((b) => (b.id === id ? beneficiary : b))
        : [...state.beneficiaries, beneficiary],
    })),
  deleteBeneficiary: (id) =>
    set((state) => ({
      beneficiaries: state.beneficiaries.filter((b) => b.id !== id),
    })),
}));

export default useBeneficiaryStore;
