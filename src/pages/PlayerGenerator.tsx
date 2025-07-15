import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Zap, Trophy, Users, Loader2, Shield, AlertCircle } from "lucide-react";

const PlayerGenerator = () => {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playerCount, setPlayerCount] = useState(30);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [leagues, setLeagues] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedLeagueData, setSelectedLeagueData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadLeagues();
  }, []);

  const loadLeagues = async () => {
    const { data: leaguesData } = await supabase
      .from('leagues')
      .select('*')
      .order('name');
    setLeagues(leaguesData || []);
  };

  const handleLeagueChange = async (leagueId: string) => {
    setSelectedLeague(leagueId);
    setSelectedTeam("");
    
    const league = leagues.find(l => l.id === leagueId);
    setSelectedLeagueData(league);
    
    if (leagueId) {
      const { data: teamsData } = await supabase
        .from('teams')
        .select('*')
        .eq('league_id', leagueId)
        .order('name');
      setTeams(teamsData || []);
    } else {
      setTeams([]);
    }
  };

  const getAgeRange = (leagueType: string) => {
    switch (leagueType) {
      case 'pro':
        return { min: 18, max: 40 };
      case 'farm':
        return { min: 16, max: 35 };
      case 'junior':
        return { min: 16, max: 21 };
      default:
        return { min: 18, max: 40 };
    }
  };

  const positions = [
    { value: "C", label: "Center", min: 4, max: 6 },
    { value: "LW", label: "Left Wing", min: 4, max: 6 },
    { value: "RW", label: "Right Wing", min: 4, max: 6 },
    { value: "D", label: "Defense", min: 6, max: 8 },
    { value: "G", label: "Goalie", min: 2, max: 3 }
  ];

  // Track generated names to reduce duplicates in same batch
  const generatedNamesThisBatch = new Set();

  const generateRandomPlayer = (position: string) => {
    const namesByNationality = {
      "Canada": {
        firstNames: ["Aiden", "Blake", "Carson", "Declan", "Ethan", "Finn", "Gavin", "Hunter", "Ian", "Jaxon", "Kaden", "Logan", "Mason", "Noah", "Owen", "Parker", "Quinn", "Riley", "Seth", "Tanner", "Wade", "Xavier", "Zane", "Brett", "Cole", "Drake", "Grant", "Hayes", "Jace", "Kyle", "Lane", "Nash", "Reid", "Shaw", "Troy", "Wyatt", "Axel", "Beau", "Chase", "Dane", "Ford", "Grey", "Jude", "Knox", "Liam", "Max", "Nate", "Phoenix", "Reed", "Stone", "Tate", "Vale", "West", "Zander", "Bryce", "Cruz", "Dean", "Felix", "Graham", "Heath", "Jack", "Kane", "Luke", "Marc", "Neil", "Pierce", "Rex", "Scott", "Theo", "Vale", "Will", "York", "Zach", "Brent", "Cade", "Drew", "Ellis", "Gage", "Hugo", "Ivan", "Jake", "Kai", "Leo", "Milo", "Noel", "Otto", "Paul", "Rhys", "Sage", "Titus", "Udo", "Vance", "Wade", "Xander", "Yale", "Zeke"],
        lastNames: ["Abbott", "Barnes", "Clarke", "Davies", "Evans", "Fraser", "Gibson", "Hayes", "Irving", "Jenkins", "Kelly", "Lynch", "Murray", "Nash", "Oliver", "Parker", "Quinn", "Ross", "Shaw", "Taylor", "Underwood", "Vaughn", "Walsh", "Young", "Bishop", "Carter", "Duncan", "Fisher", "Grant", "Harper", "Ingram", "Jackson", "Kent", "Lawrence", "Mitchell", "Newman", "Porter", "Ramsey", "Stone", "Turner", "Vincent", "Watson", "York", "Blackwood", "Cameron", "Douglas", "Edwards", "Fleming", "Gardner", "Henderson", "Irwin", "Johnston", "Knox", "Lambert", "McKenzie", "Noble", "Osborne", "Preston", "Reid", "Simpson", "Thomson", "Vaughan", "Wallace", "Xavier", "Brennan", "Coleman", "Dalton", "Elliott", "Ferguson", "Graham", "Houston", "Inglis", "Jordan", "King", "Lindsay", "Morrison", "Nichol", "O'Brien", "Pearson", "Roberts", "Stewart", "Thompson", "Urquhart", "Vance", "Wright", "Alexander", "Bradford", "Chapman", "Donovan", "Ellis", "Fletcher", "Gallagher", "Harrison", "Irvine"]
      },
      "USA": {
        firstNames: ["Austin", "Blake", "Carter", "Dylan", "Evan", "Felix", "Griffin", "Hudson", "Isaac", "Jace", "Kody", "Lucas", "Mason", "Nathan", "Oliver", "Preston", "Quinn", "River", "Sawyer", "Tucker", "Victor", "Wesley", "Zander", "Archer", "Brody", "Cooper", "Derek", "Emmett", "Ford", "Gage", "Harrison", "Ivan", "Jett", "Kole", "Landon", "Miles", "Nolan", "Oscar", "Parker", "Reid", "Spencer", "Trey", "Urban", "Vincent", "Wade", "Xavier", "Zeke", "Asher", "Bennett", "Camden", "Dalton", "Ellis", "Finley", "Grayson", "Hayden", "Ivan", "Jaxon", "Knox", "Levi", "Marcus", "Nicholas", "Owen", "Porter", "Ryker", "Silas", "Tristan", "Vaughn", "Walker", "Zane", "Braxton", "Chance", "Dexter", "Easton", "Fisher", "Grant", "Holden", "Ivan", "Jude", "Kane", "Lincoln", "Max", "Nash", "Orion", "Phoenix", "Ryder", "Sterling", "Titus", "Vale", "Weston", "Zander", "Blake", "Colton", "Drake", "Everett", "Flynn", "Greyson", "Hugo", "Ivan", "Jax", "Kyler", "Leo", "Maverick", "Neo", "Otto"],
        lastNames: ["Adams", "Brooks", "Cooper", "Davidson", "Ellis", "Foster", "Garcia", "Hughes", "Ingram", "Jensen", "King", "Lopez", "Martinez", "Nelson", "Owens", "Phillips", "Roberts", "Simpson", "Turner", "Valdez", "Walker", "Xavier", "Young", "Zimmerman", "Alexander", "Barnes", "Carter", "Diaz", "Edwards", "Fisher", "Griffin", "Harrison", "Irving", "Johnson", "Kelly", "Lewis", "Morgan", "Newman", "O'Connor", "Parker", "Quinn", "Reynolds", "Stewart", "Thompson", "Underwood", "Vaughn", "Wilson", "Bishop", "Collins", "Douglas", "Evans", "Fletcher", "Graham", "Henderson", "Jackson", "Knight", "Lawrence", "Mitchell", "Norton", "O'Brien", "Peterson", "Russell", "Sullivan", "Torres", "Upton", "Vincent", "Wells", "Bennett", "Campbell", "Duncan", "Elliott", "Franklin", "Gibson", "Holmes", "Irwin", "Jordan", "Knox", "Lynch", "Mason", "Nash", "Oliver", "Porter", "Reed", "Stone", "Taylor", "Wagner", "Andrews", "Butler", "Chapman", "Davis", "Ferguson", "Greene", "Harper", "Ingalls", "James", "Kelley", "Manning", "Morrison", "Patterson", "Rogers", "Spencer", "Woods"]
      },
      "Sweden": {
        firstNames: ["Axel", "Björn", "Carl", "David", "Edvin", "Felix", "Gustav", "Hugo", "Isak", "Jakob", "Karl", "Linus", "Mattias", "Noah", "Oliver", "Philip", "Rasmus", "Sebastian", "Theo", "Viktor", "Wilhelm", "Adrian", "Albin", "Anton", "Benjamin", "Christopher", "Daniel", "Emil", "Fredrik", "Gabriel", "Hampus", "Igor", "Joel", "Kevin", "Ludvig", "Marcus", "Nils", "Oskar", "Pontus", "Robin", "Simon", "Tobias", "Vincent", "Walter", "Zakarias", "Alfred", "Arvid", "Casper", "Dag", "Elis", "Frank", "Gunnar", "Hannes", "Ivar", "Jan", "Klas", "Leif", "Malte", "Noel", "Otto", "Per", "Rolf", "Sten", "Tage", "Ulf", "Vilhelm", "Werner", "Adam", "Bengt", "Claes", "Dennis", "Erik", "Folke", "Göran", "Hans", "Ingemar", "Jonas", "Kjell", "Lars", "Magnus", "Nils", "Olle", "Patrik", "Rune", "Stig", "Tore", "Urban", "Viggo", "Åke", "Bertil", "Christer", "Einar", "Frans", "Georg", "Håkan", "Inge", "John", "Kent", "Lennart", "Mats"],
        lastNames: ["Almqvist", "Bergström", "Carlsson", "Dahlberg", "Engström", "Forsberg", "Gunnarsson", "Hedström", "Isaksson", "Johansson", "Karlberg", "Lindqvist", "Martinsson", "Nordström", "Ödmann", "Petersson", "Qvist", "Rosén", "Sandberg", "Torstensson", "Ullberg", "Vikström", "Westberg", "Åberg", "Blomqvist", "Cederlund", "Danielsson", "Erickson", "Fredriksson", "Grönberg", "Hellström", "Ivarsson", "Jönsson", "Kreuger", "Ljungberg", "Månsson", "Nordahl", "Öhman", "Palmberg", "Rehnberg", "Ström", "Thalberg", "Uddén", "Vendel", "Westerberg", "Yngström", "Zetterberg", "Andreasson", "Bäckström", "Cronberg", "Dahl", "Ekberg", "Falk", "Granberg", "Höglund", "Ingemarsson", "Jakobsson", "Kindberg", "Lindroth", "Möller", "Nyberg", "Öberg", "Palmquist", "Renberg", "Sjöberg", "Thuresson", "Ulfsson", "Vallberg", "Wickberg", "Åkesson", "Bryntesson", "Crona", "Edlund", "Fors", "Grahn", "Holmberg", "Isberg", "Jansson", "Käll", "Lundberg", "Melander", "Nyström", "Öman", "Parling", "Rönnberg", "Svensson", "Thornberg", "Ulander", "Viklund", "Wennerberg"]
      },
      "Finland": {
        firstNames: ["Aatu", "Benjamin", "Eemil", "Elias", "Hugo", "Jimi", "Kalle", "Leevi", "Matias", "Noel", "Oliver", "Paavo", "Roni", "Samuel", "Topias", "Valtteri", "Waltteri", "Aarne", "Arttu", "Eetu", "Emil", "Henri", "Joose", "Kasper", "Luka", "Mikael", "Niilo", "Onni", "Patrik", "Roope", "Saku", "Tuomas", "Veeti", "Wille", "Aatos", "Akseli", "Eino", "Erno", "Heikki", "Jere", "Kimi", "Lauri", "Mikko", "Niklas", "Oskari", "Perttu", "Reino", "Santeri", "Tatu", "Väinö", "Aleksi", "Ari", "Einari", "Esa", "Hannu", "Jani", "Klaus", "Leo", "Matti", "Niko", "Otso", "Pasi", "Riku", "Simo", "Tapio", "Väino", "Ahti", "Arvi", "Eero", "Erkki", "Harri", "Joonas", "Kimmo", "Lasse", "Marko", "Niiles", "Oiva", "Pentti", "Raimo", "Seppo", "Tapani", "Urho", "Ville", "Yrjö", "Aimo", "Antti", "Eemeli", "Ensio", "Heino", "Jukka", "Kari", "Mauri", "Miro", "Olavi", "Pertti", "Rauno", "Sakari", "Tauno", "Uuno", "Vilho"],
        lastNames: ["Aalto", "Blomberg", "Collin", "Ek", "Forsman", "Grönberg", "Häkkinen", "Järvinen", "Koskinen", "Laakso", "Mattila", "Nurmi", "Oksanen", "Peltonen", "Rantanen", "Salo", "Tuominen", "Ulmanen", "Virtanen", "Wikström", "Aaltonen", "Bergman", "Danielsson", "Eskola", "Friberg", "Gustafsson", "Hakala", "Johansson", "Korhonen", "Lahti", "Mäkelä", "Nieminen", "Ojala", "Pekkala", "Rautio", "Savolainen", "Tikkanen", "Uusitalo", "Väisänen", "Wuori", "Aarnio", "Björk", "Dahlberg", "Erkkilä", "Fält", "Granlund", "Halonen", "Kallio", "Kinnunen", "Lehtinen", "Mäkinen", "Niemi", "Partanen", "Pitkänen", "Remes", "Seppänen", "Toivonen", "Uotila", "Väyrynen", "Ylitalo", "Ahola", "Backman", "Eerola", "Fagerström", "Hakkarainen", "Hyvönen", "Kauppinen", "Kuusisto", "Leppänen", "Manninen", "Nevalainen", "Pakarinen", "Pihlaja", "Rantala", "Sillanpää", "Turunen", "Valtonen", "Wikman", "Yliaho", "Ahlberg", "Cajander", "Fedotoff", "Heikkilä", "Isotalo", "Kantola", "Lappalainen", "Metsälä", "Ojanperä", "Pesonen", "Ronkainen", "Siitonen", "Turpeinen", "Vehmas", "Westerholm"]
      },
      "Russia": {
        firstNames: ["Aleksandr", "Boris", "Denis", "Egor", "Filip", "Grigoriy", "Igor", "Konstantin", "Leonid", "Mikhail", "Nikolay", "Oleg", "Pavel", "Roman", "Sergey", "Timur", "Vladislav", "Yegor", "Zakhar", "Andrey", "Dmitriy", "Fyodor", "Gleb", "Ivan", "Kirill", "Lev", "Matvey", "Nikita", "Oskar", "Petr", "Ruslan", "Semen", "Timofey", "Vadim", "Yuriy", "Alexey", "Bogdan", "Daniil", "Evgeniy", "Georgiy", "Ilya", "Maxim", "Mikhail", "Nestor", "Orest", "Platon", "Rostislav", "Stepan", "Taras", "Viktor", "Yaroslav", "Anton", "Vadim", "Viktor", "Dmitri", "Evgeni", "Grigori", "Igor", "Konstantin", "Leonid", "Mikhail", "Nikolai", "Oleg", "Pavel", "Roman", "Sergei", "Timur", "Vladislav", "Yakov", "Zinovi", "Aleksei", "Boris", "Denis", "Egor", "Fedor", "Gennadiy", "Ivan", "Kirill", "Lev", "Matvei", "Nikita", "Oskar", "Petr", "Ruslan", "Semen", "Timofei", "Vadim", "Yuri", "Anatoli", "Bogdan", "Daniil", "Evgeni", "Grigori", "Ilia", "Maksim", "Mikhail", "Nestor", "Orest", "Platon"],
        lastNames: ["Abramov", "Bogdanov", "Volkov", "Gavrilov", "Dmitriev", "Yegorov", "Zhukov", "Ivanov", "Kozlov", "Lebedev", "Morozov", "Nikitin", "Orlov", "Petrov", "Romanov", "Smirnov", "Titov", "Fedorov", "Khomenko", "Tsvetkov", "Shevchenko", "Yashin", "Alekseev", "Baranov", "Vinogradov", "Gusev", "Denisov", "Yefremov", "Zakharov", "Ilyin", "Kalinin", "Lavrov", "Mikhaylov", "Nazarov", "Osipov", "Pavlov", "Ryabov", "Sokolov", "Trofimov", "Fomin", "Khokhlov", "Chernyshev", "Sharov", "Yablokov", "Antonov", "Belov", "Voronov", "Gerasimov", "Drozdov", "Yermakov", "Zhilin", "Ignatiev", "Karasev", "Loginov", "Makarov", "Novikov", "Orekhov", "Polyakov", "Rodionov", "Stepanov", "Timoshenko", "Frolov", "Kharitonov", "Chernov", "Shilov", "Yakovlev", "Andreev", "Bobrov", "Vladimirov", "Grigoriev", "Davydov", "Yefimov", "Zimin", "Isakov", "Kiselev", "Lukashev", "Matveev", "Nekrasov", "Ogarev", "Platonov", "Rybakov", "Sidorov", "Tokarev", "Filippov", "Khudyakov", "Cherkasov", "Shulgin", "Yakunin", "Artemiev", "Bulgakov", "Vorobyev", "Glazunov"]
      },
      "Czech Republic": {
        firstNames: ["Adam", "Boris", "Cyril", "Daniel", "Emil", "Filip", "Gustav", "Hynek", "Ivan", "Jakub", "Karel", "Lukas", "Marek", "Nikola", "Ondrej", "Pavel", "Robert", "Stepan", "Tomas", "Viktor", "Zbynek", "Ales", "Bretislav", "Cestmir", "Dalibor", "Eduard", "Frantisek", "Gregor", "Hubert", "Igor", "Jiri", "Kamil", "Libor", "Martin", "Norbert", "Otakar", "Petr", "Radek", "Stanislav", "Teodor", "Urban", "Vaclav", "Walter", "Zdenek", "Alois", "Bohumil", "Ctibor", "Dominik", "Erik", "Felix", "Gerhard", "Herbert", "Ivo", "Josef", "Kristian", "Ladislav", "Matej", "Nicolas", "Oscar", "Patrik", "Richard", "Svatopluk", "Tadeusz", "Ulrich", "Vilem", "Wolfgang", "Antonin", "Blazej", "Cenek", "Dusan", "Egon", "Ferdinand", "Gejza", "Havel", "Ignac", "Jan", "Kvido", "Leopold", "Miloslav", "Norbert", "Oldrich", "Premysl", "Rudolf", "Samo", "Tibor", "Vit", "Vratislav", "Xaver", "Zoltan", "Arnost", "Bohdan", "Ctibor", "Dezider", "Evzen", "Fedor", "Gabriel", "Helmut", "Ilja", "Jachym", "Klement"],
        lastNames: ["Adamec", "Barta", "Cerny", "Dolezal", "Fiala", "Hajek", "Kratky", "Machacek", "Novotny", "Polacek", "Richter", "Sedlacek", "Tuma", "Vesely", "Wagner", "Zajic", "Benes", "Capek", "Dvorak", "Fiser", "Horak", "Krejci", "Malek", "Nemec", "Pospichal", "Ruzicka", "Simek", "Turek", "Vlcek", "Zeman", "Beran", "Cermak", "Dusek", "Fleischmann", "Hrubý", "Kulhanek", "Matousek", "Neumann", "Prochazka", "Reznicek", "Spacek", "Tyl", "Volek", "Zeleny", "Blazek", "Cizek", "Dvoarek", "Fous", "Hudec", "Kudrna", "Mensik", "Novak", "Prusa", "Ryba", "Stanek", "Urbanek", "Voracek", "Zikmund", "Bouska", "Cihar", "Duda", "Frantik", "Husak", "Kyral", "Merta", "Ostrý", "Ptak", "Rysavy", "Straka", "Uher", "Vrabec", "Zivny", "Brozek", "Cihlar", "Dunka", "Frydrich", "Hyka", "Lantos", "Mikula", "Palka", "Pytlik", "Safarik", "Suchan", "Ulrich", "Vavra", "Zubr", "Buchta", "Cima", "Dvoracek", "Gajdos", "Hynek", "Lazar", "Minarik", "Panek", "Rada", "Sauer", "Svoboda", "Umlauf", "Vejvoda"]
      },
      "Slovakia": {
        firstNames: ["Adam", "Boris", "Cyril", "Daniel", "Emil", "Frantisek", "Gustav", "Henrich", "Igor", "Jakub", "Karol", "Ladislav", "Marek", "Norbert", "Oliver", "Pavol", "Robert", "Stefan", "Tomas", "Viktor", "Zdeno", "Alexander", "Branislav", "Ctibor", "Dusan", "Eduard", "Felix", "Gabriel", "Hubert", "Ivan", "Jozef", "Kamil", "Lubomir", "Martin", "Ondrej", "Peter", "Richard", "Stanislav", "Tibor", "Urban", "Viliam", "Walter", "Zlatko", "Alojz", "Bohdan", "Dezider", "Egon", "Ferdinand", "Gejza", "Hector", "Ignac", "Jan", "Koloman", "Leopold", "Matej", "Oskar", "Patrik", "Rudolf", "Samuel", "Teodor", "Valent", "Werner", "Xaver", "Zoltan", "Aurel", "Blahoslav", "Cestmir", "Dalibor", "Ernest", "Florián", "Gregor", "Horst", "Imrich", "Jaroslav", "Kristian", "Libor", "Milos", "Nikolas", "Oldrich", "Prokop", "Rastislav", "Slavomir", "Tomislav", "Vladislav", "Vratislav", "Zdenek", "Anton", "Blažej", "Cyrus", "David", "Erik", "Filip", "Georg", "Hugo", "Izidor", "Juraj", "Konrad", "Lukas", "Michal", "Nikolaj"],
        lastNames: ["Balas", "Cerny", "Dolinsky", "Fabian", "Galko", "Hamrak", "Janko", "Kolar", "Liska", "Marak", "Nagy", "Oravec", "Pekar", "Rigo", "Siska", "Toth", "Urban", "Varga", "Wagner", "Ziak", "Balog", "Cierny", "Duris", "Fedak", "Gaspar", "Havel", "Janik", "Kovac", "Lukac", "Masarik", "Nemec", "Ondrus", "Pekny", "Rostas", "Smolik", "Turcan", "Uher", "Vlachy", "Zimmer", "Benko", "Culen", "Dvorsky", "Filip", "Gonda", "Horak", "Juhas", "Kriska", "Macko", "Matej", "Novak", "Palka", "Polak", "Rusnák", "Straka", "Uhrin", "Vasil", "Yakubovich", "Berky", "Cupka", "Dzurik", "Fillo", "Gregor", "Hudak", "Jurco", "Kubik", "Machala", "Mikus", "Olah", "Panik", "Rehak", "Suchy", "Takac", "Valent", "Weiss", "Zigo", "Bielik", "Dano", "Fasko", "Gajdos", "Halko", "Jakubec", "Kempny", "Laco", "Meszaros", "Musil", "Pavelka", "Reway", "Sykora", "Tomka", "Visnovsky", "Bondra", "Demitra", "Gaborik", "Handzus", "Lintner", "Palffy", "Satan", "Zigmund"]
      },
      "Germany": {
        firstNames: ["Alexander", "Benjamin", "Christian", "Daniel", "Erik", "Felix", "Gustav", "Heinrich", "Jan", "Klaus", "Lars", "Matthias", "Niklas", "Oliver", "Patrick", "Robert", "Sebastian", "Tobias", "Ulrich", "Viktor", "Wilhelm", "Adrian", "Benedikt", "Constantin", "Dominik", "Emil", "Florian", "Georg", "Hendrik", "Ingo", "Jakob", "Kai", "Leon", "Martin", "Nicolas", "Oskar", "Philipp", "Rico", "Stefan", "Thomas", "Vincent", "Werner", "Xaver", "Yannick", "Zacharias", "Andreas", "Bernd", "Cornelius", "Dennis", "Edgar", "Franz", "Gerhard", "Hans", "Ingo", "Joachim", "Karl", "Ludwig", "Manuel", "Norbert", "Otto", "Paul", "Rainer", "Sven", "Tim", "Uwe", "Volker", "Wolfgang", "Anton", "Bruno", "Carl", "Dieter", "Erich", "Friedrich", "Günter", "Helmut", "Jörg", "Konrad", "Lutz", "Manfred", "Nils", "Olaf", "Peter", "Rudolf", "Siegfried", "Theo", "Udo", "Walter", "Albert", "Bernhard", "Clemens", "Dietrich", "Ernst", "Fritz", "Gottfried", "Horst", "Jürgen", "Kurt", "Lothar", "Max", "Nikolaus", "Ottmar"],
        lastNames: ["Bauer", "Fischer", "Hoffmann", "Kellner", "Müller", "Neumann", "Schmidt", "Wagner", "Zimmermann", "Becker", "Hartmann", "Koch", "Lehmann", "Richter", "Schulz", "Weber", "Wolf", "Braun", "Huber", "König", "Mayer", "Schneider", "Schwarz", "Winkler", "Berger", "Groß", "Kaiser", "Kraus", "Meyer", "Schmitt", "Vogt", "Winter", "Arnold", "Franke", "Herrmann", "Jung", "Klein", "Ludwig", "Schäfer", "Walter", "Beck", "Fuchs", "Hahn", "Kaufmann", "Keller", "Peters", "Schulze", "Weiss", "Albrecht", "Friedrich", "Haller", "Janssen", "Kramer", "Lang", "Roth", "Sommer", "Adam", "Fink", "Graf", "Heinrich", "Jäger", "Kraft", "Lange", "Sauer", "Thomas", "Baumann", "Feldmann", "Grimm", "Horn", "Kern", "Kuhn", "Marx", "Pohl", "Scholz", "Bach", "Frank", "Haas", "Hofer", "Jung", "Kurz", "Meier", "Pfeiffer", "Seeger", "Bauer", "Förster", "Hansen", "Huber", "Kluge", "Lorenz", "Otto", "Ritter", "Stark", "Andres", "Engel", "Henkel", "Jansen", "Lenz", "Möller", "Riedel", "Stein", "Vogel"]
      },
      "Austria": {
        firstNames: ["Alexander", "Andreas", "Christoph", "Daniel", "Emanuel", "Florian", "Georg", "Helmut", "Johann", "Klaus", "Leopold", "Maximilian", "Nikolaus", "Oliver", "Patrick", "Richard", "Sebastian", "Thomas", "Viktor", "Wolfgang", "Adrian", "Benedikt", "Constantin", "Dominik", "Elias", "Franz", "Gabriel", "Heinrich", "Ignaz", "Jakob", "Karl", "Lukas", "Martin", "Oskar", "Paul", "Robert", "Stefan", "Tobias", "Ulrich", "Valentin", "Werner", "Anton", "Bruno", "Christian", "David", "Erwin", "Felix", "Gregor", "Hans", "Ivan", "Josef", "Konrad", "Ludwig", "Michael", "Norbert", "Otto", "Peter", "Rudolf", "Simon", "Theodor", "Urban", "Walter", "Xaver", "Bernhard", "Clemens", "Dieter", "Ernst", "Friedrich", "Günter", "Herbert", "Ingo", "Joachim", "Kurt", "Lothar", "Manfred", "Nils", "Oswald", "Philipp", "Rainer", "Siegfried", "Titus", "Ulrich", "Vincenz", "Wilhelm", "Albert", "Blasius", "Cornelius", "Dietrich", "Emil", "Ferdinand", "Gottfried", "Hubert", "Isidor", "Julius", "Kaspar", "Leonhard", "Matthias", "Notburga"],
        lastNames: ["Bauer", "Huber", "Gruber", "Wagner", "Müller", "Pichler", "Steiner", "Moser", "Mayer", "Hofer", "Leitner", "Berger", "Fuchs", "Eder", "Fischer", "Schmid", "Winkler", "Weber", "Schwarz", "Maier", "Schneider", "Reiter", "Mayr", "Schmidt", "Kohl", "Brunner", "Lang", "Baumgartner", "Auer", "Binder", "Lechner", "Wolf", "Wallner", "Aigner", "Wimmer", "Egger", "Stockinger", "Schuster", "Schober", "Horvath", "Rainer", "Pölzl", "Gschwandtner", "Köhler", "Holzer", "Stadler", "Forster", "Peter", "Jäger", "Grabner", "Kaufmann", "Freund", "Wohlfahrt", "Haas", "Haller", "Fröhlich", "Kraus", "Hoffmann", "Richter", "Neumann", "Weiss", "Hartmann", "Scholz", "Böhm", "Klein", "Braun", "Zimmermann", "Kramer", "Herrmann", "König", "Kaiser", "Gross", "Franke", "Beck", "Jung", "Hahn", "Sommer", "Vogel", "Friedrich", "Decker", "Kern", "Barth", "Krause", "Schubert", "Lehmann", "Schreiber", "Koch", "Kuhn", "Herrmann", "Engelmann", "Seiler", "Hübner", "Schenk", "Schröder", "Ebert", "Nowak", "Scherer", "Münch", "Zimmermann"]
      },
      "France": {
        firstNames: ["Alexandre", "Antoine", "Baptiste", "Clément", "Damien", "Étienne", "François", "Guillaume", "Hugo", "Julien", "Louis", "Maxime", "Nicolas", "Olivier", "Pierre", "Quentin", "Romain", "Sébastien", "Thomas", "Victor", "Adrien", "Benjamin", "Charles", "David", "Emmanuel", "Fabien", "Gabriel", "Henri", "Ivan", "Jacques", "Kevin", "Lucas", "Martin", "Nathan", "Oscar", "Paul", "Raphaël", "Simon", "Théo", "Vincent", "Arthur", "Bastien", "César", "Denis", "Éric", "Florian", "Gaël", "Hadrien", "Ilan", "Jean", "Killian", "Léo", "Matthieu", "Noé", "Owen", "Philippe", "Rémi", "Samuel", "Thibault", "Valentin", "William", "Alexis", "Bruno", "Cédric", "Dorian", "Edouard", "Félix", "Gilles", "Hervé", "Isaïe", "Jordan", "Kévin", "Laurent", "Mathis", "Noël", "Octave", "Pascal", "Robin", "Stéphane", "Tristan", "Ulysse", "Vivien", "Alan", "Barnabé", "Côme", "Diego", "Eliott", "Franck", "Gaston", "Hippolyte", "Irvin", "Jonas", "Karim", "Loïc", "Marius", "Nolan"],
        lastNames: ["Bernard", "Dubois", "Moreau", "Laurent", "Simon", "Michel", "Lefebvre", "Leroy", "Roux", "David", "Bertrand", "Morel", "Fournier", "Girard", "Bonnet", "Dupont", "Lambert", "Fontaine", "Rousseau", "Vincent", "Muller", "Lefevre", "Faure", "Andre", "Mercier", "Blanc", "Guerin", "Boyer", "Martin", "Durand", "Chevalier", "Francois", "Legrand", "Gauthier", "Garcia", "Perrin", "Robin", "Clement", "Morin", "Nicolas", "Henry", "Roussel", "Mathieu", "Gautier", "Masson", "Marchand", "Duval", "Denis", "Dumont", "Marie", "Lemaire", "Noel", "Meyer", "Dufour", "Meunier", "Brun", "Blanchard", "Giraud", "Joly", "Riviere", "Lucas", "Brunet", "Gaillard", "Barbier", "Arnaud", "Martinez", "Gerard", "Roche", "Vermeulen", "Lemoine", "Menard", "Leclerc", "Besnard", "Bailly", "Herve", "Schneider", "Fernandez", "Le Gall", "Collet", "Leger", "Boucher", "Favier", "Besson", "Rémy", "Bourgeois", "Vidal", "Potier", "Remy", "Monnier", "Hubert", "Renard", "Grosjean", "Moulin", "Prevost", "Perrier", "Salomon", "Cordier", "Barre", "Deschamps", "Verdier", "Charpentier", "Guyot", "Julien"]
      },
      "Latvia": {
        firstNames: ["Aigars", "Artūrs", "Dāvis", "Eduards", "Gatis", "Jānis", "Kārlis", "Lauris", "Mārtiņš", "Normunds", "Oskars", "Pēteris", "Raitis", "Sandis", "Uldis", "Valdis", "Zigmunds", "Andris", "Edgars", "Gunārs", "Ivars", "Juris", "Kristaps", "Līga", "Modris", "Ojārs", "Raimonds", "Sergejs", "Toms", "Uģis", "Viktors", "Aleksandrs", "Ernests", "Gints", "Ingars", "Jāzeps", "Klāvs", "Laimonis", "Māris", "Nils", "Oļegs", "Pauls", "Roberts", "Staņislavs", "Tālivaldis", "Uldis", "Vilis", "Augusts", "Emīls", "Gvido", "Imants", "Jēkabs", "Kaspars", "Linards", "Miķelis", "Otomārs", "Pāvils", "Rolands", "Silvijs", "Timurs", "Uldriķis", "Viesturs", "Agris", "Emīls", "Harijs", "Igors", "Jūlijs", "Krists", "Leonīds", "Mārcis", "Nikolajs", "Olafs", "Pjotrs", "Rihards", "Sergejs", "Tālis", "Uldis", "Vilnis", "Aldis", "Elvijs", "Genādijs", "Inārs", "Jānis", "Kārlis", "Leonards", "Maksims", "Ņikita", "Oļegs", "Pēteris", "Rūdolfs", "Sergejs", "Tomass", "Uļjana", "Vitalijs"],
        lastNames: ["Bērziņš", "Kalniņš", "Ozoliņš", "Liepiņš", "Krūmiņš", "Zariņš", "Krastiņš", "Vītoliņš", "Sproģis", "Āboliņš", "Pētersons", "Grants", "Freimanis", "Melngailis", "Šmits", "Rozentāls", "Kreicbergs", "Lācis", "Dārziņš", "Siliņš", "Krasts", "Straumanis", "Niedra", "Līcis", "Gailītis", "Zīle", "Krivickis", "Spriņģis", "Zaķis", "Ozols", "Dimants", "Gulbis", "Lagzdiņš", "Priede", "Kalis", "Rūķis", "Briedis", "Mednis", "Upītis", "Vilks", "Karps", "Lejiņš", "Rudzītis", "Krauklis", "Sērmulis", "Zirnis", "Baumanis", "Griķis", "Liepa", "Smilga", "Vējš", "Apse", "Daugule", "Ķīris", "Ronis", "Kalns", "Birznieks", "Kājums", "Vilciņš", "Straujš", "Meijers", "Jaunsudrabiņš", "Birzgalis", "Ķenga", "Rozīte", "Skujiņš", "Dumpis", "Kronītis", "Lauva", "Saulīte", "Vārna", "Zvaigzne", "Balodis", "Krauklis", "Ūdris", "Spīdola", "Lazdiņš", "Migla", "Purviņš", "Sakne", "Tīrums", "Vilkaste", "Alnis", "Brencis", "Dzenis", "Ķērpis", "Lieknītis", "Ozolīte", "Runcis", "Svīre", "Ūdens", "Vētra", "Zaķīte", "Blūms", "Dūja", "Koku", "Maijs", "Rudens", "Sīlis", "Ziemas"]
      },
      "Belarus": {
        firstNames: ["Aleksander", "Dzmitry", "Siarhei", "Andrei", "Vitaly", "Evgeny", "Maksim", "Igor", "Pavel", "Roman", "Nikita", "Vladislav", "Denis", "Mikhail", "Oleg", "Viktor", "Anton", "Dmitri", "Ivan", "Konstantin", "Leonid", "Nikolai", "Ruslan", "Vladimir", "Yuri", "Alexei", "Boris", "Grigory", "Kirill", "Sergei", "Valery", "Anatoly", "Artyom", "Fyodor", "Ilya", "Maxim", "Petr", "Stanislav", "Vadim", "Yaroslav", "Alexander", "Bogdan", "Egor", "Georgy", "Iosif", "Makar", "Platon", "Rostislav", "Timur", "Veniamin", "Zakhar", "Arkady", "Gennadiy", "Innokentiy", "Lev", "Matei", "Savely", "Taras", "Vsevolod", "Yakov", "Arseniy", "Demyan", "Ermolay", "Gavriil", "Ignat", "Mitrofan", "Nestor", "Ostap", "Prokhor", "Tikhon", "Vissarion", "Zinoviy", "Akim", "Dorofey", "Fedor", "Gury", "Kondrat", "Lukyan", "Nazar", "Panteleimon", "Semyon", "Trofim", "Vikentiy", "Yevstafiy", "Agafon", "Efim", "Gordey", "Isaak", "Modest", "Nikodim", "Pakhom", "Sevastyan", "Tit", "Yefrem", "Anisim", "Evdokim", "Gavrila"],
        lastNames: ["Vasiliev", "Petrov", "Sidorov", "Kozlov", "Kuznetsov", "Popov", "Lebedev", "Novikov", "Fedorov", "Morozov", "Volkov", "Alekseev", "Yakovlev", "Sokolov", "Mikhailov", "Andreev", "Bogdanov", "Titov", "Romanov", "Sergeev", "Maksimov", "Orlov", "Nikolaev", "Makarov", "Zaitsev", "Ivanov", "Smirnov", "Soloviev", "Egorov", "Tarasov", "Belov", "Komarov", "Nikitin", "Voronov", "Gusev", "Karpov", "Pavlov", "Vinogradov", "Stepanov", "Davydov", "Gerasimov", "Grigoriev", "Yermakov", "Abramov", "Medvedev", "Antonov", "Rodionov", "Kiselev", "Ilyin", "Markov", "Kazakov", "Maslov", "Krylov", "Klimov", "Ponomarev", "Golubev", "Galkin", "Zhilin", "Kurkin", "Efremov", "Fomin", "Melnikov", "Isakov", "Zhukov", "Kulikov", "Shevchenko", "Prokhorov", "Semyonov", "Golikov", "Subbotin", "Ushakov", "Tikhomirov", "Rubtsov", "Karpenko", "Evdokimov", "Kotov", "Shestakov", "Gromov", "Filimonov", "Avdeev", "Shakurov", "Kasatkyn", "Maslakov", "Ershov", "Kondrashov", "Vorobyev", "Shuvalov", "Gorbunov", "Simonov", "Loginov", "Nazarov", "Frolov", "Baranov", "Denisov", "Fadeev", "Vladimirov", "Yahin", "Kotlyarov", "Borisov", "Kolesnikov"]
      },
      "Italy": {
        firstNames: ["Alessandro", "Andrea", "Antonio", "Davide", "Francesco", "Giuseppe", "Lorenzo", "Luca", "Marco", "Matteo", "Michele", "Nicola", "Roberto", "Stefano", "Tommaso", "Alberto", "Angelo", "Carlo", "Daniele", "Emanuele", "Fabio", "Gabriele", "Jacopo", "Leonardo", "Massimo", "Paolo", "Riccardo", "Simone", "Vincenzo", "Alessio", "Claudio", "Diego", "Enrico", "Filippo", "Giovanni", "Ignazio", "Luigi", "Maurizio", "Raffaele", "Salvatore", "Umberto", "Valentino", "Adriano", "Bruno", "Cesare", "Domenico", "Enzo", "Franco", "Giulio", "Ivan", "Luciano", "Mario", "Nino", "Oscar", "Pietro", "Romano", "Sergio", "Tiziano", "Valerio", "Alfredo", "Benedetto", "Cristiano", "Dario", "Edoardo", "Federico", "Giorgio", "Hugo", "Iacopo", "Kevin", "Leandro", "Marcello", "Nicolò", "Ottavio", "Patrizio", "Renato", "Samuele", "Teodoro", "Vito", "Achille", "Biagio", "Camillo", "Dino", "Egidio", "Fausto", "Gaetano", "Ivo", "Lamberto", "Mauro", "Nello", "Oreste", "Primo", "Rodolfo", "Silvano", "Tullio", "Valter", "Attilio", "Bernardo", "Claudio", "Dante", "Ezio"],
        lastNames: ["Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Marino", "Greco", "Bruno", "Gallo", "Conti", "De Luca", "Mancini", "Costa", "Giordano", "Rizzo", "Lombardi", "Moretti", "Barbieri", "Fontana", "Santoro", "Mariani", "Rinaldi", "Caruso", "Ferrara", "Galli", "Martini", "Leone", "Longo", "Gentile", "Martinelli", "Vitale", "Lombardo", "Serra", "Coppola", "De Santis", "D'Angelo", "Marchetti", "Parisi", "Villa", "Conte", "Ferretti", "Pellegrini", "Palumbo", "Sanna", "Fabbri", "Caputo", "Montanari", "Grassi", "Testa", "Donati", "Morelli", "Barone", "Silvestri", "Basile", "Orlando", "Fiore", "Pagano", "Benedetti", "Sartori", "Neri", "Cattaneo", "Monti", "Guerra", "Messina", "Negri", "Sala", "Rocco", "Gatti", "De Angelis", "Bernardi", "Sorrentino", "Palmieri", "Marini", "De Rosa", "Basso", "Valenti", "Piccoli", "Costantini", "Milani", "Ferraro", "Rizzi", "Landi", "Bianco", "Ferri", "Piras", "Giuliani", "Grasso", "Amato", "Benedetto", "Ruggiero", "Farina", "Sacco", "Capello", "Cattani", "Bertolini", "Franchi", "Bertrand", "Lorenz"]
      },
      "Japan": {
        firstNames: ["Akira", "Daiki", "Hiroshi", "Kazuki", "Makoto", "Naoki", "Ryota", "Takeshi", "Yuki", "Satoshi", "Kenji", "Masaki", "Taro", "Shingo", "Kenta", "Daisuke", "Haruto", "Tomoya", "Yuta", "Ryo", "Shota", "Kohei", "Hayato", "Takuya", "Yusuke", "Sota", "Kaito", "Ren", "Tatsuya", "Koki", "Yamato", "Yuji", "Shinji", "Kouki", "Taiga", "Ayato", "Hibiki", "Riku", "Sho", "Tsubasa", "Takuma", "Kei", "Atsushi", "Jun", "Minoru", "Shinya", "Yoshiki", "Kosuke", "Fumiya", "Wataru", "Kazuma", "Sora", "Hiro", "Shun", "Akito", "Daigo", "Gaku", "Katsu", "Mitsuki", "Osamu", "Raito", "Shin", "Yuma", "Asahi", "Dai", "Eisuke", "Genta", "Ichiro", "Jiro", "Kyo", "Masa", "Nao", "Rei", "Susumu", "Taiki", "Yasushi", "Zen", "Akihiko", "Daisuke", "Eiji", "Fumio", "Goro", "Hideo", "Isamu", "Jinta", "Kiyoshi", "Mamoru", "Noboru", "Osuke", "Rokuro", "Saburo", "Tadao", "Utaka", "Yoshio", "Atsuko", "Daizo", "Emiko", "Ginjiro"],
        lastNames: ["Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Kato", "Yoshida", "Yamada", "Sasaki", "Yamaguchi", "Matsumoto", "Inoue", "Kimura", "Hayashi", "Shimizu", "Yamazaki", "Mori", "Abe", "Ikeda", "Hashimoto", "Yamashita", "Ishikawa", "Nakajima", "Maeda", "Fujita", "Ogawa", "Goto", "Okada", "Hasegawa", "Murakami", "Kondo", "Ishii", "Saito", "Sakamoto", "Endou", "Aoki", "Fujii", "Nishimura", "Fukuda", "Ota", "Miura", "Takeuchi", "Nakayama", "Takagi", "Takahashi", "Fujiwara", "Kaneko", "Kawasaki", "Nakano", "Harada", "Matsuda", "Kuroda", "Yagi", "Yoshikawa", "Iwasaki", "Asano", "Miyazaki", "Sekiguchi", "Miyamoto", "Tsunoda", "Takeda", "Ueda", "Sugawara", "Hirano", "Koizumi", "Katayama", "Nagata", "Ishida", "Kudo", "Yokoyama", "Miyajima", "Nagai", "Watabe", "Suzuki", "Shiraishi", "Takahara", "Nakagawa", "Morimoto", "Kawamura", "Uchida", "Kitamura", "Hoshino", "Tamura", "Sakurai", "Fujimoto", "Kawai", "Matsui", "Imamura", "Taniguchi", "Hayakawa", "Osawa", "Noda", "Imai", "Suzuki", "Takemura", "Yamane", "Tsuji", "Murata", "Nishida", "Igarashi"]
      }
    };

    const nationalities = [
      { name: "Canada", weight: 0.35 },
      { name: "USA", weight: 0.25 },
      { name: "Sweden", weight: 0.08 },
      { name: "Finland", weight: 0.07 },
      { name: "Russia", weight: 0.06 },
      { name: "Czech Republic", weight: 0.04 },
      { name: "Slovakia", weight: 0.03 },
      { name: "Germany", weight: 0.03 },
      { name: "Switzerland", weight: 0.02 },
      { name: "Austria", weight: 0.02 },
      { name: "Norway", weight: 0.015 },
      { name: "Denmark", weight: 0.015 },
      { name: "France", weight: 0.01 },
      { name: "Latvia", weight: 0.008 },
      { name: "Belarus", weight: 0.005 },
      { name: "Italy", weight: 0.003 },
      { name: "Japan", weight: 0.002 }
    ];

    // Weighted random nationality selection
    const random = Math.random();
    let cumulative = 0;
    let selectedNationality = "Canada";
    
    for (const nat of nationalities) {
      cumulative += nat.weight;
      if (random <= cumulative) {
        selectedNationality = nat.name;
        break;
      }
    }
    
    const names = namesByNationality[selectedNationality as keyof typeof namesByNationality] || namesByNationality["Canada"];
    
    const firstName = names.firstNames[Math.floor(Math.random() * names.firstNames.length)];
    const lastName = names.lastNames[Math.floor(Math.random() * names.lastNames.length)];
    
    // Age based on league type
    const ageRange = getAgeRange(selectedLeagueData?.league_type || 'pro');
    const age = Math.floor(Math.random() * (ageRange.max - ageRange.min + 1)) + ageRange.min;

    // Generate realistic ratings based on position
    const baseRating = Math.floor(Math.random() * 30) + 50; // 50-80 base
    const variance = 15;

    const generateStat = (positionBonus = 0) => {
      return Math.floor(Math.max(25, Math.min(95, baseRating + positionBonus + Math.floor(Math.random() * variance) - variance/2)));
    };

    let stats = {
      shooting: generateStat(),
      passing: generateStat(),
      defense: generateStat(),
      puck_control: generateStat(),
      checking: generateStat(),
      movement: generateStat(),
      vision: generateStat(),
      poise: generateStat(),
      aggressiveness: generateStat(),
      discipline: generateStat(),
      fighting: generateStat(),
      flexibility: generateStat(),
      injury_resistance: generateStat(),
      fatigue: generateStat(),
      rebound_control: position === 'G' ? generateStat(20) : generateStat(-10)
    };

    // Position-specific adjustments
    if (position === 'G') {
      stats.rebound_control = generateStat(25);
      stats.poise = generateStat(15);
      stats.flexibility = generateStat(20);
      stats.shooting = generateStat(-20);
      stats.checking = generateStat(-30);
    } else if (position === 'D') {
      stats.defense = generateStat(15);
      stats.checking = generateStat(10);
      stats.poise = generateStat(10);
    } else { // Forwards
      stats.shooting = generateStat(10);
      stats.puck_control = generateStat(10);
      stats.movement = generateStat(5);
    }

    return {
      first_name: firstName,
      last_name: lastName,
      age,
      nationality,
      player_position: position,
      ...stats
    };
  };

  const generatePlayers = async () => {
    if (!selectedLeague) {
      toast({
        title: "Error",
        description: "Please select a league first",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    setProgress(0);

    try {
      const players = [];
      let currentProgress = 0;

      // Generate players for each position
      for (const position of positions) {
        const count = Math.floor(playerCount * (position.min + position.max) / 2 / 25); // Distribute across positions
        
        for (let i = 0; i < count; i++) {
          const player = generateRandomPlayer(position.value);
          players.push({
            ...player,
            league_id: selectedLeague,
            team_id: selectedTeam === 'free_agents' ? null : selectedTeam || null,
            status: 'active'
          });
          
          currentProgress += 1;
          setProgress((currentProgress / playerCount) * 100);
          
          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      // Fill remaining slots with random positions
      while (players.length < playerCount) {
        const randomPosition = positions[Math.floor(Math.random() * positions.length)];
        const player = generateRandomPlayer(randomPosition.value);
        players.push({
          ...player,
          league_id: selectedLeague,
          team_id: selectedTeam || null,
          status: 'active'
        });
        
        currentProgress += 1;
        setProgress((currentProgress / playerCount) * 100);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Insert players into database
      const { error } = await supabase
        .from('players')
        .insert(players);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Generated ${players.length} players successfully`,
      });
      
      setProgress(100);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <UserPlus className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Player Generator</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Generation Form */}
          <Card className="card-rink">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Generate Players
              </CardTitle>
              <CardDescription>
                Create realistic fictional players with detailed attributes for your league
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="league">League *</Label>
                <Select value={selectedLeague} onValueChange={handleLeagueChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a league" />
                  </SelectTrigger>
                  <SelectContent>
                    {leagues.filter(league => league.id && league.id.trim()).map(league => (
                      <SelectItem key={league.id} value={league.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant={league.league_type === 'pro' ? 'default' : league.league_type === 'farm' ? 'secondary' : 'outline'}>
                            {league.league_type.toUpperCase()}
                          </Badge>
                          {league.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedLeagueData && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="w-4 h-4" />
                    Age range: {getAgeRange(selectedLeagueData.league_type).min}-{getAgeRange(selectedLeagueData.league_type).max} years
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="team">Team (Optional)</Label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to specific team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free_agents">Free Agents</SelectItem>
                    {teams.filter(team => team.id && team.id.trim()).map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        <div className="flex items-center gap-2">
                          {team.is_ai_controlled && (
                            <Badge variant="secondary" className="text-xs">AI</Badge>
                          )}
                          {team.city} {team.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Draft Eligibility Info */}
              {selectedLeagueData && (
                <div className="bg-info/10 border border-info/20 rounded-lg p-4">
                  <h4 className="font-semibold text-info mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Draft Eligibility Rules
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {selectedLeagueData.league_type === 'pro' && (
                      <>
                        <div>• Players must be 18+ to be draft eligible</div>
                        <div>• Pro league allows ages 18-40</div>
                      </>
                    )}
                    {selectedLeagueData.league_type === 'farm' && (
                      <>
                        <div>• Farm league allows ages 16-35</div>
                        <div>• Linked to parent pro organization</div>
                      </>
                    )}
                    {selectedLeagueData.league_type === 'junior' && (
                      <>
                        <div>• Junior league: Ages 16-21 only</div>
                        <div>• Not draft eligible until age 18</div>
                        <div>• All teams are AI-controlled</div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="count">Number of Players</Label>
                <Input
                  id="count"
                  type="number"
                  value={playerCount}
                  onChange={(e) => setPlayerCount(parseInt(e.target.value) || 30)}
                  min={1}
                  max={1000}
                />
              </div>

              {generating && (
                <div className="space-y-2">
                  <Label>Generation Progress</Label>
                  <Progress value={progress} />
                  <p className="text-sm text-muted-foreground">
                    Generating realistic players... {Math.round(progress)}%
                  </p>
                </div>
              )}

              <Button 
                onClick={generatePlayers} 
                className="w-full btn-hockey"
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Players...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Generate {playerCount} Players
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Position Distribution */}
          <Card className="card-rink">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Position Distribution
              </CardTitle>
              <CardDescription>
                Realistic hockey team composition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {positions.map((position) => (
                  <div key={position.value} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{position.value}</Badge>
                      <span className="font-medium">{position.label}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {position.min}-{position.max} per team
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-rink stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Realistic Attributes</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                15+ detailed player attributes including shooting, defense, and position-specific skills
              </p>
            </CardContent>
          </Card>

          <Card className="card-rink stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-accent" />
                <h3 className="font-semibold">International Players</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Players from 11+ hockey nations with culturally appropriate names
              </p>
            </CardContent>
          </Card>

          <Card className="card-rink stat-card">
            <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-team-gold" />
                    <h3 className="font-semibold">Tiered League System</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Age-appropriate generation for Pro (18+), Farm (16+), and Junior (16-21) leagues
                  </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PlayerGenerator;