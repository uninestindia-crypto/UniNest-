
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const trendingHashtags = [
  { tag: "#examseason", posts: "1.2k" },
  { tag: "#campuslife", posts: "890" },
  { tag: "#projectwork", posts: "754" },
  { tag: "#internships2024", posts: "680" },
  { tag: "#studyhacks", posts: "512" },
];

const suggestedFriends = [
  { name: "Ananya Sharma", handle: "@ananya", avatar: "https://picsum.photos/seed/friend1/40" },
  { name: "Rohan Verma", handle: "@rohanv", avatar: "https://picsum.photos/seed/friend2/40" },
  { name: "Priya Singh", handle: "@priya_s", avatar: "https://picsum.photos/seed/friend3/40" },
];

export default function TrendingSidebar() {
  return (
    <div className="sticky top-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Trending Hashtags</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {trendingHashtags.map((item) => (
              <li key={item.tag} className="flex justify-between items-center group cursor-pointer">
                <div>
                  <p className="font-semibold group-hover:text-primary">{item.tag}</p>
                  <p className="text-sm text-muted-foreground">{item.posts} posts</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-muted group-hover:bg-accent/20 flex items-center justify-center text-accent">
                    #
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suggested Friends</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {suggestedFriends.map((friend) => (
              <li key={friend.handle} className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={friend.avatar} alt={friend.name} data-ai-hint="person face" />
                  <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="font-semibold">{friend.name}</p>
                    <p className="text-sm text-muted-foreground">{friend.handle}</p>
                </div>
                <Button size="sm" variant="outline">Follow</Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
