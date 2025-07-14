import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsTable } from "./StatsTable";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export function TransactionsTab() {
  const [view, setView] = useState("recent");

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transaction_log")
        .select(`
          *,
          players!inner(first_name, last_name),
          from_teams:teams!from_team_id(name, city, abbreviation),
          to_teams:teams!to_team_id(name, city, abbreviation),
          leagues(name)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  const { data: waiverWire, isLoading: waiversLoading } = useQuery({
    queryKey: ["waiver-wire"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waiver_wire")
        .select(`
          *,
          players!inner(first_name, last_name, player_position),
          placed_by_teams:teams!placed_by_team_id(name, city, abbreviation),
          leagues(name)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: tradeBlock, isLoading: tradeBlockLoading } = useQuery({
    queryKey: ["trade-block"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trade_block")
        .select(`
          *,
          players!inner(first_name, last_name, player_position),
          teams!inner(name, city, abbreviation),
          leagues(name)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getTransactionBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "trade":
        return <Badge variant="default">Trade</Badge>;
      case "waiver_claim":
        return <Badge variant="secondary">Waiver</Badge>;
      case "signing":
        return <Badge variant="outline">Signing</Badge>;
      case "release":
        return <Badge variant="destructive">Release</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const transactionColumns = [
    { key: "date", label: "Date", sortable: true },
    { key: "type", label: "Type", sortable: true },
    { key: "player", label: "Player", sortable: true },
    { key: "from_team", label: "From", sortable: true },
    { key: "to_team", label: "To", sortable: true },
    { key: "league", label: "League", sortable: true },
  ];

  const waiversColumns = [
    { key: "player", label: "Player", sortable: true },
    { key: "position", label: "Pos", sortable: true },
    { key: "placed_by", label: "Placed By", sortable: true },
    { key: "priority", label: "Priority", sortable: true },
    { key: "deadline", label: "Deadline", sortable: true },
    { key: "reason", label: "Reason", sortable: true },
  ];

  const tradeBlockColumns = [
    { key: "player", label: "Player", sortable: true },
    { key: "position", label: "Pos", sortable: true },
    { key: "team", label: "Team", sortable: true },
    { key: "priority", label: "Priority", sortable: true },
    { key: "asking_price", label: "Asking Price", sortable: true },
    { key: "available_until", label: "Available Until", sortable: true },
  ];

  const formatTransactionData = (data: any[]) => {
    return data.map((transaction) => ({
      date: format(new Date(transaction.created_at), "MMM dd, yyyy"),
      type: getTransactionBadge(transaction.transaction_type),
      player: `${transaction.players.first_name} ${transaction.players.last_name}`,
      from_team: transaction.from_teams?.abbreviation || "-",
      to_team: transaction.to_teams?.abbreviation || "-",
      league: transaction.leagues.name,
    }));
  };

  const formatWaiversData = (data: any[]) => {
    return data.map((waiver) => ({
      player: `${waiver.players.first_name} ${waiver.players.last_name}`,
      position: waiver.players.player_position,
      placed_by: waiver.placed_by_teams?.abbreviation || "League",
      priority: waiver.waiver_priority,
      deadline: format(new Date(waiver.claim_deadline), "MMM dd, h:mm a"),
      reason: waiver.reason || "-",
    }));
  };

  const formatTradeBlockData = (data: any[]) => {
    return data.map((trade) => ({
      player: `${trade.players.first_name} ${trade.players.last_name}`,
      position: trade.players.player_position,
      team: trade.teams.abbreviation,
      priority: trade.priority,
      asking_price: trade.asking_price || "Open to offers",
      available_until: trade.available_until 
        ? format(new Date(trade.available_until), "MMM dd, yyyy")
        : "Open-ended",
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transactions & Market</CardTitle>
          <CardDescription>
            Recent transactions, waiver wire, and trade block activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={view} onValueChange={setView}>
            <TabsList>
              <TabsTrigger value="recent">Recent Transactions</TabsTrigger>
              <TabsTrigger value="waivers">Waiver Wire</TabsTrigger>
              <TabsTrigger value="trades">Trade Block</TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="mt-6">
              <StatsTable
                data={transactions ? formatTransactionData(transactions) : []}
                columns={transactionColumns}
                isLoading={transactionsLoading}
                searchPlaceholder="Search transactions..."
              />
            </TabsContent>

            <TabsContent value="waivers" className="mt-6">
              <StatsTable
                data={waiverWire ? formatWaiversData(waiverWire) : []}
                columns={waiversColumns}
                isLoading={waiversLoading}
                searchPlaceholder="Search waivers..."
              />
            </TabsContent>

            <TabsContent value="trades" className="mt-6">
              <StatsTable
                data={tradeBlock ? formatTradeBlockData(tradeBlock) : []}
                columns={tradeBlockColumns}
                isLoading={tradeBlockLoading}
                searchPlaceholder="Search trade block..."
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}