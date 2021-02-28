require "/home/guichard/Covid/toutesRoutinesCovid.pl";

$nbjouretudies=200; # le 10 oct: Sahara occ: 48 nan si départ à 200, Lesotho=60, Yakikistan=47, Yemen=25

#dates
open (D,"/home/guichard/Covid/datesjusque2030full");
while(<D>)
        {
        chop;
        ($num,$dateenlong,$dateenbref,$datefr,$datefrMJ)=split("\t");
        @dateabry=split(" ",$dateenlong);
        $vraiedateabry=$dateabry[1]."-".$dateabry[2]."-".$dateabry[3];
        
        $numdate{$vraiedateabry}=$num;
        $numdatefr{$datefr}=$num;
        $dateendunum{$num}=$dateenbref;
        $dateenabrydunum{$num}=$vraiedateabry;
        $datefrdunum{$num}=$datefr;
        }
close(D);

#fin dates
open (N,"/home/guichard/Covid/nomenclatures-pays-EG");
while (<N>) #abrevgeo;geoclair;popul 2005
	{chop;
	next if $.==1;
	@paysn=split (";");
	$nomsvg{$paysn[0]}= $paysn[1]; #nom du pays en clair:$nomsvg{FRA}
	$pays3lettres{$paysn[1]}=$paysn[0];
	$pop{$paysn[1]}=$pop3lettres{$paysn[0]}=$paysn[2];
	$rayon{$paysn[0]}=sprintf("%.0f",sqrt($paysn[2]/10000000)); # 10 millions	
	push (@rayonlegende,$rayon{$paysn[0]});
	push (@poplegende,$paysn[2]);
	}
close (N);

#Intro pour wget 
$dateen=`date -R`;
chop ($dateen);
@datepourpatrice=split ("[ ,]+",$dateen);
$dateimpr=$extension=$datepourpatrice[1]."-".$datepourpatrice[2]."-".$datepourpatrice[3];

###SPECIAL
$dateimpr=$extension="09-Oct-2020";
### Fin spécial

$ficmondeanim="DataCountries".$extension;
$donneesmondeanim="https://perso.ens-lyon.fr/patrice.abry/DataCountries".$extension;
$numdatefinaleanim=$numdate{$dateimpr};

#print "Num date du jour: ", $numdatefinaleanim,"\n";
#__END__
#### ATTENTION: retrouver le jour de départ pour l'anim

chdir "/home/guichard/Covid/Monde-fixe-R";
system ("mv DataCountries*  archives; wget $donneesmondeanim");

#$ficmondefixe="/home/guichard/Covid/Monde-fixe-R/archives/DataCountriesLast09-Oct-2020";

open (A,"$ficmondeanim");

$minrencontre=100000; #absolu
$maxrencontre=-100000;
$maxdonnees=2; # Choisi
$mindonnees=0; #Cf RO

while (<A>)
	{
	chop;
	s/\_/ /g;
	next if /conveyance/;
	s/Brunei Darussalam/Brunei/;
	s/Cote dIvoire/Cote d\'Ivoire/;
	s/Guinea Bissau/Guinea-Bissau/;
	s/Holy See/Vatican/;
	s/Myanmar/Burma/;
	s/South Korea/Korea-South/;
	s/Turks and Caicos islands/Turks and Caicos Islands/;
	s/Timor Leste/Timor-Leste/;
	s/United Republic of Tanzania/Tanzania/;
	s/United States of America/United States/;
	($nompays,@rpays)=split(",");

	foreach $u (0..$#rpays)
	        {
	        $rpays[$u]=0 if lc($rpays[$u]) =~/nan/;
	        $rpays[$u]+=0; $rpays[$u]=0 if $rpays[$u] <0;
	        $minrencontre=$rpays[$u] if $minrencontre>=$rpays[$u];
                $maxrencontre=$rpays[$u] if $maxrencontre <=$rpays[$u];
                $rpays[$u]=$maxdonnees if  $maxdonnees <=$rpays[$u];    
	        $rpays[$u]=$mindonnees if $rpays[$u] <=$mindonnees;
	        next if ! defined $pays3lettres{$nompays};
	        $memopaysabry{$pays3lettres{$nompays}}++;
	        $v=$numdatefinaleanim-$nbjouretudies +$u;

	        $rpays3lettresETnumjour{$pays3lettres{$nompays},$v}=sprintf("%.2f",$rpays[$u]);	        
	        }
	}
close (A);

#Fabrication données
open (DD,">/home/guichard/Covid/Monde-fixe-R/donnees-temporelles-anim-abry");
print DD "date";
open (I,">/home/guichard/Covid/Monde-fixe-R/Infos-anim");
print I join("\t",pays,Rmax,DernierR),"\n";

foreach $u ($numdatefinaleanim-$nbjouretudies+1..$numdatefinaleanim)
        {
        $dateencorrigee=$dateendunum{$u};
        $dateencorrigee=~s/-/\//g;
        print DD ",",$dateencorrigee;
        }
        print DD "\ndatefr";
foreach $u ($numdatefinaleanim-$nbjouretudies+1..$numdatefinaleanim)
        {
        print DD ",",$datefrdunum{$u};
        }
print DD "\n";        

foreach $p (sort keys %memopaysabry)
        {
        print DD $p;
        $rmax{$p}=0;
        foreach $u ($numdatefinaleanim-$nbjouretudies+1..$numdatefinaleanim)
                {
                $rmax{$p}=$rpays3lettresETnumjour{$p,$u} if $rmax{$p} <$rpays3lettresETnumjour{$p,$u};
                print DD ',',$rpays3lettresETnumjour{$p,$u}; 
                $dernierR{$p}=$rpays3lettresETnumjour{$p,$u};
                }
        print DD "\n";        
        print I join("\t",$p,$rmax{$p},$dernierR{$p}),"\n";
        }
close (DD);
close (I);

#__END__
#Fin Fabrication données
#Couleurs
@couleurdepart=(138, 197, 0); #AB: (117, 226, 118); #  (94, 237, 124)
@couleurfin= (255, 0, 0); # jaune: (255, 221, 34); (238, 136, 0)
$gris="rgb(220, 220, 220)";

foreach $u (0..$#couleurdepart)
		{
		$pythagdep+=$couleurdepart[$u]*$couleurdepart[$u];
		$pythagfin+=$couleurfin[$u]*$couleurfin[$u];
		}
		
foreach $d  (sort keys %r3lettres)
	{	
		$lambda= sprintf("%.2f",($r3lettres{$d}-$mindonnees)/($maxdonnees-$mindonnees));
		$color{$d}="rgb\(".join(", ",couleurcalculee($lambda))."\)" ;
	} 		
#fin couleurs

#titres
@titre=('Covid-19','World modelized R(t)');
@titre2=('Model and data:','Patrice Abry + team SISyPhe (Ens de Lyon)','Cartography:','Éric Guichard (Triangle + IXXI)');
@titre3=('Click on a', 'chosen country', 'to obtain figures.','', 'With some browsers','you also can','zoom on the map.');
@titre4=('Date: ',$dateimpr);
$titresvg1=printliste(330,20,6,'Helvetica',blue,1,@titre).printliste(154,195,4,'Helvetica',black,1,@titre2).printliste(150,90,4,'Serif',blue,1,@titre3).printliste(70,150,6,'Helvetica',black,1,@titre4);

#Fin titres

#Début légende caissons
$nbboites=20; #nécessairement beaucoup (continuité)
$hauteurC=5; #hauteur caisson
$largeurC=8;
$taillepolice=3;
$opacite=.7;
$abscissecaissons=32;
$ordonneecaissonbas=200;
$sommecaissons="\n<g id =\"caissons\">\n";
foreach $i (0..$nbboites-1) #11
	{
	$seuilboite=sprintf("%.2f",$minrencontre+ ($i * (($maxdonnees-$mindonnees)/$nbboites)));
	$seuilboitelegende=sprintf("%.2f",$seuilboite+ ($maxdonnees-$mindonnees)/(2 * $nbboites));	
	$lambdoboite= ($i/$nbboites);
	$couleurboite=join(", ",couleurcalculee(fonction($lambdoboite))) ;
#	print $i," ",$seuilboite," ", $couleurboite,"\n";
	$posymob=$ordonneecaissonbas- $hauteurC*$i;
$sommecaissons.=caissonsimple($abscissecaissons, $posymob,$couleurboite,$seuilboitelegende);
	}	
	
$posydebut=$ordonneecaissonbas- ($nbboites)* $hauteurC; #Max
$posyfinal=$ordonneecaissonbas + (2.5)*$hauteurC;
$sommecaissons.="<text x=\"$abscissecaissons\" y=\"$posyfinal\" style=\"font-size:4px;  font-family:Helvetica\" >Min= $mindonnees<\/text>\n";
$sommecaissons.="<text x=\"$abscissecaissons\" y=\"$posydebut\" style=\"font-size:4px; font-family:Helvetica\" >Max chosen= $maxdonnees<\/text>\n";

$posydebutlegende=$posydebut-10;
$posysuitelegende=$posydebut-8;

$sommecaissons.="<text x=\"$abscissecaissons\" y=\"$posydebutlegende\"  style=\"font-size:5px; font-family:Helvetica\" >Modelized R(t)<\/text>\n";
$sommecaissons.= "\n<\/g>\n".legendecercles()."\n".$titresvg1;
#Fin légende caissons

open (C,"/home/guichard/Covid/Monde-fixe-R/tmpbasemondeclean.svg");
open (D,">/var/www/html/coronavirus/cartes/R-Covid-19-anim-World.svg");

while (<C>) 
	{
	s/(<!-- ZONE2POURINSERTION -->)/$sommecaissons\n$1/;
#rgb(255, 255, 200)


	if (/<path id="([A-Z]+)([-\d+])*"/) 
		{
		$pays= $1;
#		print $pays,"\n";
		$sacouleur="fill=\"".$color{$pays}."\"";
		s/fill=\"rgb\(255, 255, 200\)\"/$sacouleur/ if defined $color{$pays};
		print D; 
		}
		
	 elsif (/<g id ="([A-Z]+)-TT"> <text /) #(/<path id="([A-Z]+)-\d+" /)
                {
                $paysinfo=$1;   
                 
                if (! defined $r3lettres{$paysinfo})
                        {
                        $ratio="?";
                        }
                else
                        {
                        $ratio=$r3lettres{$paysinfo};
                        }  
                 $ratio="R of the day / du jour: ".$ratio;                                   
                s/REMPLIRXXDP/$ratio/;
                print D;
                }       
	else {print D};
	}
close (C); close (D);

__END__


