import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChampionsHistoryTab } from "@/components/league-history/ChampionsHistoryTab";
import { AwardsHistoryTab } from "@/components/league-history/AwardsHistoryTab";
import { DraftHistoryTab } from "@/components/league-history/DraftHistoryTab";
import { RecordsTab } from "@/components/league-history/RecordsTab";
import { ArchivesTab } from "@/components/league-history/ArchivesTab";
import { MilestonesTab } from "@/components/league-history/MilestonesTab";
import { Trophy, Award, Users, Target, Archive, Star } from "lucide-react";

export default function LeagueHistory() {
  const [activeTab, setActiveTab] = useState("champions");

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary">League History</h1>
        <p className="text-lg text-muted-foreground">
          Explore the complete legacy of champions, records, and memorable moments
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Historical Records & Archives
          </CardTitle>
          <CardDescription>
            Browse through past seasons, championship history, award winners, and all-time records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="champions" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Champions
              </TabsTrigger>
              <TabsTrigger value="awards" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Awards
              </TabsTrigger>
              <TabsTrigger value="draft" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Draft History
              </TabsTrigger>
              <TabsTrigger value="records" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Records
              </TabsTrigger>
              <TabsTrigger value="archives" className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                Archives
              </TabsTrigger>
              <TabsTrigger value="milestones" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Milestones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="champions" className="mt-6">
              <ChampionsHistoryTab />
            </TabsContent>

            <TabsContent value="awards" className="mt-6">
              <AwardsHistoryTab />
            </TabsContent>

            <TabsContent value="draft" className="mt-6">
              <DraftHistoryTab />
            </TabsContent>

            <TabsContent value="records" className="mt-6">
              <RecordsTab />
            </TabsContent>

            <TabsContent value="archives" className="mt-6">
              <ArchivesTab />
            </TabsContent>

            <TabsContent value="milestones" className="mt-6">
              <MilestonesTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}