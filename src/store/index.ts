import { create } from 'zustand';
import { TeamMember, Schedule, Shift } from '../types';

interface State {
  team: TeamMember[];
  currentSchedule: Schedule | null;
  addTeamMember: (member: TeamMember) => void;
  removeTeamMember: (id: string) => void;
  setCurrentSchedule: (schedule: Schedule) => void;
  updateShift: (updatedShift: Shift) => void;
}

export const useStore = create<State>((set) => ({
  team: [],
  currentSchedule: null,
  addTeamMember: (member) =>
    set((state) => ({ team: [...state.team, member] })),
  removeTeamMember: (id) =>
    set((state) => ({ team: state.team.filter((m) => m.id !== id) })),
  setCurrentSchedule: (schedule) =>
    set({ currentSchedule: schedule }),
  updateShift: (updatedShift) =>
    set((state) => {
      if (!state.currentSchedule) return state;

      const updatedShifts = state.currentSchedule.shifts.map((shift) =>
        shift.id === updatedShift.id ? updatedShift : shift
      );

      return {
        currentSchedule: {
          ...state.currentSchedule,
          shifts: updatedShifts,
        },
      };
    }),
})); 