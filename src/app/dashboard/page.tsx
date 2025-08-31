import { DashboardClient } from '@/components/dashboard-client';
import type { TeamResult } from '@/lib/types';

const mockData: TeamResult[] = [
  {
    id: 'team-001',
    name: 'InnovateX',
    totalScore: 8.8,
    innovation: 9,
    feasibility: 8,
    marketPotential: 9,
    pitchClarity: 10,
    problemSolutionFit: 8,
    summary: 'Strong concept with a clear go-to-market strategy. High potential.',
  },
  {
    id: 'team-002',
    name: 'Synergy AI',
    totalScore: 7.2,
    innovation: 8,
    feasibility: 6,
    marketPotential: 8,
    pitchClarity: 7,
    problemSolutionFit: 7,
    summary: 'Innovative tech but feasibility concerns need to be addressed.',
  },
  {
    id: 'team-003',
    name: 'EcoSolutions',
    totalScore: 8.1,
    innovation: 7,
    feasibility: 9,
    marketPotential: 8,
    pitchClarity: 8,
    problemSolutionFit: 8.5,
    summary: 'Very feasible and addresses a real-world problem. Market adoption is key.',
  },
  {
    id: 'team-004',
    name: 'HealthBridge',
    totalScore: 6.5,
    innovation: 6,
    feasibility: 7,
    marketPotential: 7,
    pitchClarity: 6,
    problemSolutionFit: 6.5,
    summary: 'Pitch was unclear in certain areas. Competitive landscape is a major challenge.',
  },
  {
    id: 'team-005',
    name: 'QuantumLeap',
    totalScore: 9.2,
    innovation: 10,
    feasibility: 7,
    marketPotential: 10,
    pitchClarity: 9,
    problemSolutionFit: 10,
    summary: 'Potentially market-defining innovation. High risk, high reward.',
  },
];


export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <DashboardClient data={mockData} />
    </div>
  );
}
