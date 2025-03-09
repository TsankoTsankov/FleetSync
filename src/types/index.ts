export type Role = 'operator' | 'driver';

export interface TeamMember {
  id: string;
  name: string;
  roles: Role[];
}

export interface Shift {
  id: string;
  date: string;
  memberId: string;
  role: Role;
}

export interface Schedule {
  id: string;
  month: number;
  year: number;
  shifts: Shift[];
}

export interface AppState {
  team: TeamMember[];
  currentSchedule: Schedule | null;
  scheduleHistory: Schedule[];
} 