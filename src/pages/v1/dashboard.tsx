"use client";

import { useState } from "react";
import {
  Clock,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
  Tv,
  Settings,
  CheckCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEventStore } from "@/stores";
import { exportRunsToDatagridRows } from "@/helpers/runs-to-datagrid-rows";
import { IRun } from "@/domain";
import { ActionButtons } from "./action-buttons";

interface Run extends any {}

// Sample data
const sampleRuns: Run[] = [
  {
    id: "1",
    game: "Super Mario 64",
    category: "70 Stars",
    platform: "Nintendo 64",
    year: "1996",
    estimate: "00:55:00",
    runners: ["Cheese", "Simply"],
    hosts: ["Keizaron"],
    commentators: ["Trihex", "Fuzzyness"],
    image: "/placeholder.svg?height=100&width=180",
    status: "upcoming",
  },
  {
    id: "2",
    game: "The Legend of Zelda: Ocarina of Time",
    category: "Any%",
    platform: "Nintendo 64",
    year: "1998",
    estimate: "00:17:30",
    runners: ["ZFG"],
    hosts: ["Spike"],
    commentators: ["Marco", "Sethbling"],
    image: "/placeholder.svg?height=100&width=180",
    status: "upcoming",
  },
  {
    id: "3",
    game: "Celeste",
    category: "All Chapters",
    platform: "PC",
    year: "2018",
    estimate: "01:30:00",
    runners: ["TGH", "Lena"],
    hosts: ["GDQ Staff"],
    commentators: ["Maddy Thorson", "Kevin"],
    image: "/placeholder.svg?height=100&width=180",
    status: "upcoming",
  },
  {
    id: "4",
    game: "Hades",
    category: "Fresh File",
    platform: "PC",
    year: "2020",
    estimate: "00:25:00",
    runners: ["Vorime"],
    hosts: ["Kungfufruitcup"],
    commentators: ["Btyoung", "Museus"],
    image: "/placeholder.svg?height=100&width=180",
    status: "upcoming",
  },
  {
    id: "5",
    game: "Pokémon Red/Blue",
    category: "Glitchless",
    platform: "Game Boy",
    year: "1996",
    estimate: "01:50:00",
    runners: ["Shenanagans", "Pokeguy"],
    hosts: ["Adef"],
    commentators: ["Keizaron", "Gunnermaniac"],
    image: "/placeholder.svg?height=100&width=180",
    status: "upcoming",
  },
];

export default function Dashboard() {
  // const [runs, setRuns] = useState<Run[]>(sampleRuns)
  const [searchTerm, setSearchTerm] = useState("");

  const { current_event_id, events } = useEventStore((store) => store.state);
  const { setCurrentEvent, removeRun } = useEventStore();

  const getDatagridDataByEventId = (eventId: string | null) => {
    if (!eventId) {
      return [];
    }

    const activeEvent = events.find(({ id }) => id === eventId);
    if (!activeEvent) {
      return [];
    }

    return exportRunsToDatagridRows(activeEvent.runs);
  };

  const runs: IRun[] = getDatagridDataByEventId(current_event_id);
  console.log("runs", runs);

  const filteredRuns = runs.filter(
    (run) =>
      run.game.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.runners.some((runner) =>
        runner.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      run.comments.some((commentator) =>
        commentator.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        {/* <div className="ml-auto flex items-center gap-4">
          <Button variant="outline" onClick={() => {}}>
            Import from HORARO
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Run
          </Button>
        </div> */}
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por runs..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Platform</DropdownMenuItem>
              <DropdownMenuItem>Year</DropdownMenuItem>
              <DropdownMenuItem>Estimate</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div>
              <CardTitle>Evento XYZ</CardTitle>
              <CardDescription>
                Gerencie o funcionamento do evento.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Game</TableHead>
                  <TableHead>Runners</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Commentators
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      Estimate
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRuns.map((run) => (
                  <TableRow
                    key={run.id}
                    className={
                      run.status === "live"
                        ? "bg-red-50 dark:bg-red-950/20"
                        : ""
                    }
                  >
                    <TableCell>
                      <div className="flex flex-col gap-1 sm:flex-row">
                        <ActionButtons row={run} />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium min-w-64">
                      <div className="flex items-center gap-3">
                        {/* <img
                          src={run.image || "/placeholder.svg"}
                          alt={run.game}
                          width={50}
                          height={30}
                          className="rounded object-cover"
                        /> */}
                        {run.game}
                      </div>
                      <div className="flex flex-row flex-wrap">
                        {run.category && (
                          <Badge variant="default" className="mr-1">
                            {run.category}
                          </Badge>
                        )}
                        {run.platform && (
                          <Badge variant="secondary" className="mr-1">
                            {run.platform}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {run.runners.map((runner, index) => (
                          <Badge key={index} variant="outline">
                            {runner.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {run.comments.map((commentator, index) => (
                          <Badge key={index} variant="secondary">
                            {commentator.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{run.estimate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => {}}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {}}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {}}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
