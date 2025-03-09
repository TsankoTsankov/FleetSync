import { TeamMember, Schedule, Shift } from '../types';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

interface WorkingPair {
  member1: TeamMember;
  member2: TeamMember;
}

interface MemberState {
  lastWorkDay: Date | null;
  consecutiveWorkDays: number;
}

function generatePairCombinations(team: TeamMember[]): WorkingPair[] {
  const pairs: WorkingPair[] = [];
  for (let i = 0; i < team.length - 1; i++) {
    for (let j = i + 1; j < team.length; j++) {
      const member1 = team[i];
      const member2 = team[j];
      if ((member1.roles.includes('operator') || member1.roles.includes('driver')) &&
          (member2.roles.includes('operator') || member2.roles.includes('driver'))) {
        pairs.push({ member1, member2 });
      }
    }
  }
  return pairs;
}

function canWork(
  memberId: string,
  date: Date,
  memberStates: Map<string, MemberState>
): boolean {
  const state = memberStates.get(memberId);
  if (!state) return true;

  // If member has worked 2 consecutive days, they need 2 days rest
  if (state.consecutiveWorkDays >= 2) {
    const daysSinceLastWork = Math.floor(
      (date.getTime() - state.lastWorkDay!.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceLastWork >= 2;
  }

  return true;
}

function updateMemberState(
  memberId: string,
  date: Date,
  memberStates: Map<string, MemberState>
): void {
  let state = memberStates.get(memberId);
  if (!state) {
    state = { lastWorkDay: null, consecutiveWorkDays: 0 };
  }

  if (state.lastWorkDay) {
    const daysSinceLastWork = Math.floor(
      (date.getTime() - state.lastWorkDay.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastWork === 1) {
      state.consecutiveWorkDays++;
    } else {
      state.consecutiveWorkDays = 1;
    }
  } else {
    state.consecutiveWorkDays = 1;
  }

  state.lastWorkDay = date;
  memberStates.set(memberId, state);
}

function findEligiblePair(
  date: Date,
  availablePairs: WorkingPair[],
  memberStates: Map<string, MemberState>,
  usedPairIndices: Set<number>
): { pair: WorkingPair; pairIndex: number } | null {
  for (let i = 0; i < availablePairs.length; i++) {
    if (usedPairIndices.has(i)) continue;
    
    const pair = availablePairs[i];
    if (canWork(pair.member1.id, date, memberStates) &&
        canWork(pair.member2.id, date, memberStates)) {
      return { pair, pairIndex: i };
    }
  }
  return null;
}

export function generateSchedule(year: number, month: number, team: TeamMember[]): Schedule {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const days = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  
  const allPairs = generatePairCombinations(team);
  const memberStates = new Map<string, MemberState>();
  const usedPairIndices = new Set<number>();
  
  let currentPair: WorkingPair | null = null;
  let isSecondDay = false;
  const allShifts: Shift[] = [];
  
  for (const day of days) {
    if (!currentPair || !isSecondDay) {
      // Find a new eligible pair
      const eligiblePairResult = findEligiblePair(day, allPairs, memberStates, usedPairIndices);
      
      if (!eligiblePairResult) {
        // If no eligible pairs, reset used pairs and try again
        usedPairIndices.clear();
        const retryResult = findEligiblePair(day, allPairs, memberStates, usedPairIndices);
        if (!retryResult) continue; // Skip this day if still no eligible pairs
        
        currentPair = retryResult.pair;
        usedPairIndices.add(retryResult.pairIndex);
      } else {
        currentPair = eligiblePairResult.pair;
        usedPairIndices.add(eligiblePairResult.pairIndex);
      }
      
      // Assign first day roles
      const dateStr = format(day, 'yyyy-MM-dd');
      allShifts.push(
        {
          id: uuidv4(),
          date: dateStr,
          memberId: currentPair.member1.id,
          role: 'operator'
        },
        {
          id: uuidv4(),
          date: dateStr,
          memberId: currentPair.member2.id,
          role: 'driver'
        }
      );
      
      updateMemberState(currentPair.member1.id, day, memberStates);
      updateMemberState(currentPair.member2.id, day, memberStates);
      
      isSecondDay = true;
    } else {
      // Second day - swap roles
      const dateStr = format(day, 'yyyy-MM-dd');
      allShifts.push(
        {
          id: uuidv4(),
          date: dateStr,
          memberId: currentPair!.member2.id,
          role: 'operator'
        },
        {
          id: uuidv4(),
          date: dateStr,
          memberId: currentPair!.member1.id,
          role: 'driver'
        }
      );
      
      updateMemberState(currentPair!.member1.id, day, memberStates);
      updateMemberState(currentPair!.member2.id, day, memberStates);
      
      isSecondDay = false;
      currentPair = null;
    }
  }
  
  return {
    id: uuidv4(),
    month,
    year,
    shifts: allShifts,
  };
} 