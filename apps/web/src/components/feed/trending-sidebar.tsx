import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TrendingSidebar() {
  return (
    <div className="sticky top-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Trending Hashtags</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No trending topics yet. Check back later!
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suggested Friends</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No suggestions available right now.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
