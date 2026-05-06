import { getStats, getProjects, getTasks, deleteTask, getAllMembers } from "@/app/actions/tasks";
import { getPersonalTodos, getSprints, getAssignedSprintTasks, getAssignedSprints, getMemberRepositoryLinks } from "@/app/actions/features";
import { getAdminTeams } from "@/app/actions/teams";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { CreateSprintDialog } from "@/components/create-sprint-dialog";
import { RepositoryDialog } from "@/components/repository-dialog";
import { JoinRoomDialog, CreateRoomDialog } from "@/components/meeting-dialogs";
import { CreateTodoDialog } from "@/components/create-todo-dialog";
import { MyTasksDialog } from "@/components/my-tasks-dialog";
import { TeamListDialog } from "@/components/team-list-dialog";
import { AddMemberDialog } from "@/components/add-member-dialog";
import { AdminActivityFeed } from "@/components/admin-activity-feed";
import { TaskPhaseButton } from "@/components/task-phase-button";
import { MemberSprintCardList } from "@/components/member-sprint-card-list";
import { MemberQuickActions } from "@/components/member-quick-actions";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TaskStatusSelect } from "@/components/task-status-select";
import { 
  Briefcase, 
  CheckSquare, 
  Trash2, 
  AlertCircle,
  Calendar,
  FileText,
  AlertTriangle,
  FolderOpen,
  RefreshCw,
  LayoutDashboard,
  User as UserIcon,
  Users,
  ShieldAlert,
  Activity,
  ArrowRight,
  GitBranch,
  Zap,
  Target,
  Plus,
  Clock
} from "lucide-react";
import { Role, TaskStatus, TaskPriority } from "@prisma/client";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const currentUserRole = user.role;
  const { projectCount, taskCount, completionRate } = await getStats();
  const projects = await getProjects();
  const tasks = await getTasks();
  const personalTodos = await getPersonalTodos();
  const allMembers = currentUserRole === Role.ADMIN ? await getAllMembers() : [];
  const adminTeams = currentUserRole === Role.ADMIN ? await getAdminTeams() : [];
  
  const sprints = currentUserRole === Role.ADMIN ? await getSprints() : [];
  const mySprintTasks = currentUserRole === Role.MEMBER ? await getAssignedSprintTasks(user.id) : [];
  const mySprints = currentUserRole === Role.MEMBER ? await getAssignedSprints(user.id) : [];
  const myRepositories = currentUserRole === Role.MEMBER ? await getMemberRepositoryLinks(user.id) : [];
  const myIssues = currentUserRole === Role.MEMBER ? tasks.filter((task) => task.assigneeId === user.id) : [];

  const isOverdue = (task: any) => {
    if (!task.dueDate || task.status === TaskStatus.DONE) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const overdueCount = tasks.filter(isOverdue).length;
  const uniqueProjects = projects.filter((project, index, list) =>
    index === list.findIndex((candidate) => candidate.name.trim().toLowerCase() === project.name.trim().toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Dashboard Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl shadow-inner group transition-all hover:bg-primary/20">
              <LayoutDashboard className="w-7 h-7 text-primary transition-transform group-hover:rotate-12" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                Hii, {user.name || user.email.split('@')[0]}
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                {currentUserRole === Role.ADMIN 
                  ? `Welcome back, Admin. Manage ${projectCount} active projects.`
                  : `Welcome back. You have ${taskCount} tasks assigned.`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="icon" className="rounded-xl shadow-sm hover:scale-110 active:scale-95 transition-all">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </Link>
            <div className="h-8 w-px bg-border mx-2" />
            {currentUserRole === Role.MEMBER && (
              <MemberQuickActions
                tasks={tasks}
                personalTodos={personalTodos}
                sprints={mySprints}
                issues={myIssues}
                repositories={myRepositories}
                currentUserId={user.id}
              />
            )}
            {currentUserRole === Role.ADMIN && (
              <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <MyTasksDialog
                  tasks={tasks}
                  currentUserId={user.id}
                  personalTodos={personalTodos}
                  isAdmin
                />
                <CreateTodoDialog />
              </div>
              {projects.length > 0 && (
                <>
                  <CreateTaskDialog projects={projects} members={allMembers} />
                  <TeamListDialog initialTeams={adminTeams as any} />
                </>
              )}
              </div>
            )}
          </div>
        </header>

        {/* Member Assigned Sprint Tasks Reflector */}
        {currentUserRole === Role.MEMBER && mySprintTasks.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
                <Target className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-black tracking-tight uppercase">My Sprint Goals</h2>
            </div>
            <MemberSprintCardList tasks={mySprintTasks as any} />
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content (Left 2/3) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Jira-style Action Cards (Admin Only) */}
            {currentUserRole === Role.ADMIN && (
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="glass-card rounded-2xl border-none shadow-lg hover:shadow-primary/10 transition-all group overflow-hidden">
                  <div className="h-1 w-full bg-blue-500" />
                  <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
                      <Zap className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Create Sprint</h4>
                      <p className="text-[10px] text-muted-foreground mt-1">Plan team cycle</p>
                    </div>
                    <CreateSprintDialog projects={projects} members={allMembers} />
                  </CardContent>
                </Card>

                <Card className="glass-card rounded-2xl border-none shadow-lg hover:shadow-primary/10 transition-all group overflow-hidden">
                  <div className="h-1 w-full bg-primary" />
                  <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                      <CreateProjectDialog userRole={currentUserRole} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Create Project</h4>
                      <p className="text-[10px] text-muted-foreground mt-1">New workspace</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card rounded-2xl border-none shadow-lg hover:shadow-primary/10 transition-all group overflow-hidden">
                  <div className="h-1 w-full bg-slate-700" />
                  <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                    <div className="p-3 bg-slate-700/10 rounded-xl text-slate-700 group-hover:scale-110 transition-transform">
                      <GitBranch className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Our Codebase</h4>
                      <p className="text-[10px] text-muted-foreground mt-1">Sync repository</p>
                    </div>
                    <RepositoryDialog projects={projects} />
                  </CardContent>
                </Card>

                <Card className="glass-card rounded-2xl border-none shadow-lg hover:shadow-primary/10 transition-all group overflow-hidden">
                  <div className="h-1 w-full bg-rose-500" />
                  <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                    <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500 group-hover:scale-110 transition-transform">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Start Meeting</h4>
                      <p className="text-[10px] text-muted-foreground mt-1">Connect with team</p>
                    </div>
                    <div className="w-full flex flex-col gap-2">
                      <JoinRoomDialog />
                      <CreateRoomDialog />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="glass-card rounded-3xl overflow-hidden relative group hover:scale-[1.02] transition-all">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Projects</span>
                  <Briefcase className="h-4 w-4 text-blue-500/70" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">{projectCount}</div>
                </CardContent>
              </Card>
              <Card className="glass-card rounded-3xl overflow-hidden relative group hover:scale-[1.02] transition-all">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Tasks</span>
                  <CheckSquare className="h-4 w-4 text-indigo-500/70" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">{taskCount}</div>
                </CardContent>
              </Card>
              <Card className="glass-card rounded-3xl overflow-hidden relative group hover:scale-[1.02] transition-all">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Rate</span>
                  <Activity className="h-3 w-3 text-emerald-500/70" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{completionRate}%</div>
                </CardContent>
              </Card>
              <Card className="glass-card rounded-3xl overflow-hidden relative group hover:scale-[1.02] transition-all border-red-500/20">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Backlog</span>
                  <AlertCircle className="h-4 w-4 text-red-500/70" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-red-600 dark:text-red-400">{overdueCount}</div>
                </CardContent>
              </Card>
            </div>

            {/* Task Overview */}
            <Card className="glass-card rounded-[2rem] overflow-hidden border-none shadow-2xl">
              <div className="px-8 py-6 bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-900/50 dark:to-slate-800/50 border-b border-border/50">
                <h3 className="text-lg font-black flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  Task Overview
                </h3>
              </div>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50/30 dark:bg-slate-900/30">
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="px-8 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Task Info</TableHead>
                      <TableHead className="py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Project & Owner</TableHead>
                      <TableHead className="py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Assignee</TableHead>
                      <TableHead className="py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Due Date</TableHead>
                      <TableHead className="py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Phase</TableHead>
                      <TableHead className="px-8 py-4 text-right font-black text-slate-400 uppercase text-[10px] tracking-widest">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-64 text-center">
                          <div className="flex flex-col items-center justify-center gap-4 py-10">
                            <div className="p-4 bg-primary/5 rounded-full border border-dashed border-primary/20">
                              <CheckSquare className="h-12 w-12 text-primary/40" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Your Board is Clear</p>
                              <p className="text-xs text-slate-500 max-w-[200px] mx-auto leading-relaxed font-medium">
                                {currentUserRole === Role.ADMIN 
                                  ? "You haven't created any tasks yet. Start assigning work to your team."
                                  : "Great job! You have no pending tasks assigned to you."}
                              </p>
                            </div>
                            {currentUserRole === Role.ADMIN && projects.length > 0 && (
                              <div className="mt-2">
                                <CreateTaskDialog projects={projects} members={allMembers} />
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      tasks.map((task: any) => {
                        const isAssignedToMe = task.assigneeId === user.id;
                        const statusClass = `status-accent-${task.status.toLowerCase().replace('_', '-')}`;
                        
                        return (
                          <TableRow key={task.id} className={cn("border-border/40 group hover:bg-primary/[0.03] transition-colors", statusClass)}>
                            <TableCell className="px-8 py-5">
                              <div className="flex flex-col gap-1">
                                <span className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{task.title}</span>
                                <span className="text-xs text-muted-foreground line-clamp-1 opacity-70">{task.description || "—"}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-5">
                              <div className="flex flex-col gap-2">
                                <Badge variant="outline" className="w-fit font-black text-[9px] uppercase px-2 py-0.5 border-primary/20 bg-primary/5 text-primary">
                                  {task.project.name}
                                </Badge>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold">
                                  <ShieldAlert className="h-3 w-3 opacity-50" />
                                  <span>{task.project.createdBy?.name || "System"}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-5">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                  <UserIcon className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                  {task.assignee?.name || "Unassigned"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-5">
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                              </span>
                            </TableCell>
                            <TableCell className="py-5">
                              {isAssignedToMe || currentUserRole === Role.ADMIN ? (
                                <TaskPhaseButton taskId={task.id} currentStatus={task.status} />
                              ) : (
                                <Badge variant="outline" className="text-[10px] font-black uppercase border-border/50">{task.status}</Badge>
                              )}
                            </TableCell>
                            <TableCell className="px-8 py-5 text-right">
                              {currentUserRole === Role.ADMIN && (
                                <form action={async () => {
                                  "use server";
                                  await deleteTask(task.id);
                                }}>
                                  <Button variant="ghost" size="icon" type="submit" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </form>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar (Right 1/3) */}
          <div className="space-y-8">
            {currentUserRole === Role.ADMIN && <AdminActivityFeed />}
            
            {/* Admin Sprint Dashboard Reflector (Sidebar) */}
            {currentUserRole === Role.ADMIN && sprints.length > 0 && (
              <Card className="glass-card rounded-2xl border-none shadow-lg overflow-hidden">
                <div className="h-1 w-full bg-blue-500" />
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-black flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    Sprint Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-1">
                  <div className="space-y-2">
                    {sprints.map((sprint, index) => (
                      <div key={sprint.id} className="rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[10px] font-black text-slate-500 uppercase">#{index + 1}</p>
                            <p className="text-xs font-black truncate">{sprint.name}</p>
                            <p className="text-[10px] text-muted-foreground font-bold truncate">{sprint.project.name}</p>
                          </div>
                          <Badge className="bg-blue-500/10 text-blue-500 border-none text-[8px] font-black uppercase px-1.5 h-4 shrink-0">
                            CR {sprint.crId || "N/A"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Active Projects Card */}
            <Card className="glass-card rounded-[2rem] border-none shadow-2xl overflow-hidden">
              <CardHeader className="px-6 py-5 bg-gradient-to-br from-primary/5 to-transparent border-b border-border/50">
                <CardTitle className="text-sm font-bold flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <FolderOpen className="h-4 w-4" />
                  </div>
                  {currentUserRole === Role.ADMIN ? "Global Projects" : "My Projects"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {uniqueProjects.length === 0 ? (
                  <div className="text-center py-12 space-y-5">
                    <div className="flex justify-center">
                      <div className="p-5 bg-slate-50 dark:bg-zinc-800/50 rounded-full border border-dashed border-slate-200 dark:border-zinc-800">
                        <FolderOpen className="h-12 w-12 text-slate-300 dark:text-slate-700" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">No Active Projects</p>
                      <p className="text-[10px] text-slate-400 font-bold max-w-[150px] mx-auto leading-relaxed">
                        Every great work begins with a single workspace.
                      </p>
                    </div>
                    {currentUserRole === Role.ADMIN && (
                      <div className="flex justify-center pt-2">
                        <CreateProjectDialog userRole={currentUserRole} />
                      </div>
                    )}
                  </div>
                ) : (
                  uniqueProjects.map((p) => (
                    <Link href={`/projects/${p.id}`} key={p.id} className="block group">
                      <div className="relative rounded-xl bg-white/40 dark:bg-slate-800/40 border border-border/40 group-hover:border-primary/30 group-hover:bg-primary/[0.02] transition-all duration-200 px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-black text-xs text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold truncate">{p.clientDetails || "No client"}</span>
                          <Badge variant="outline" className="text-[9px] font-black px-1.5 py-0 border-primary/20 text-primary shrink-0">
                            {p.members?.length || 0}
                          </Badge>
                        </div>
                        {currentUserRole === Role.ADMIN && (
                          <div className="mt-2 flex justify-end pt-2 border-t border-border/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <AddMemberDialog projectId={p.id} projectName={p.name} />
                          </div>
                        )}
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
