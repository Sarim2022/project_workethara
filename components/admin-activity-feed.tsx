import { getActivityFeed } from "@/app/actions/tasks";
import type { ActivityFeedItem } from "@/app/actions/tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Activity, ArrowRight, CheckSquare, FolderOpen, User as UserIcon, Users, Zap } from "lucide-react";

function displayName(user: ActivityFeedItem["user"]) {
  return user.name || user.email.split("@")[0];
}

export async function AdminActivityFeed() {
  const activities = await getActivityFeed();

  return (
    <Card className="rounded-2xl border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900/50">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Activity className="h-4 w-4 text-primary" />
        <CardTitle className="text-sm font-bold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No recent activity.</p>
        ) : (
          <div className="space-y-4">
            {activities.map((log) => (
              <div key={log.id} className="flex gap-3 text-xs border-b border-slate-100 dark:border-zinc-800 pb-3 last:border-0 last:pb-0">
                <div className="mt-0.5">
                  <div className="p-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full">
                    {log.type === "sprint_created" && <Zap className="h-3 w-3 text-blue-500" />}
                    {log.type === "project_created" && <FolderOpen className="h-3 w-3 text-emerald-500" />}
                    {log.type === "task_created" && <CheckSquare className="h-3 w-3 text-primary" />}
                    {log.type === "team_created" && <Users className="h-3 w-3 text-violet-500" />}
                    {log.type === "status" && <UserIcon className="h-3 w-3 text-slate-500" />}
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  {log.type === "sprint_created" ? (
                    <p className="text-slate-900 dark:text-slate-100 leading-normal">
                      <span className="font-bold">{displayName(log.user)}</span>
                      {" Sprint created: "}
                      <span className="font-semibold text-primary">
                        {log.sprint.title} + {log.sprint.projectName}
                      </span>
                    </p>
                  ) : log.type === "project_created" ? (
                    <p className="text-slate-900 dark:text-slate-100 leading-normal">
                      <span className="font-bold">{displayName(log.user)}</span>
                      {" Project created: "}
                      <span className="font-semibold text-primary">{log.project.name}</span>
                    </p>
                  ) : log.type === "task_created" ? (
                    <p className="text-slate-900 dark:text-slate-100 leading-normal">
                      <span className="font-bold">{displayName(log.user)}</span>
                      {" Task created: "}
                      <span className="font-semibold text-primary">{log.task.title}</span>
                      {" in "}
                      <span className="font-semibold">{log.task.projectName}</span>
                      {log.task.assigneeEmail && (
                        <>
                          {" for "}
                          <span className="font-semibold">{log.task.assigneeName || log.task.assigneeEmail.split("@")[0]}</span>
                        </>
                      )}
                    </p>
                  ) : log.type === "team_created" ? (
                    <p className="text-slate-900 dark:text-slate-100 leading-normal">
                      <span className="font-bold">{displayName(log.user)}</span>
                      {" Team created: "}
                      <span className="font-semibold text-primary">{log.team.name}</span>
                      {" "}
                      <span className="text-slate-500">({log.team.memberCount} members)</span>
                    </p>
                  ) : (
                    <>
                      <p className="text-slate-900 dark:text-slate-100 leading-normal">
                        <span className="font-bold">{displayName(log.user)}</span>
                        {" changed "}
                        <span className="font-semibold text-primary">{log.task.title}</span>
                      </p>
                      <div className="flex items-center gap-2 text-[10px]">
                        <Badge variant="outline" className="h-4 px-1 text-[9px] font-normal uppercase">
                          {log.oldStatus || "NEW"}
                        </Badge>
                        <ArrowRight className="h-2 w-2 text-slate-400" />
                        <Badge variant="secondary" className="h-4 px-1 text-[9px] font-bold uppercase bg-primary/10 text-primary border-none">
                          {log.newStatus}
                        </Badge>
                      </div>
                    </>
                  )}
                  <p className="text-[10px] text-slate-400">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
