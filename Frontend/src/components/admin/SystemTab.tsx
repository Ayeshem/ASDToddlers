import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Activity } from "lucide-react";

export function SystemTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Database Connection</span>
            </div>
            <Badge variant="default">Online</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>ML Model Service</span>
            </div>
            <Badge variant="default">Operational</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>File Storage</span>
            </div>
            <Badge variant="default">Available</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span>System Load</span>
            </div>
            <Badge variant="secondary">Normal</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
