import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, TeamMember, Schedule } from '../types';

interface StoreActions {
  addTeamMember: (member: TeamMember) => void;
  removeTeamMember: (id: string) => void;
  updateTeamMember: (member: TeamMember) => void;
  setCurrentSchedule: (schedule: Schedule | null) => void;
  addScheduleToHistory: (schedule: Schedule) => void;
}

const initialState: AppState = {
  team: [],
  currentSchedule: null,
  scheduleHistory: [],
};

export const useStore = create<AppState & StoreActions>()(
  persist(
    (set) => ({
      ...initialState,
      addTeamMember: (member) =>
        set((state) => ({ team: [...state.team, member] })),
      removeTeamMember: (id) =>
        set((state) => ({
          team: state.team.filter((member) => member.id !== id),
        })),
      updateTeamMember: (member) =>
        set((state) => ({
          team: state.team.map((m) => (m.id === member.id ? member : m)),
        })),
      setCurrentSchedule: (schedule) =>
        set(() => ({ currentSchedule: schedule })),
      addScheduleToHistory: (schedule) =>
        set((state) => ({
          scheduleHistory: [...state.scheduleHistory, schedule],
        })),
    }),
    {
      name: 'fleet-sync-storage',
    }
  )
); 