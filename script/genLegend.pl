
sub couleurcalculee	
	{
	local ($x)=@_;
	next if $x <0;
	my $pythaglocal=0;
	print "\n aie $x supérieur à 1 \n" if $x > 1;
	next if $x >1;
    print("$x: ");
	foreach $u (0..$#couleurdepart)
		{
		$couleurinterm[$u]=sprintf("%.0f",($x*($couleurfin[$u]) + (1-$x)* $couleurdepart[$u]));	
		$pythaglocal+=$couleurinterm[$u]*$couleurinterm[$u];
        print("$couleurinterm[$u] ");
		}
        print(" ====== ");
	$pythaginterpole=($x*$pythagfin)+(1-$x)*$pythagdep;
    print("$pythaginterpole ");
	$coeffcouleur= sqrt($pythaginterpole/$pythaglocal),"\n"; #coeff mult
    print("$coeffcouleur ");
	foreach $u (0..$#couleurdepart)
		{
		$couleurinterm[$u]=sprintf("%.0f",($x*($couleurfin[$u]*$coeffcouleur) + (1-$x)* $couleurdepart[$u]*$coeffcouleur));	
		}
    print("\n");
	return @couleurinterm;	
	}

sub caissonsimple
	{
	local ($posx,$posy,$couleur,$valgauche)=@_;	
	local ($bas, $haut1, $haut2, $posdroite);
	local ($departhoriztextebas, $departhvertitextebas);
	local ($departhoriztextehaut, $departhvertitextehaut,$taillepoloce);
	$taillepoloce=($taillepolice)."px"; #Ajout px
	$bas=$posy+$hauteurC;
	$toutbas=$posy+$hauteurC/2;
	$haut1=$posy-$hauteurC;
	$departhoriztextebas=$posx-3.5*$taillepolice;
	$departhvertitextebas=$toutbas;
		
	$descriptif="<rect x=\"$posx\" y=\"$posy\" width=\"$largeurC\" height=\"$hauteurC\" stroke-width=\"0\" stroke=\"rgb($couleur)\" fill=\"rgb($couleur)\" opacity=\"$opacite\"/>
<text x=\"$departhoriztextebas\" y=\"$departhvertitextebas\" style=\"font-size:$taillepoloce\" >$valgauche<\/text>
";
#<text x=\"$departhoriztextehaut\" y=\"$departhvertitextehaut\" style=\"font-size:$taillepoloce\" >$valdroite<\/text>
	}

sub fonction{
	local ($entree)=@_;	
	$f=$entree; # *sqrt($entree);
	return $f}

#Paramètres
@couleurdepart= (138, 197, 0); #(37, 253, 133);  #(20,230,30); #RVB  (116, 255, 255); #(50,100,255);

#test
@couleurfin=(255, 0, 0); #AB: (117, 226, 118); #  (94, 237, 124)

foreach $u (0..$#couleurdepart)
		{
		$pythagdep+=$couleurdepart[$u]*$couleurdepart[$u];
		$pythagfin+=$couleurfin[$u]*$couleurfin[$u];
		}
#Début légende caissons
$nbboites=20; #nécessairement beaucoup (continuité)
$hauteurC=5; #hauteur caisson
$largeurC=8;
$taillepolice=3;
$opacite=.7;

$maxvaleur = 2.5;
$minvaleur = 0;

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

open (DD,">LegendeSVG");

print DD $sommecaissons;

close (DD);