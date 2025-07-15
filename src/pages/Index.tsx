import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Users, 
  Trophy, 
  Play, 
  Zap,
  ArrowRight,
  Star,
  Clock,
  Database,
  Archive,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hockey-arena-hero.jpg";

const Index = () => {
  const { user, signOut } = useAuth();
  console.log("Index component loaded, user:", user); // Debug log to force refresh
  const features = [
    {
      icon: Shield,
      title: "Admin Control Panel",
      description: "Complete league management with user roles, team creation, and league settings",
      badge: "Phase 1"
    },
    {
      icon: Users,
      title: "Player & Coach Generator",
      description: "Generate realistic fictional players and coaches with detailed ratings and attributes",
      badge: "Active"
    },
    {
      icon: Trophy,
      title: "Team Management",
      description: "Create and manage teams across Pro, Farm, and Junior leagues with GM assignments",
      badge: "Active"
    },
    {
      icon: Play,
      title: "Simulation Engine",
      description: "Advanced probability-based game simulation with detailed play-by-play results",
      badge: "Core"
    },
    {
      icon: Clock,
      title: "Schedule Builder",
      description: "Automated schedule generation with customizable season parameters",
      badge: "Active"
    },
    {
      icon: Database,
      title: "Analytics & Reports",
      description: "Comprehensive league statistics, player performance, and team analytics",
      badge: "Coming"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="h-screen bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background/90" />
          <div className="relative h-full flex items-center justify-center">
            <div className="text-center max-w-4xl px-6">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <h1 className="text-5xl md:text-7xl font-bold">
                    <span className="text-foreground">Puck</span>
                    <span className="text-primary ml-4">Dynasty</span>
                  </h1>
                  <h2 className="text-2xl md:text-3xl text-muted-foreground">Sim</h2>
                </div>
              </div>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Build your hockey dynasty with the most advanced simulation platform. 
                Create and manage professional leagues, develop legendary players, and 
                establish dynasties that span generations of hockey excellence.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <>
                    <Button asChild size="lg" className="btn-hockey text-lg px-8 py-4">
                      <Link to="/admin">
                        <Shield className="w-5 h-5 mr-2" />
                        Access Admin Panel
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4 border-primary/20">
                      <Link to="/league-stats">
                        <Trophy className="w-5 h-5 mr-2" />
                        View League Stats
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4 border-primary/20">
                      <Link to="/league-history">
                        <Archive className="w-5 h-5 mr-2" />
                        League History
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="text-lg px-8 py-4 border-primary/20"
                      onClick={signOut}
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild size="lg" className="btn-hockey text-lg px-8 py-4">
                      <Link to="/auth">
                        <Shield className="w-5 h-5 mr-2" />
                        Sign In / Register
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-primary/20">
                      <Star className="w-5 h-5 mr-2" />
                      View Features
                    </Button>
                  </>
                )}
              </div>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-card/80 backdrop-blur-sm rounded-lg p-6 border border-border/50">
                  <div className="text-3xl font-bold text-primary mb-2">∞</div>
                  <div className="text-sm text-muted-foreground">Unlimited Leagues</div>
                </div>
                <div className="bg-card/80 backdrop-blur-sm rounded-lg p-6 border border-border/50">
                  <div className="text-3xl font-bold text-accent mb-2">30+</div>
                  <div className="text-sm text-muted-foreground">Teams per League</div>
                </div>
                <div className="bg-card/80 backdrop-blur-sm rounded-lg p-6 border border-border/50">
                  <div className="text-3xl font-bold text-team-gold mb-2">1000+</div>
                  <div className="text-sm text-muted-foreground">Generated Players</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Build Your <span className="text-primary">Hockey Dynasty</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From dynasty foundation to championship glory, manage every aspect of your hockey empire 
              with comprehensive management tools and realistic simulation engines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-rink stat-card">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant={feature.badge === "Coming" ? "outline" : "default"}>
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button asChild size="lg" className="btn-hockey text-lg px-8 py-4">
              <Link to={user ? "/admin" : "/auth"}>
                <Shield className="w-5 h-5 mr-2" />
                {user ? "Start Managing Your League" : "Sign In to Get Started"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Phase Information */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6">Currently in <span className="text-primary">Phase 1</span></h3>
          <p className="text-lg text-muted-foreground mb-8">
            We're building this platform in phases. Phase 1 focuses on complete admin control tools. 
            Phase 2 will introduce GM dashboards and player management tools for league participants.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="card-rink">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Shield className="w-5 h-5" />
                  Phase 1 - Admin Tools (Current)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-2 text-sm">
                  <li>✅ League creation and management</li>
                  <li>✅ Team and player generation</li>
                  <li>✅ Schedule building</li>
                  <li>✅ Game simulation engine</li>
                  <li>✅ User role management</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-rink">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-5 h-5" />
                  Phase 2 - GM Dashboard (Next)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-2 text-sm text-muted-foreground">
                  <li>✅ GM team management interface</li>
                  <li>✅ Real-time game updates</li>
                  <li>✅ Online GM presence tracking</li>
                  <li>🔄 Player trading system</li>
                  <li>🔄 Draft management</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
