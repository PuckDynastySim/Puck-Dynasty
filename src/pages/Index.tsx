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
          className="min-h-screen bg-cover bg-center bg-no-repeat hero-gradient"
          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${heroImage})` }}
        >
          <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-5xl animate-fade-in">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary rounded-2xl flex items-center justify-center interactive-glow">
                  <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground" />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="heading-1 mb-2">
                    <span className="text-foreground">Puck</span>
                    <span className="text-primary ml-2 sm:ml-4">Dynasty</span>
                  </h1>
                  <h2 className="heading-4 text-muted-foreground">Simulation Central</h2>
                </div>
              </div>
              
              <p className="body-large text-muted-foreground mb-10 max-w-4xl mx-auto">
                Build your hockey dynasty with the most advanced simulation platform. 
                Create and manage professional leagues, develop legendary players, and 
                establish dynasties that span generations of hockey excellence.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {user ? (
                  <>
                    <Button asChild className="btn-modern text-lg px-8 py-4 interactive-scale">
                      <Link to="/admin">
                        <Shield className="w-5 h-5 mr-2" />
                        Access Admin Panel
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </Button>
                    <Button asChild className="btn-glass text-lg px-8 py-4 interactive-scale">
                      <Link to="/league-stats">
                        <Trophy className="w-5 h-5 mr-2" />
                        League Stats
                      </Link>
                    </Button>
                    <Button asChild className="btn-glass text-lg px-8 py-4 interactive-scale">
                      <Link to="/league-history">
                        <Archive className="w-5 h-5 mr-2" />
                        History
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild className="btn-modern text-lg px-8 py-4 interactive-scale">
                      <Link to="/auth">
                        <Shield className="w-5 h-5 mr-2" />
                        Sign In / Register
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </Button>
                    <Button className="btn-glass text-lg px-8 py-4 interactive-scale">
                      <Star className="w-5 h-5 mr-2" />
                      View Features
                    </Button>
                  </>
                )}
              </div>

              <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 text-center">
                <div className="glass-card p-6 sm:p-8 interactive-lift">
                  <div className="text-4xl sm:text-5xl font-bold text-primary mb-3">∞</div>
                  <div className="text-sm sm:text-base text-muted-foreground font-medium">Unlimited Leagues</div>
                </div>
                <div className="glass-card p-6 sm:p-8 interactive-lift">
                  <div className="text-4xl sm:text-5xl font-bold text-accent mb-3">30+</div>
                  <div className="text-sm sm:text-base text-muted-foreground font-medium">Teams per League</div>
                </div>
                <div className="glass-card p-6 sm:p-8 interactive-lift">
                  <div className="text-4xl sm:text-5xl font-bold text-team-gold mb-3">1000+</div>
                  <div className="text-sm sm:text-base text-muted-foreground font-medium">Generated Players</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-20 animate-slide-up">
            <h2 className="heading-2 mb-6">
              Build Your <span className="text-primary">Hockey Dynasty</span>
            </h2>
            <p className="body-large text-muted-foreground max-w-4xl mx-auto">
              From dynasty foundation to championship glory, manage every aspect of your hockey empire 
              with comprehensive management tools and realistic simulation engines.
            </p>
          </div>

          <div className="grid-feature">
            {features.map((feature, index) => (
              <Card key={index} className="modern-card interactive-lift animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader className="p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/20 rounded-2xl flex items-center justify-center interactive-glow">
                      <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                    </div>
                    <Badge 
                      variant={feature.badge === "Coming" ? "outline" : "default"}
                      className="px-3 py-1 text-sm font-semibold"
                    >
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="heading-4 mb-3">{feature.title}</CardTitle>
                  <CardDescription className="body-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="text-center mt-16 sm:mt-20">
            <Button asChild className="btn-modern text-lg px-10 py-4 interactive-scale">
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
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="heading-3 mb-8">Currently in <span className="text-primary">Phase 1</span></h3>
          <p className="body-large text-muted-foreground mb-12 max-w-3xl mx-auto">
            We're building this platform in phases. Phase 1 focuses on complete admin control tools. 
            Phase 2 will introduce GM dashboards and player management tools for league participants.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="modern-card interactive-lift">
              <CardHeader className="p-6 sm:p-8">
                <CardTitle className="flex items-center gap-3 text-primary heading-4 mb-4">
                  <Shield className="w-6 h-6" />
                  Phase 1 - Admin Tools (Current)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 pt-0">
                <ul className="text-left space-y-3 body-base">
                  <li className="flex items-center gap-3">
                    <span className="text-success-green text-xl">✅</span>
                    League creation and management
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-success-green text-xl">✅</span>
                    Team and player generation
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-success-green text-xl">✅</span>
                    Schedule building
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-success-green text-xl">✅</span>
                    Game simulation engine
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-success-green text-xl">✅</span>
                    User role management
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="modern-card interactive-lift">
              <CardHeader className="p-6 sm:p-8">
                <CardTitle className="flex items-center gap-3 text-muted-foreground heading-4 mb-4">
                  <Users className="w-6 h-6" />
                  Phase 2 - GM Dashboard (Next)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 pt-0">
                <ul className="text-left space-y-3 body-base text-muted-foreground">
                  <li className="flex items-center gap-3">
                    <span className="text-success-green text-xl">✅</span>
                    GM team management interface
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-success-green text-xl">✅</span>
                    Real-time game updates
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-success-green text-xl">✅</span>
                    Online GM presence tracking
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-warning-yellow text-xl">🔄</span>
                    Player trading system
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-warning-yellow text-xl">🔄</span>
                    Draft management
                  </li>
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
