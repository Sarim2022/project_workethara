import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Role, TaskStatus } from "@prisma/client";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  ArrowLeft, 
  Trash2, 
  Edit3, 
  Users, 
  Calendar,
  CheckCircle2,
  Clock,
  PlayCircle,
  ClipboardList,
  FileText
} from "lucide-react";
import Link from "next/link";
import { deleteProject } from "@/app/actions/tasks";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      tasks: {
        include: {
          assignee: true
        },
        orderBy: { createdAt: 'desc' }
      },
      members: true,
      createdBy: true
    }
  });

  if (!project) notFound();

  // Security check: Only members or admin can view
  const isMember = project.members.some(m => m.id === user.id);
  if (user.role !== Role.ADMIN && !isMember) redirect("/dashboard");

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.DONE:
        return <Badge className="bg-emerald-600 text-white border-transparent">DONE</Badge>;
      case TaskStatus.TESTING:
        return <Badge className="bg-amber-500 text-white border-transparent">TESTING</Badge>;
      case TaskStatus.IN_PROGRESS:
        return <Badge className="bg-blue-600 text-white border-transparent">IN PROGRESS</Badge>;
      default:
        return <Badge className="bg-slate-200 text-slate-700 border-transparent">TO DO</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Button asChild variant="ghost" size="sm" className="gap-2 text-slate-500 hover:text-primary">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>
          
          {user.role === Role.ADMIN && (
            <div className="flex items-center gap-3">
              <form action={async () => {
                "use server";
                await deleteProject(project.id);
              }}>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-xl gap-2">
                  <Trash2 className="h-4 w-4" /> Delete Project
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Project Header Card */}
        <Card className="glass-card rounded-[2rem] border-none shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
          <CardHeader className="p-8 pb-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-[10px] font-black uppercase border-primary/20 bg-primary/5 text-primary tracking-widest">
                    PROJECT ID: {project.id.substring(0, 8)}
                  </Badge>
                </div>
                <CardTitle className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  {project.name}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-primary" />
                    {project.members.length} Team Members
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary" />
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {project.clientDetails && (
                <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 max-w-xs w-full">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Client Details</h4>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {project.clientDetails}
                  </p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="mt-8">
              <h3 className="text-lg font-black flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                Project Tasks ({project.tasks.length})
              </h3>
              
              <div className="rounded-2xl border border-border/50 overflow-hidden bg-white/40 dark:bg-slate-900/40">
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                    <TableRow>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest">Task Title</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-center">Status</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest">Assignee</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-right">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.tasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center text-slate-400 italic">
                          No tasks have been created for this project yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      project.tasks.map((task) => (
                        <TableRow key={task.id} className="group hover:bg-primary/[0.02]">
                          <TableCell className="font-bold text-sm text-slate-900 dark:text-white">
                            {task.title}
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(task.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                {(task.assignee?.name || task.assignee?.email || "U").substring(0, 1).toUpperCase()}
                              </div>
                              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                {task.assignee?.name || "Unassigned"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-[10px] font-bold text-slate-400">
                            {new Date(task.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
