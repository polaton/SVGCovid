$nbjouretudies=295; # le 10 oct: Sahara occ: 48 nan si départ à 200, Lesotho=60, Yakikistan=47, Yemen=25
# 295 @ 22
#dates
open (D,"datesjusque2030full");
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
open (N,"nomenclatures-pays-EG");
while (<N>) #abrevgeo;geoclair;popul 2005
	{chop;
	next if $.==1;
	@paysn=split(";");

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
$dateimpr=$extension="22-Nov-2020";
### Fin spécial

# $ficmondeanim="DataCountries".$extension;
# $donneesmondeanim="https://perso.ens-lyon.fr/patrice.abry/DataCountries".$extension;
$numdatefinaleanim=$numdate{$dateimpr};

#print "Num date du jour: ", $numdatefinaleanim,"\n";
#__END__
#### ATTENTION: retrouver le jour de départ pour l'anim

# chdir "/home/guichard/Covid/Monde-fixe-R";
# system ("mv DataCountries*  archives; wget $donneesmondeanim");

#$ficmondefixe="/home/guichard/Covid/Monde-fixe-R/archives/DataCountriesLast09-Oct-2020";


############DONNEES DE BASE###################################
$maxdonnees=2.5; # Choisi
$mindonnees=0; #Cf RO

open (A,"DataCountries22-Nov-2020");
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
	$memopaysabry{$pays3lettres{$nompays}} = 0;
	foreach $u (0..$#rpays)
	        {
	        $rpays[$u]=-1 if lc($rpays[$u]) =~/nan/;
	        $rpays[$u]+=0; $rpays[$u]=0 if $rpays[$u] <0 && $rpays[$u] != -1;
			$rpays[$u]=$maxdonnees if  $maxdonnees <=$rpays[$u];
	        $rpays[$u]=$mindonnees if $rpays[$u] <=$mindonnees && $rpays[$u] != -1;
	        next if ! defined $pays3lettres{$nompays};
	        $memopaysabry{$pays3lettres{$nompays}}++;
			
	        $v=$numdatefinaleanim-$nbjouretudies +$u;
	        $rpays3lettresETnumjour{$pays3lettres{$nompays},$v}=sprintf("%.2f",$rpays[$u]);	        
	        }
	}
close (A);

#Fabrication données
open (DD,">RStandard");
print DD "date";

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
		next if length($p) == 0;
        print DD $p;
        foreach $u ($numdatefinaleanim-$nbjouretudies+1..$numdatefinaleanim)
                {
                print DD ',',$rpays3lettresETnumjour{$p,$u}; 
                }
        print DD "\n";        
        }
close (DD);

open (A,"DataCountriesFast22-Nov-2020");
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
	$memopaysabry{$pays3lettres{$nompays}} = 0;
	foreach $u (0..$#rpays)
	        {
	        $rpays[$u]=-1 if lc($rpays[$u]) =~/nan/;
	        $rpays[$u]+=0; $rpays[$u]=0 if $rpays[$u] <0 && $rpays[$u] != -1;
			$rpays[$u]=$maxdonnees if  $maxdonnees <=$rpays[$u];    
	        $rpays[$u]=$mindonnees if $rpays[$u] <=$mindonnees && $rpays[$u] != -1;
	        next if ! defined $pays3lettres{$nompays};
	        $memopaysabry{$pays3lettres{$nompays}}++;
			
	        $v=$numdatefinaleanim-$nbjouretudies +$u;
	        $rpays3lettresETnumjour{$pays3lettres{$nompays},$v}=sprintf("%.2f",$rpays[$u]);	        
	        }
	}
close (A);

#Fabrication données
open (DD,">RFast");
print DD "date";

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
		next if length($p) == 0;
        print DD $p;
        foreach $u ($numdatefinaleanim-$nbjouretudies+1..$numdatefinaleanim)
                {
                print DD ',',$rpays3lettresETnumjour{$p,$u}; 
                }
        print DD "\n";        
        }
close (DD);

open (A,"DataCountriesNouvellesInfections22-Nov-2020");
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
	$memopaysabry{$pays3lettres{$nompays}} = 0;
	foreach $u (0..$#rpays)
	        {
	        $rpays[$u]=-1 if lc($rpays[$u]) =~/nan/;
	        $rpays[$u]+=0; $rpays[$u]=0 if $rpays[$u] <0;
	        next if ! defined $pays3lettres{$nompays};
	        $memopaysabry{$pays3lettres{$nompays}}++;
	        $v=$numdatefinaleanim-$nbjouretudies +$u;
	        $rpays3lettresETnumjour{$pays3lettres{$nompays},$v}=sprintf("%.2f",$rpays[$u]);	        
	        }
	}
close (A);

#Fabrication données
open (DD,">NCas");
print DD "date";

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
		next if length($p) == 0;
		print DD $p;
        foreach $u ($numdatefinaleanim-$nbjouretudies+1..$numdatefinaleanim)
                {
                print DD ',',$rpays3lettresETnumjour{$p,$u}; 
                }
        print DD "\n";        
        }
close (DD);

__END__
