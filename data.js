/* ================= CATALOGUE ================= */
// Écoutes en millions, indicatives. b = base pour les titres sans chiffre. null = classique fondateur (Divin).
// p:1 = sélection (tracklist partielle). Titres underground vérifiés sur Spotify ; tracklists des autres albums écrites de mémoire.
const RAW=[
/* ---------- RAP FR ---------- */
{n:'PNL',g:'FR',al:[
 {t:'Dans la légende',y:2016,b:45,tr:[['DA',230],['Naha',200],['Onizuka',190],["J'suis QLF",90],'Bené',['La vie est belle',150],["Jusqu'au dernier gramme",140],['Luz de luna',80],['Tchiki tchiki',110],'Kratos','Uranus','Dans la légende','Humain','Mira']},
 {t:'Deux frères',y:2019,b:50,tr:[['Deux frères',170],['Au DD',420],['Blanka',140],["91's",90],['Celsius',110],'Coco',["À l'ammoniaque",270],'Zoulou tchaing','Kuta Ubud','Shenmue','Cramés','Autre monde','Hasta la vista',['Chang',80]]}],
 sg:[['Le monde ou rien',150,2015]]},
{n:'Nekfeu',g:'FR',al:[
 {t:'Feu',y:2015,b:28,tr:[['Martin Eden',45],['Égérie',65],['On verra',170],['Tempête',40],['Nique les clones, Pt. II',55],['Princesse',60],'Mauvaise graine','Être humain','Ma dope','Reuf','Risibles amours','Saturne']},
 {t:'Cyborg',y:2016,b:25,tr:[['Humanoïde',60],['Esquimaux',55],['Réalité augmentée',40],['Galatée',35],['Avant tu riais',30],'Tricheur','Squaw','Mal-aimé','Programmé','Nekketsu','Cyborg']},
 {t:'Les étoiles vagabondes',y:2019,b:18,p:1,tr:[['Elle pleut',60],'Compte les hommes',"Dans l'univers",'Cheum','Natsukashii']}]},
{n:'Orelsan',g:'FR',al:[
 {t:'Le chant des sirènes',y:2011,b:15,tr:[['Raelsan',45],["Plus rien ne m'étonne",70],['La terre est ronde',120],['Suicide social',35],'Double vie','Finir mal','Le chant des sirènes','Ils sont cools','Mauvaise idée','Si seul','1990']},
 {t:'La fête est finie',y:2017,b:40,tr:[['San',75],'La fête est finie',['Basique',210],['Tout va bien',160],['Défaite de famille',110],'Christophe',"Quand est-ce que ça s'arrête",'Zone','Notes pour trop tard','Dans ma ville, on traîne',['La pluie',120],['Paradis',80],'Épilogue']},
 {t:'Civilisation',y:2021,b:30,tr:[["L'odeur de l'essence",90],['La quête',120],['Shonen',40],['Manifeste',35],['Jour meilleur',85],'Civilisation','Rêve mieux','Ensemble','Bébéboa']}]},
{n:'Booba',g:'FR',al:[
 {t:'Nero Nemesis',y:2015,b:25,tr:[['Talion',40],['92i Veyron',70],'Tony Sosa',['Pinocchio',30],['Validée',90],['DKR',110],['Comme les autres',35],'Zer','Habibi','Attila','Walabok','Charbon']},
 {t:'Trône',y:2017,b:25,p:1,tr:[['Trône',40],['Nougat',70],['Petite fille',150],['Friday',60],['Gotham',45],'Drapeau noir','Ça va aller','Magnifique']}],
 sg:[['Ma définition',null,2002],['Boulbi',null,2006],['Pitbull',30,2006]]},
{n:'Damso',g:'FR',al:[
 {t:'Ipséité',y:2017,b:35,p:1,tr:[['Θ. Macarena',310],["Ν. J'respecte R",90],"Ψ. Peur d'aimer",'Ε. Signaler','Ω. Une âme pour deux','Σ. Rêves bizarres']},
 {t:'Lithopédion',y:2018,b:30,p:1,tr:[['Smog',60],['Silence',80],['Julien',70],['Feu de bois',50],'Baltringue','Festival de rêves','Lithopédion']}]},
{n:'Ninho',g:'FR',al:[{t:'Destin',y:2019,b:40,p:1,tr:[['Lettre à une femme',330],['Maman ne le sait pas',150],["Goutte d'eau",120],'Destin','Zipette']}],sg:[["La vie qu'on mène",140,2017],['Jefe',120,2021]]},
{n:'Freeze Corleone',g:'FR',al:[{t:'La Menace Fantôme',y:2020,b:15,p:1,tr:[['Freeze Raël',65],['Shavkat',40],['Projet Blue Beam',30],['Bâton rouge',25]]}],sg:[['Rap catéchisme',18,2018]]},
{n:'Lomepal',g:'FR',al:[{t:'Jeannine',y:2018,b:30,p:1,tr:[['Trop beau',140],['Yeux disent',110],['1000°C',90],['Club',50],['Mômes',40],'Évidemment','Ne me ressemble pas']}]},
{n:"Sexion d'Assaut",g:'FR',ini:'SDA',al:[{t:"L'école des points vitaux",y:2010,b:20,p:1,tr:[['Désolé',160],['Wati by Night',70],['Paris va bien',50],"Casquette à l'envers",'Africain','Ma direction']}],sg:[["Avant qu'elle parte",120,2012]]},
{n:'Maître Gims',g:'FR',ini:'GIMS',al:[{t:'Subliminal',y:2013,b:40,p:1,tr:[['Bella',520],["J'me tire",300],['Zombie',90]]}]},
{n:'Jul',g:'FR',sg:[['Tchikita',200,2016],['Wesh alors',70,2015],["On m'appelle l'ovni",80,2016],['Ma jolie',60,2016]]},
{n:'13 Organisé',g:'FR',ini:'13',sg:[['Bande organisée',460,2020]]},
{n:'SCH',g:'FR',sg:[['A7',60,2015],['Otto',50,2018],['Mode akimbo',40,2021]]},
{n:'Gazo',g:'FR',sg:[['Notre Dame',200,2023],['Die',100,2022]]},
{n:'Tiakola',g:'FR',sg:[['Meuda',220,2022],['Atasanté',90,2022]]},
{n:'SDM',g:'FR',sg:[['Bolide allemand',250,2023]]},
{n:'Laylow',g:'FR',al:[{t:'Trinity',y:2020,b:15,p:1,tr:[['Megatron',45],['Trinityville',35]]}]},
{n:'Alpha Wann',g:'FR',sg:[['Ça va ensemble',30,2023]]},
{n:'Vald',g:'FR',sg:[['Désaccordé',60,2018],['Eurotrap',45,2017],['Ce monde est cruel',40,2019]]},
{n:'Kaaris',g:'FR',al:[{t:'Or noir',y:2013,b:12,p:1,tr:[['Zoo',60],['Bouchon de liège',30]]}]},
{n:'Niska',g:'FR',sg:[['Réseaux',160,2017],['Médicament',80,2019]]},
{n:'Koba LaD',g:'FR',sg:[['Train de vie',60,2018]]},
{n:'MHD',g:'FR',sg:[['Afro Trap Part. 3 (Champions League)',90,2016]]},
{n:'Soolking',g:'FR',sg:[['Suavemente',260,2023],['Dalida',120,2018]]},
{n:"Heuss L'enfoiré",g:'FR',ini:'HL',sg:[['Moulaga',120,2019]]},
{n:'Naps',g:'FR',sg:[['La kiffance',170,2020]]},
{n:'Rohff',g:'FR',sg:[["Qui est l'exemple ?",30,2002]]},
{n:"Diam's",g:'FR',al:[{t:'Dans ma bulle',y:2006,b:10,p:1,tr:[['La boulette',60],['Confessions nocturnes',50],['Jeune demoiselle',40]]}]},
{n:'Kery James',g:'FR',sg:[['Banlieusards',40,2008]]},
{n:'IAM',g:'FR',al:[{t:"L'École du micro d'argent",y:1997,b:10,p:1,tr:[["Demain c'est loin",null],['Petit frère',40],['Nés sous la même étoile',25],["L'empire du côté obscur",20],["L'école du micro d'argent",15]]}]},
{n:'Suprême NTM',g:'FR',ini:'NTM',al:[{t:'Suprême NTM',y:1998,b:8,p:1,tr:[['Laisse pas traîner ton fils',null],['Ma Benz',45],['Seine-Saint-Denis Style',25],["That's My People",20]]}]},
{n:'MC Solaar',g:'FR',ini:'MC',sg:[['Caroline',null,1991],['Bouge de là',25,1991],['Nouveau western',30,1994]]},
{n:'Oxmo Puccino',g:'FR',al:[{t:'Opéra Puccino',y:1998,b:5,p:1,tr:[['Mama Lova',null],["L'enfant seul",15]]}]},
{n:'113',g:'FR',ini:'113',al:[{t:'Les Princes de la ville',y:1999,b:5,p:1,tr:[['Tonton du bled',null],['Les Princes de la ville',15]]}]},
/* ---------- UNDERGROUND FR (titres vérifiés sur Spotify) ---------- */
{n:'So La Lune',g:'FR',u:1,sg:[['Rodé',12,null,'Orbite'],['Tsukithèse',8,null,'2ème faille (Silfra)']]},
{n:'Jeune Morty',g:'FR',u:1,al:[{t:'Eponyme',y:null,b:6,p:1,tr:[['Couture',9],['Solo Dolo*',5]]}],sg:[['Ivoire Feeling',10,null,'Jeune Morty Vol.1'],['Dent',7,null,'Dent'],['Camera',6,null,'En Attendant Eponyme']]},
{n:'Jolagreen23',g:'FR',u:1,ini:'J23',al:[{t:'GOTY EDITION',y:null,b:8,p:1,tr:[['FUMER LE VERT',22],['300.000',14],['CR7 MAN UTD',10]]}],sg:[['JAPANEXPO',9,null,'23 JOURS PLUS TARD'],['360TrickShot',6,null,'A COLORS SHOW']]},
{n:'La Fève',g:'FR',u:1,al:[{t:'ERRR',y:null,b:8,p:1,tr:[['MAUVAIS PAYEUR',12],['NO HOOK',8]]}],sg:[['FINIS-LES',18,null,'FINIS-LES'],["RIEN D'EXCEPTIONNEL",9,null,'A COLORS SHOW']]},
{n:'Prince Waly',g:'FR',u:1,al:[{t:'Moussa',y:null,b:5,p:1,tr:[['Balotelli',12],['Problème',8],['BBF',5],['Cra$h',4]]}],sg:[['Junior',4,null,'Junior']]},
{n:'Luv Resval',g:'FR',u:1,al:[{t:'Etoile Noire',y:null,b:8,p:1,tr:[["Tout s'en va",16],['Cette fille',10],['MPC, Part II (La rivière)',6]]}],sg:[['Ballade nocturne III',7,null,'Mustafar'],['Crystal Lake',14,null,'Crystal Lake']]},
{n:'H JeuneCrack',g:'FR',u:1,ini:'HJC',sg:[['Au max',6,null,'MATIÈRE PREMIÈRE']]},
{n:'Rounhaa',g:'FR',u:1,sg:[['crame',10,null,'crame'],['nou',4,null,'nou'],['ZABUZA',6,null,'SALAAM']]},
{n:'8ruki',g:'FR',u:1,ini:'8R',al:[{t:'Lobby',y:null,b:5,p:1,tr:[['twerk',9],['ferme la',6]]}],sg:[['rxkneveu',5,null,'Lobby 2luxe'],['oeil pour oeil',4,null,'oeil pour oeil'],['tibi jones',3,null,'tibi jones']]},
{n:'Yvnnis',g:'FR',u:1,al:[{t:'DND',y:null,b:5,p:1,tr:[['EMOTICONE',8],['BARA',5]]}],sg:[['PAULETA',6,null,'PAULETA'],['VIN ITALIEN',5,null,'ETERNAL YOUTH'],['GARE DU NORD',4,null,"L'AFRO OU LES TRESSES"]]},
{n:'Kerchak',g:'FR',u:1,sg:[['Saison 2',12,null,'Saison 2'],['Tarzan',8,null,'Confiance'],['Sabor',6,null,'Sabor'],['Roule un autre',5,null,'A COLORS SHOW']]},
/* ---------- RAP US ---------- */
{n:'Kendrick Lamar',g:'US',al:[
 {t:'good kid, m.A.A.d city',y:2012,b:300,tr:["Sherane a.k.a Master Splinter's Daughter",["Bitch, Don't Kill My Vibe",600],'Backseat Freestyle','The Art of Peer Pressure',['Money Trees',1800],['Poetic Justice',700],'good kid','m.A.A.d city',['Swimming Pools (Drank)',900],"Sing About Me, I'm Dying of Thirst",'Real','Compton']},
 {t:'To Pimp a Butterfly',y:2015,b:150,tr:["Wesley's Theory",'For Free? (Interlude)',['King Kunta',400],'Institutionalized','These Walls','u',['Alright',700],'For Sale? (Interlude)','Momma','Hood Politics','How Much a Dollar Cost','Complexion (A Zulu Love)','The Blacker the Berry',"You Ain't Gotta Lie (Momma Said)",'i','Mortal Man']},
 {t:'DAMN.',y:2017,b:400,tr:['BLOOD.',['DNA.',900],'YAH.','ELEMENT.','FEEL.',['LOYALTY.',700],'PRIDE.',['HUMBLE.',2100],'LUST.',['LOVE.',1200],'XXX.','FEAR.','GOD.','DUCKWORTH.']},
 {t:'GNX',y:2024,b:250,tr:['wacced out murals',['squabble up',600],['luther',1500],'man at the garden','hey now','reincarnated',['tv off',500],'dodger blue','peekaboo','heart pt. 6','gnx','gloria']}],
 sg:[['Not Like Us',2000,2024]]},
{n:'Eminem',g:'US',al:[
 {t:'The Marshall Mathers LP',y:2000,b:250,tr:['Kill You',['Stan',1000],'Who Knew',['The Way I Am',400],['The Real Slim Shady',1400],'Remember Me?',"I'm Back",'Marshall Mathers','Drug Ballad','Amityville','Kim','Under the Influence','Criminal']},
 {t:'The Eminem Show',y:2002,b:200,tr:['White America','Business',["Cleanin' Out My Closet",450],'Square Dance','Soldier','Say Goodbye Hollywood','Drips',['Without Me',2100],['Sing for the Moment',420],['Superman',600],"Hailie's Song",'When the Music Stops','Say What You Say',["'Till I Collapse",1600],"My Dad's Gone Crazy"]}],
 sg:[['Lose Yourself',2600,2002]]},
{n:'Drake',g:'US',al:[
 {t:'Take Care',y:2011,b:300,tr:['Over My Dead Body','Shot for Me',['Headlines',500],['Crew Love',400],['Take Care',500],['Marvins Room',600],'Under Ground Kings',"We'll Be Fine",'Lord Knows','Doing It Wrong','The Real Her',"Look What You've Done",'HYFR','Practice','The Ride']},
 {t:'Views',y:2016,b:250,tr:['Keep the Family Close','9','U With Me?','Feel No Ways','Hype','Weston Road Flows','Redemption','With You','Faithful','Still Here',['Controlla',700],['One Dance',3300],'Grammys','Childs Play','Pop Style',['Too Good',900],'Fire & Desire','Views',['Hotline Bling',1600]]}],
 sg:[["God's Plan",2700,2018],['In My Feelings',1100,2018],['Nice For What',900,2018]]},
{n:'Travis Scott',g:'US',al:[{t:'ASTROWORLD',y:2018,b:350,tr:[['STARGAZING',800],'CAROUSEL',['SICKO MODE',2300],'R.I.P. SCREW','STOP TRYING TO BE GOD','NO BYSTANDERS','SKELETONS','WAKE UP','5% TINT','NC-17','ASTROTHUNDER',['YOSEMITE',500],"CAN'T SAY",'WHO? WHAT!',['BUTTERFLY EFFECT',1400],'HOUSTONFORNICATION','COFFEE BEAN']}],sg:[['goosebumps',1900,2016]]},
{n:'J. Cole',g:'US',ini:'JC',al:[{t:'2014 Forest Hills Drive',y:2014,b:350,tr:['Intro','January 28th',['Wet Dreamz',900],"03' Adolescence",'A Tale of 2 Citiez','Fire Squad','St. Tropez',['G.O.M.D.',500],['No Role Modelz',2000],'Hello',['Apparently',500],['Love Yourz',700],'Note to Self']}]},
{n:'Kanye West',g:'US',ini:'YE',al:[
 {t:'Graduation',y:2007,b:250,tr:['Good Morning','Champion',['Stronger',1500],'I Wonder',['Good Life',600],["Can't Tell Me Nothing",400],'Barry Bonds','Drunk and Hot Girls',['Flashing Lights',1100],'Everything I Am','The Glory',['Homecoming',500],'Big Brother']},
 {t:'My Beautiful Dark Twisted Fantasy',y:2010,b:200,tr:['Dark Fantasy','Gorgeous',['Power',600],'All of the Lights (Interlude)',['All of the Lights',900],['Monster',400],'So Appalled','Devil in a New Dress',['Runaway',700],'Hell of a Life','Blame Game','Lost in the World','Who Will Survive in America']}]},
{n:'Tyler, The Creator',g:'US',ini:'TTC',al:[{t:'IGOR',y:2019,b:300,tr:["IGOR'S THEME",['EARFQUAKE',1000],'I THINK','EXACTLY WHAT YOU RUN FROM YOU END UP CHASING','RUNNING OUT OF TIME',['NEW MAGIC WAND',500],['A BOY IS A GUN*',400],'PUPPET',"WHAT'S GOOD",'GONE, GONE / THANK YOU',"I DON'T LOVE YOU ANYMORE",['ARE WE STILL FRIENDS?',300]]}]},
{n:'Juice WRLD',g:'US',al:[{t:'Goodbye & Good Riddance',y:2018,b:250,p:1,tr:[['All Girls Are the Same',900],['Lucid Dreams',2700],['Lean wit Me',600],['Armed and Dangerous',600],['Wasted',300],'Hurt Me','Candles','Scared of Love']}]},
{n:'XXXTENTACION',g:'US',ini:'XXX',al:[{t:'?',y:2018,b:300,p:1,tr:[['SAD!',2000],['Moonlight',1800],['changes',1500]]}],sg:[['Jocelyn Flores',1500,2017]]},
{n:'50 Cent',g:'US',ini:'50',al:[{t:"Get Rich or Die Tryin'",y:2003,b:150,tr:['What Up Gangsta','Patiently Waiting',['Many Men (Wish Death)',700],['In da Club',1600],'High All the Time','Heat',"If I Can't",'Blood Hound','Back Down',['P.I.M.P.',400],'Like My Style','Poor Lil Rich',['21 Questions',600],"Don't Push Me",'Gotta Make It to Heaven']}]},
{n:'Nas',g:'US',al:[{t:'Illmatic',y:1994,b:60,tr:['The Genesis',['N.Y. State of Mind',null],["Life's a Bitch",120],['The World Is Yours',150],'Halftime',"Memory Lane (Sittin' in da Park)",'One Love','One Time 4 Your Mind','Represent',["It Ain't Hard to Tell",100]]}]},
{n:'2Pac',g:'US',ini:'2PAC',al:[{t:'All Eyez on Me',y:1996,b:120,p:1,tr:[['California Love',null],['Ambitionz Az a Ridah',400],['How Do U Want It',250],['2 of Amerikaz Most Wanted',200]]}],sg:[['Changes',600,1998]]},
{n:'The Notorious B.I.G.',g:'US',ini:'BIG',al:[{t:'Ready to Die',y:1994,b:80,tr:['Things Done Changed','Gimme the Loot','Machine Gun Funk','Warning','Ready to Die',['One More Chance',150],'The What',['Juicy',null],'Everyday Struggle',['Big Poppa',500],'Respect','Friend of Mine','Unbelievable','Suicidal Thoughts']}],sg:[['Hypnotize',600,1997]]},
{n:'Dr. Dre',g:'US',ini:'DRE',al:[{t:'2001',y:1999,b:150,p:1,tr:['The Watcher',['Still D.R.E.',null],"Big Ego's",['Xxplosive',150],["What's the Difference",300],'Light Speed',['Forgot About Dre',600],['The Next Episode',1500]]}]},
{n:'Snoop Dogg',g:'US',al:[{t:'Doggystyle',y:1993,b:80,p:1,tr:[['Gin and Juice',null],["Who Am I? (What's My Name?)",200],'Lodi Dodi','Murder Was the Case','Doggy Dogg World']}]},
/* ---------- RAP UK ---------- */
{n:'Dave',g:'UK',al:[{t:'Psychodrama',y:2019,b:40,tr:['Psycho','Streatham',['Black',120],'Purple Heart',['Location',400],'Disaster','Screwface Capital','Environment','Lesley','Drama']}]},
{n:'Stormzy',g:'UK',al:[{t:'Gang Signs & Prayer',y:2017,b:40,tr:['First Things First','Cold','Bad Boys',['Big for Your Boots',150],['Blinded by Your Grace, Pt. 2',200],'Velvet','Return of the Rucksack','21 Gun Salute','Mr Skeng',"Don't Cry for Me",'Cigarettes & Cush','Lay Me Bare','100 Bags']}],sg:[['Vossi Bop',300,2019],['Shut Up',200,2015]]},
{n:'Skepta',g:'UK',al:[{t:'Konnichiwa',y:2016,b:25,tr:['Konnichiwa','Lyrics','Corn on the Curb','Crime Riddim',"It Ain't Safe",['Shutdown',120],['Man',80],'Numbers','Ladies Hit Squad','Text Me Back',["That's Not Me",60],'Detox']}]},
{n:'Central Cee',g:'UK',ini:'CC',sg:[['Doja',900,2022],['Sprinter',800,2023],['Band4Band',500,2024],['Commitment Issues',200,2022]]},
];
const RAR=[
 {k:'commun',n:'Commun',min:0,drop:40,dup:10,c:'#aab3bd',d:'Moins de 50 M',v:20},
 {k:'rare',n:'Rare',min:50,drop:30,dup:20,c:'#5aa9ff',d:'50 à 200 M',v:45},
 {k:'ultra',n:'Ultra rare',min:200,drop:17,dup:40,c:'#c27dff',d:'200 à 500 M',v:100},
 {k:'legendaire',n:'Légendaire',min:500,drop:8,dup:80,c:'#ffc23d',d:'500 M à 1 Md',v:220},
 {k:'mythique',n:'Mythique',min:1000,drop:4,dup:150,c:'#ff5f86',d:'Plus d’1 Md',v:480},
 {k:'divin',n:'Divin',min:Infinity,drop:1,dup:300,c:'#f3e3b5',d:'Classiques fondateurs',v:1000},
];
const GEN={FR:'Rap FR',US:'Rap US',UK:'Rap UK'};
const GW={FR:1.6,US:1,UK:1};
const UND=['So La Lune','Jeune Morty','Jolagreen23','La Fève','8ruki','Yvnnis','Kerchak','Rounhaa','Luv Resval','Prince Waly','H JeuneCrack'];
const EVENTS=[
 {n:'Nuit Underground',s:'2026-10-10T18:00',e:'2026-10-14T23:59',d:'Rappeurs underground ×4',fx:{artists:UND,mult:4},bg:'linear-gradient(135deg,#6b2bd9,#d6336c)'},
 {n:'Âge d’or',s:'2026-10-17T00:00',e:'2026-10-19T23:59',d:'Chance Divine ×2',fx:{divin:2},bg:'linear-gradient(135deg,#a87a22,#f3e3b5)'},
 {n:'Drill Session',s:'2026-10-24T00:00',e:'2026-10-26T23:59',d:'Gazo, Tiakola, SDM, Kerchak ×4',fx:{artists:['Gazo','Tiakola','SDM','Kerchak'],mult:4},bg:'linear-gradient(135deg,#1c4fa3,#20c997)'},
 {n:'Halloween',s:'2026-10-30T00:00',e:'2026-11-02T23:59',d:'Maxis à 50 jetons',fx:{cost:50},bg:'linear-gradient(135deg,#1a0f05,#f59f00)'},
 {n:'UK Night',s:'2026-11-07T00:00',e:'2026-11-09T23:59',d:'Rap UK ×3',fx:{genre:'UK',mult:3},bg:'linear-gradient(135deg,#0b1d4a,#c92a2a)'},
 {n:'Nuit US',s:'2026-11-14T00:00',e:'2026-11-16T23:59',d:'Rap US ×3',fx:{genre:'US',mult:3},bg:'linear-gradient(135deg,#c92a2a,#1c4fa3)'},
];
