require "/home/guichard/Covid/toutesRoutinesCovid.pl";
require "/home/guichard/Covid/Monde-fixe-R/pgm1-anim.pl";

#Reprise de evol* du dossier Deces
#Potentiellement utilisable pour faire des cartes fixes avec des données type
#FRA,29813
#GUF,16

#1. J'ai un fond: tmpbasemondeclean.svg
# Ma référence: nomenclatures-pays-EG
#2. J'ai des données: accroist-deces-sur-pop.txt

#Paramètres
@couleurdepart= (37, 255, 133); #(37, 253, 133);  #(20,230,30); #RVB  (116, 255, 255); #(50,100,255);

#test
@couleurdepart=(148, 207, 80); #AB: (117, 226, 118); #  (94, 237, 124)
#

@couleurfin= (255, 0, 0); # jaune: (255, 221, 34); (238, 136, 0)
$gris="rgb(220, 220, 220)";
$deltajour=7 ;
$numerojourdepart=1; # commence à 1: 0="dateen"

$inversedelai=5 ;
$inversedelai=$inversedelai*$deltajour; # pour test: plus vite, éventuellement multiplié par deltajour

$maxdonnees=2; #Ici R(t)  #Seuil supérieur des données (30 pour morts/pop)
#NON!!! $maxdonnees=$deltajour*$maxdonnees; #Augment du seuil si deltajour >1
$mindonnees=0; #Cf RO
$evolutiondanstitre="Evolution every  $deltajour days.";
$evolutiondanstitre="Evolution every day." if $deltajour==1;
@titre=('Value of R(t)' ,$evolutiondanstitre, ' ','Click on a','chosen country,','to obtain figures.');

@titre2=('Dates :  DATESACHANGER','Model and data:','Patrice Abry + team SISyPhe (Ens de Lyon)','+ some people of IXXI.',
'Cartography: Éric Guichard (Triangle + IXXI), July-October 2020');

#Fin paramètres
foreach $u (0..$#couleurdepart)
		{
		$pythagdep+=$couleurdepart[$u]*$couleurdepart[$u];
		$pythagfin+=$couleurfin[$u]*$couleurfin[$u];
		}
$minvaleur=1000000000000;
$maxvaleur=-1000000000000;

#SPÉCIAL !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
#Info que l'on désire en 2e ligne de la carte
open (D, "/home/guichard/Covid/Monde-fixe-R/Infos-anim"); 
while(<D>)
	{
	chop;
	next if $.<2;
	@ligne=split("\t");
	$abrev= $ligne[0];
	$infoR{$abrev}="Rmax: $ligne[1]; last R: $ligne[$#ligne]";
	}
close (D);
#Fin Info que l'on désire en 2e ligne de la carte

open (N,"/home/guichard/Covid/nomenclatures-pays-EG");
while (<N>)
	{
	chop;
	next if $.==1;
	($abrev,$paysclair,$pop,@rien)=split(";");
	$abreviation{$paysclair}=$abrev;
	$paysdetail{$abrev}=$paysclair;
	$popul{$abrev}=$pop;
	}
close (N);

#Fichier données temporelles
$methode="accrjourpop";
$fichieraouvrir="/home/guichard/Covid/Monde-fixe-R/donnees-temporelles-anim-abry";
open (A,$fichieraouvrir);
while (<A>)
	{
	chop;
	@donnees=split(/,/);
	$dernierecolonneenperl= $#donnees;
	if ($.==1)
		{
		@dates=@donnees; # début $dates[1];
		next;
		}
	if ($.==2)
		{
		@datesfr=@donnees; # début $dates[1];
		next;
		}	
	$paysdonnees=$donnees[0]; #En 3 lettres	
	$memopayspourdonnees{$paysdonnees}++;
	foreach $i ($numerojourdepart..$dernierecolonneenperl) # 1..
		{
#Exceptionnel
$donnees[$i]=$mindonnees if $donnees[$i]<$mindonnees;	
$donnees[$i]=$maxdonnees if $donnees[$i]>$maxdonnees;	
		
		$valeur{$paysdonnees,$i}=($donnees[$i]); #sqrt?
		$minvaleur=$valeur{$paysdonnees,$i} if $valeur{$paysdonnees,$i} <=$minvaleur;
		$maxvaleur=$valeur{$paysdonnees,$i} if $valeur{$paysdonnees,$i} >=$maxvaleur;	
		}
	}
close (A);

$maxvaleur=sprintf("%.2f",$maxvaleur);

#Début légende caissons
$nbboites=20; #nécessairement beaucoup (continuité)
$hauteurC=5; #hauteur caisson
$largeurC=8;
$taillepolice=3;
$opacite=.7;

#Début date
$dureedate=sprintf("%.2f",(.9*$deltajour)/$inversedelai);
foreach $j  ($numerojourdepart..$dernierecolonneenperl-$deltajour)
	{
        #date
        next if $j % $deltajour !=0;
        $jlimite=$j;
	$k=sprintf("%.2f",0.5 + (($j-$numerojourdepart)/$inversedelai));
        $affichedate.="<text x=\"60\" y=\"150\" style=\"font-size:6px; font-family:Helvetica\"  opacity=\"0\"> $dates[$j] | $datesfr[$j] <animate attributeName=\"opacity\" from=\"1\" to=\"0\"   begin=\"".$k."s\" dur=\"".$dureedate."s\" \/>\n <\/text>
";		
	}

$k=sprintf("%.2f",0.5 + (($dernierecolonneenperl-$numerojourdepart)/$inversedelai));
		
$numdernieredate=$dernierecolonneenperl if $dernierecolonneenperl % $deltajour==0;
$numdernieredate= $jlimite+$deltajour if $dernierecolonneenperl % $deltajour!=0;			
$affichedate.="<text x=\"60\" y=\"150\" style=\"font-size:6px; font-family:Helvetica\"  opacity=\"0\"> $dates[$numdernieredate] | 
$datesfr[$numdernieredate]
 <animate attributeName=\"opacity\" from=\"0\" to=\"1\"   begin=\"".$k."s\" dur=\"0\.2s\" fill=\"freeze\"  \/>\n <\/text>
";      			
#fin date	
			
$abscissecaissons=32;
$ordonneecaissonbas=200;
$sommecaissons="\n<g id =\"caissons\">\n";
foreach $i (0..$nbboites-1) #11
	{
	$seuilboite=sprintf("%.2f",$minvaleur+ ($i * (($maxvaleur-$minvaleur)/$nbboites)));
	$seuilboitelegende=sprintf("%.2f",$seuilboite+ ($maxvaleur-$minvaleur)/(2 * $nbboites));	
#	print "i vaut $i seuilboite vaut $seuilboite seuilboitelegende vaut $seuilboitelegende\n";
	$lambdoboite= ($i/$nbboites);
	$couleurboite=join(", ",couleurcalculee(fonction($lambdoboite))) ;
#	print $i," ",$seuilboite," ", $couleurboite,"\n";
	$posymob=$ordonneecaissonbas- $hauteurC*$i;
$sommecaissons.=caissonsimple($abscissecaissons, $posymob,$couleurboite,$seuilboitelegende);
	}	
	
$posydebut=$ordonneecaissonbas- ($nbboites)* $hauteurC; #Max
$posyfinal=$ordonneecaissonbas + (2.5)*$hauteurC;
$sommecaissons.="<text x=\"$abscissecaissons\" y=\"$posyfinal\" style=\"font-size:4px;  font-family:Helvetica\" >Min= $minvaleur<\/text>\n";
$sommecaissons.="<text x=\"$abscissecaissons\" y=\"$posydebut\" style=\"font-size:4px; font-family:Helvetica\" >Max chosen= $maxvaleur<\/text>\n";

$posydebutlegende=$posydebut-12;
$posysuitelegende=$posydebut-8;

$sommecaissons.="<text x=\"$abscissecaissons\" y=\"$posydebutlegende\"  style=\"font-size:4px; font-family:Helvetica\" >$titre[0]<\/text>";
#\n"."<text x=\"$abscissecaissons\" y=\"$posysuitelegende\"  style=\"font-size:3px; font-family:Helvetica\" >par million d’hab. et jour<\/text>"; #changer

$sommecaissons.= $affichedate."\n<\/g>\n";
#Fin légende caissons

foreach $d  (sort keys %memopayspourdonnees)
	{
	foreach $j  ($numerojourdepart..$dernierecolonneenperl)
		{	
		#next if $j % $deltajour !=0; ici a priori inutile
		$lambda= sprintf("%.2f",($valeur{$d,$j}-$minvaleur)/($maxvaleur-$minvaleur));
		$color{$d,$j}="rgb\(".join(", ",couleurcalculee($lambda))."\)" ;
		} #	sleep 2;	$abreviation
	}	
 
$xtitre=150;
$ytitre=90;
$interligne=4.5;
$xtitre2=152;
$ytitre2=191;

$titresvg="<text x=\"315\" y=\"20\" style=\"font-size:6px; font-family:Helvetica\"  opacity=\"1\"> Covid-19. Animated map <\/text>
<text x=\"315\" y=\"26\" style=\"font-size:6px; font-family:Helvetica\"  opacity=\"1\"> World modelized R(t)<\/text>
<a xlink:href=\"infoscartes.html\"> <text x=\"270\" y=\"160\" style=\"font-size:4px; font-family:Helvetica\" fill=\"orange\" >
Sources : click here</text></a>
\n";

foreach $u (0..$#titre)
	{
	$ytitre+=$interligne;
	
	$titresvg.="<text x=\"$xtitre\" y=\"$ytitre\" style=\"font-size:4px; font-family:Helvetica\" fill=\"blue\" opacity=\"1\"> $titre[$u]<\/text>\n";
	}
	$titresvg= "<g id=\"titre\"> ".$titresvg."<\/g>\n";
#print $datesfr[$numerojourdepart],"\n";
foreach $u (0..$#titre2)
	{
	$titre2[$u]=~s/DATESACHANGER/from $dates[$numerojourdepart] till $dates[$dernierecolonneenperl]/;
	$ytitre2+=$interligne;
	
	$titresvg.="<text x=\"$xtitre2\" y=\"$ytitre2\" style=\"font-size:3px; font-family:Helvetica\"  opacity=\"1\"> $titre2[$u]<\/text>\n";
	}
#fin Spécial titre

open (F, "/home/guichard/Covid/Monde-fixe-R/tmpbasemondeclean.svg");
$sommecaissons.= legendecercles(); #.toustriangles("/home/guichard/Covid/Deces/donnees-temporelles-pour-animtotalmortspop").legendetriangles();

$ficweb="/var/www/html/coronavirus/cartes/R-Monde-carte-animee-du-jour-1Jsur".$deltajour."-".$inversedelai."JParSec.svg";
open (G,">$ficweb");
while (<F>)
	{
	s/<!-- ZONE2POURINSERTION -->/$titresvg\n$sommecaissons\n/;
	if (/<path id="([A-Z]+)-\d+" /) #  fill="rgb(255, 255, 255)" 
		{
		$monpayscourt= $1;
		$lignecourante=	$_;
		$svg=$anim="";
#	ICI COMPLIQUÉ... ###

		foreach $j  ($numerojourdepart..$dernierecolonneenperl-$deltajour)
			{
                        next if $j % $deltajour !=0; 			        	
#			print "ICI $j $monpayscourt ",$valeur{$monpayscourt,$j},"\n" if ($monpayscourt eq "PER"); # && $valeur{$monpayscourt,$j}>10);

			$colorto= $color{$monpayscourt,$j+$deltajour};


$distcouleurtmp=distancecouleursrgb($colorto,$color{$monpayscourt,$j});

#			next if (($colorto eq $color{$monpayscourt,$j}) && ($j>$numerojourdepart+$deltajour));
                        next if (($distcouleurtmp <10) && ($j>$numerojourdepart+$deltajour));
			$k=sprintf("%.2f",0.5 + (($j-$numerojourdepart)/$inversedelai));
			$anim.="\/\/ Ci dessous la date $datesfr[$j] vers la suivante\n"."<animate attributeName=\"fill\" \n from=\"".$color{$monpayscourt,$j}."\" to=\"".$colorto."\" begin=\"".$k."s\" dur=\"0\.1s\" fill=\"freeze\"  \/> \n";
			}
		$_=$lignecourante.$anim; #."<\/path>\n" ;
		print G;
		}
	elsif (/<g id ="([A-Z]+)-TT"> <text /) #(/<path id="([A-Z]+)-\d+" /)
		{
		$paysinfo=$1;	
		 
		if (! defined $totalmorts{$paysinfo})
			{
			$ratiomortspc=$ratiomorts="?";
			$nombre="???"
			}
		else
			{
			$nombre=parmilliers($totalmorts{$paysinfo});
			$ratiomorts=sprintf("%.0f",1000000*$totalmorts{$paysinfo}/$popul{$paysinfo})." p. million";	
			$ratiomortspc=sprintf("%.3f",100*$totalmorts{$paysinfo}/$popul{$paysinfo})." \%";
			}
		s/REMPLIRXXDP/$infoR{$paysinfo}/; #Total morts: $nombre/; # ($ratiomorts)/;
                s/REMPLIR2XXDP/Soit $ratiomortspc ($ratiomorts)/;		                
		print G;
		}	
	else
 		{
		print G;
		}
	}
close (F);	close (G);

__END__

