'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Download, Search, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { TeamResult } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';

type SortKey = keyof TeamResult | '';

export function DashboardClient({ data }: { data: TeamResult[] }) {
  const [search, setSearch] = React.useState('');
  const [sortKey, setSortKey] = React.useState<SortKey>('totalScore');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [selectedTeam, setSelectedTeam] = React.useState<TeamResult | null>(
    null
  );

  const filteredData = React.useMemo(() => {
    if (!data) return [];
    return data.filter(
      (item) =>
        item.startupName.toLowerCase().includes(search.toLowerCase()) ||
        item.founderName.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const sortedData = React.useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortKey as keyof TeamResult];
      const bValue = b[sortKey as keyof TeamResult];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    });
  }, [filteredData, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Startup Name',
      'Founder Name',
      'Total Score',
      'Innovation',
      'Feasibility',
      'Market Potential',
      'Pitch Clarity',
      'Problem-Solution Fit',
      'Feedback Summary',
    ];
    const rows = sortedData.map((team) =>
      [
        team.startupName,
        team.founderName,
        team.totalScore,
        team.innovation,
        team.feasibility,
        team.marketPotential,
        team.pitchClarity,
        team.problemSolutionFit,
        `"${team.feedbackSummary.replace(/"/g, '""')}"`, // Handle quotes in summary
      ].join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      link.href = URL.createObjectURL(blob);
      link.download = 'pitch-perfect-ai-leaderboard.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 9) return 'default';
    if (score >= 7.5) return 'secondary';
    return 'destructive';
  };

  const chartData = selectedTeam
    ? [
        {
          subject: 'Innovation',
          score: selectedTeam.innovation,
          fullMark: 10,
        },
        {
          subject: 'Feasibility',
          score: selectedTeam.feasibility,
          fullMark: 10,
        },
        {
          subject: 'Market Potential',
          score: selectedTeam.marketPotential,
          fullMark: 10,
        },
        {
          subject: 'Pitch Clarity',
          score: selectedTeam.pitchClarity,
          fullMark: 10,
        },
        {
          subject: 'Problem-Solution Fit',
          score: selectedTeam.problemSolutionFit,
          fullMark: 10,
        },
      ]
    : [];

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
        <div className="w-full md:w-auto">
          <h1 className="text-3xl font-bold font-headline">
            Organizer Dashboard
          </h1>
          <p className="text-muted-foreground">
            Review and compare team evaluations.
          </p>
        </div>
        <div className="flex w-full md:w-auto md:ml-auto items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead
                onClick={() => handleSort('startupName')}
                className="cursor-pointer hover:bg-muted"
              >
                Startup Name <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
              </TableHead>
              <TableHead>Founder Name</TableHead>
              <TableHead
                onClick={() => handleSort('totalScore')}
                className="cursor-pointer hover:bg-muted text-right"
              >
                Total Score <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
              </TableHead>
              <TableHead className="hidden md:table-cell text-right">
                Innovation
              </TableHead>
              <TableHead className="hidden md:table-cell text-right">
                Feasibility
              </TableHead>
              <TableHead className="hidden md:table-cell text-right">
                Market Potential
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length > 0 ? (
              sortedData.map((team, index) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">#{index + 1}</TableCell>
                  <TableCell className="font-semibold">
                    {team.startupName}
                  </TableCell>
                  <TableCell>{team.founderName}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={getScoreBadgeVariant(team.totalScore)}
                      className="text-lg"
                    >
                      {team.totalScore.toFixed(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right">
                    {team.innovation.toFixed(1)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right">
                    {team.feasibility.toFixed(1)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right">
                    {team.marketPotential.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setSelectedTeam(team)}>
                          View Full Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Sheet open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
        <SheetContent className="w-full sm:max-w-2xl p-0">
          {selectedTeam && (
            <div className="h-full flex flex-col">
              <SheetHeader className="p-6 border-b">
                <SheetTitle className="text-2xl font-headline">
                  {selectedTeam.startupName}
                </SheetTitle>
                <SheetDescription>
                  Full evaluation report for {selectedTeam.founderName}.
                </SheetDescription>
              </SheetHeader>
              <div className="overflow-y-auto p-6 flex-grow">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Overall Score</h3>
                    <div className="text-center">
                      <p className="text-7xl font-bold text-primary">
                        {selectedTeam.totalScore.toFixed(1)}
                      </p>
                      <p className="text-muted-foreground">out of 10</p>
                    </div>
                    <h3 className="font-semibold text-lg pt-4">
                      Feedback Summary
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedTeam.feedbackSummary}
                    </p>
                  </div>
                  <div className="w-full h-[300px] lg:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        data={chartData}
                      >
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} />
                        <Radar
                          name="Score"
                          dataKey="score"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.6}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
