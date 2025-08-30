import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { gazeApi, type GazeResult } from '@/services/gazeApi';
import { Loader2, Eye, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ResultsBrowser() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<GazeResult[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const list = await gazeApi.listResults();
        if (!cancelled) setResults(list);
      } catch (e) {
        toast({ title: 'Error', description: 'Failed to load results', variant: 'destructive' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [toast]);

  const filtered = results.filter(r =>
    !query || String(r.child_id).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gaze Results</h1>
            <p className="text-muted-foreground">All completed sessions with prediction and scanpath</p>
          </div>
        </div>

        <div className="flex items-center gap-2 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Filter by child id" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading results...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-dashed">
            <p className="text-muted-foreground mb-2">No results found.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
              <Card key={r.child_id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Child</p>
                      <p className="font-semibold">{r.child_id}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/reports/${r.child_id}`)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Prediction</p>
                      <p className="font-medium">{r.prediction ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Confidence</p>
                      <p className="font-medium">{r.confidence != null ? `${(r.confidence * 100).toFixed(1)}%` : '—'}</p>
                    </div>
                  </div>
                  {r.scanpath_image && (
                    <div className="aspect-video rounded bg-muted overflow-hidden">
                      <img src={r.scanpath_image} alt="scanpath" className="w-full h-full object-cover" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

