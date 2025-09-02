import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminStore } from "@/store/adminStore";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

export function SystemLogsTab() {
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const { getSystemLogs, clearSystemLogs } = useAdminStore();
  const { toast } = useToast();

  useEffect(() => {
    loadSystemLogs();
  }, []);

  const loadSystemLogs = async () => {
    try {
      const logs = await getSystemLogs();
      setSystemLogs(logs);
    } catch (error) {
      console.error('Failed to load system logs:', error);
    }
  };

  const handleClearLogs = async () => {
    try {
      await clearSystemLogs();
      setSystemLogs([]);
      toast({
        title: "Logs cleared",
        description: "System logs have been cleared successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to clear logs",
        description: "There was an error clearing the system logs.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>System Logs</CardTitle>
            <Button variant="outline" size="sm" onClick={handleClearLogs}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{log.message}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
                <Badge 
                  variant={
                    log.level === 'info' ? 'default' :
                    log.level === 'warning' ? 'secondary' : 'destructive'
                  }
                >
                  {log.level}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
