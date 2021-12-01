#TOUTES ROUTINES

sub placementtextesurf{
	local ($ident,$tx,$ty,$taillepolice,$typepolice,@texte)=@_;
	my ($textesouris, $ty2, $iter,$interligne);
	$interligne=$taillepolice*(1.15);
	$ty2=$ty;
	$textesouris="<g id =\"".$ident."-TT\"> ";

	foreach $iter (0..$#texte)
		{
		$ty2+=$interligne if $iter>0;
		$textesouris.="<text x=\"".$tx."\" y=\"".$ty2."\" style=\"font-size:".$taillepolice."px; font-family:$typepolice\">".$texte[$iter]."<\/text>\n";
		}
	$textesouris.="<\/g>\n";	
	return 	$textesouris;	
}	

sub addplotidx	{ #Pour une liste standard: pas de seuil
(my @liste)=@_;
my $u=0; my $plot="";
my $longueurdate=$#datefrance - $debut;
foreach $d ($debut..$#datefrance)
	{	
	$plot.="\(".$d.",".$liste[$u]."\) ";
	$u++;
	}
	$plot=" coordinates {".$plot."};";
	return $plot;
	}

sub addplotseuilauto	{ #Pour une liste de lg variable: pas de date, mais des morts
local ($methodeparam, @liste)=@_;
my $u=0; my $plot=""; my $v=0;
if ($methodeparam =~/seuil/)
	{foreach $u (0..$#liste)
		{	
		$plot.="\(".$u.",".$liste[$u]."\) ";
		}
	}	
else 
	{foreach $u (0..$#liste)
		{
		$v=$debut+$u;
		$plot.="\(".$v.",".$liste[$u]."\) ";
		}
	}
	$plot=" coordinates {".$plot."};";
	return $plot;
	}
	
sub logeg{
(my $x)=@_;
if ($x<=0) {$l=0}
else {$l=log($x)}
return ($l);
}

sub moyennemobile{ #longueur AVANT la liste 
local ($long,@liste)=@_;
my (@moym);
foreach $u (0..$#liste+1-$long)
	{my $tmp=0; 
	$v=$u-1+$long;
	foreach my $w ($u..$v)		
		{
		$tmp+=$liste[$w];	
		}
		$tmp/=$long;	
	push (@moym,$tmp);
	}
	return (@moym);
}	

sub liste2chiffresapresvirg{ 
local (@liste)=@_;
my @liste2; my $u;
foreach $u (0..$#liste)
	{
	push (@liste2,sprintf("%.2f",$liste[$u]));
	}
return (@liste2);	
}

sub datesENversdatesordonnees # 7/12/20 -> 2020-M07-J12
	{
	(local $date)=@_;
	($mois,$jour,$an)=($date=~/(\d+)\/(\d+)\/(\d+)/);
	$dateord=  "20".sprintf("%.2d",$an)."-M".sprintf("%.2d",$mois)."-J".sprintf("%.2d",$jour);
	return $dateord;	
	}

#Dessous, ne pas oublier chop ($datesysteme);
sub datessystemFRavecheure #pour août, aout et Aout; avec heure
	{
	(local $date)=@_; # ex: $datesysteme=`date`;
	my @datesyst=split("[ ,:]+",$date);
	my $mois=lc($datesyst[2]);

	my %correspondancesmois=
('jan','01',
'fev','02',
'fév','02',
'feb','02',
'mar','03',
'avr','04',
'apr','04',
'mai','05',
'may','05',
'juin','06',
'june','06',
'juil','07',
'jul','07',
'ao','08',
'aug','08',
'sep','09',
'oct','10',
'nov','11',
'déc','12',
'dec ','12');
foreach $u (keys %correspondancesmois)
	{
	$nummois=$correspondancesmois{$u} if ($mois=~/^$u/);
	#	print $u," ",$mois, " fin mois\n";;
	}
	my $testdatesyst=$datesyst[3]."-M".$nummois."-J".sprintf("%.2d",$datesyst[1])."-H".sprintf("%.2d",$datesyst[4]);

	return $testdatesyst;
	}
	
sub datessystemFRsansheure #pour août, aout et Aout; avec heure
	{
	(local $date)=@_; 
	local ($datetmp);
	$datetmp=datessystemFRavecheure($date);
	$datetmp=~s/-H.*//;
	return $datetmp;
	}
	
sub toustriangles
	{
	(my $ficdonnees)=@_;
	
	$hauteurmaxpossible=3;
	$hauteurminpossible=.5;
	$nbpas= int($hauteurmaxpossible/$hauteurminpossible);

	open (D, "$ficdonnees"); 
	while(<D>)
		{
		chop;
		next if $.<3;
		@ligne=split(",");
		$abrev= $ligne[0];
		foreach $i ($numerojourdepart..$#ligne) # 1..
			{		
			$totalmortspop{$abrev,$i}=($ligne[$i]);
			}
		push (@mortsmax,$ligne[$#ligne]);
		}
	close (D);

	@lemaximummortspop=	sort trinum @mortsmax;
	$maxmortspopmonde= $lemaximummortspop[$#lemaximummortspop],"\n";
	@listeseuilstriangles=(0);
	foreach $u (1..$nbpas)
		{
		push(@listeseuilstriangles, int($maxmortspopmonde*$u/$nbpas));
		}
	
	$lecoeffk=$maxmortspopmonde/($hauteurmaxpossible**2);
	print join (" ",@listeseuilstriangles),"\n";
#Fin calages généraux	
	
	foreach $p (@touslespayscourts)
		{
		$infotriangle{$p}="vide"  if ! defined $pop3lettres{$p}; #aucun en fait
		$infotriangle{$p}="zeromort" if  $totalmortspop{$p,$#ligne}==0;
		}
	foreach $p (@touslespayscourts)
		{
		next if defined $infotriangle{$p};
		foreach $i ($numerojourdepart..$#ligne) # 1..
			{
			foreach $s (0..$nbpas)
				{
				$min{$p,$s}=$i if ($totalmortspop{$p,$i}>$listeseuilstriangles[$s]) && ($totalmortspop{$p,$i-1}<=$listeseuilstriangles[$s]);			
				}
			}
		}
#OUF: on a donc les (jours) $min{$p,$s}	pour chaque seuil

#Triangles blancs: pas de morts
	foreach $p (keys %infotriangle)
		{
		next if (! defined $totalmorts{$p});
		next if $popul{$p} <20000;
		$triangleblanc.=trianglecool($centrexpays{$p},$centreypays{$p},.6,pink,.5,1)."<\/polygon>\n";
		#.triangle($centrexpays{$p},$centreypays{$p},2,pink,1)."<\/polygon>\n"
		;
		}
#	print J 	$triangleblanc;
			
		
foreach $p (@touslespayscourts)
		{
		next if defined $infotriangle{$p};
		
#		next if $p ne "FRA";
		foreach $j  ($numerojourdepart..$#ligne)
 			{
 			$k=sprintf("%.2f",0.5 + (($j-$numerojourdepart)/$inversedelai));
			foreach $s (0..$nbpas)
				{
				$hauteurtmp= $hauteurminpossible*(1+$s);
				if ($j== $min{$p,$s})
					{
					$trianglenoir.=triangle($centrexpays{$p},$centreypays{$p},$hauteurtmp,black,0);
					$trianglenoir.="<animate attributeName=\"opacity\" from=\"0\" to=\"1\"   begin=\"$k";
					$trianglenoir.="s\" dur=\"0.2s\" fill=\"freeze\"  \/> \n <\/polygon>\n";				
					}
				} 	
			}	
		}		

$trianglenoir="<g id=\"Triangles\">\n".$trianglenoir	;
$trianglenoir.=$triangleblanc."<\/g>\n";
close (D);
return $trianglenoir;

	} #fin routine
#suite


#fin suite
sub triangle{ #h=10= 1500 km # sans </polygon>
	local ($tx,$ty,$hauteur,$couleur,$opacite)=@_;
	my ($x1,$x2,$x3,$y1,$y2,$y3,$triangle);
	$x1=$tx-$hauteur;
	$y1=$ty+$hauteur;
	$x2=$tx+$hauteur;
	$y2=$ty+$hauteur;
	$x3=$tx;
	$y3=$ty-$hauteur;

	$triangle=" <polygon points=\"$x1,$y1 $x2,$y2 $x3,$y3\"  stroke-width=\".1\" stroke=\"$couleur\" fill=\"none\"  opacity=\"$opacite\">\n";

}


sub trianglecool{ #ou rose: plus visible: avec stroke
	local ($tx,$ty,$hauteur,$couleur,$stroke,$opacite)=@_;
	my ($x1,$x2,$x3,$y1,$y2,$y3,$triangle,$stroke);
	$x1=$tx-$hauteur;
	$y1=$ty+$hauteur;
	$x2=$tx+$hauteur;
	$y2=$ty+$hauteur;
	$x3=$tx;
	$y3=$ty-$hauteur;

	$triangle=" <polygon points=\"$x1,$y1 $x2,$y2 $x3,$y3\"  stroke-width=\"$stroke\" stroke=\"$couleur\" fill=\"none\"  opacity=\"$opacite\">\n";

	}

sub legendecercles #@rayonlegende connu supposé de lg sup à 5 ou 6!
	{
	$xcercle=250;
	$ybasecercle=209;
	@rayonlegendetri= sort trinum @rayonlegende;
#	print @rayonlegendetri;
	$r1=$rayonlegendetri[0];
	$r4=$rayonlegendetri[$#rayonlegendetri];
	$r2=$rayonlegendetri[int(4*$#rayonlegendetri/5)];
	$r3=$rayonlegendetri[int(9.6*$#rayonlegendetri/10)];
	$xtextecercle=$r4+ 4+$xcercle;
	
	$ycentrecercles=$ybasecercle-$r4;
	$xcentrelegende=$xcercle-10; #Pifomètre

	$legendecercles="<g id =\"legendecercles\">\n"."<text x=\"$xcentrelegende\" y=\"$ycentrecercles\" style=\"font-size:4px;  font-family:Helvetica\" >Populations<\/text>\n";
	
		foreach $i (1..4)
		{
		$r="r".$i;
		$pop=parmilliers($$r*$$r*10000000);
		$c="C".$i;
		$cy= $ybasecercle- $$r;
		$ctextey=$ybasecercle- 2*$$r;
		$legendecercles.= "<circle id=\"$c\" cx=\"$xcercle\" cy=\"$cy\" r=\"$$r\" stroke=\"purple\" stroke-width=\".3\" fill=\"none\" opacity=\"0.3\" />\n"; 
		
		$legendecercles.= "<text x=\"$xtextecercle\" y=\"$ctextey\" style=\"font-size:3px;  font-family:Helvetica\" >$pop<\/text>\n";
		$legendecercles.= "<line x1=\"$xcercle\" y1=\"$ctextey\" x2=\"$xtextecercle\" y2=\"$ctextey\" stroke=\"purple\" stroke-width=\".2\" />\n";
		
		}
	$legendecercles.="<\/g>\n";	
	return $legendecercles;
	}

sub legendetriangles #@listeseuilstriangles avec $nbpas éléments
	{
	$legendetriangles="<g id=\"legendetriangles\">\n";
	$xlegendetriangle=290;
	$ybaselegendetriangle=209;
	@rayonlegendetri= sort trinum @rayonlegende;	
	
	$hauteurtriangle1=$hauteurminpossible; #min
	$hauteurtriangle2=$hauteurminpossible*(1+int($nbpas/2));
	$hauteurtriangle3=$hauteurminpossible*(1+int($nbpas));	
	
	$seuiltriangle1="Au moins 1 mort dans la contrée";
	$seuiltriangle2="Au plus ".$listeseuilstriangles[int($nbpas/2)]." morts par million d’hab."; #interm
	$seuiltriangle3="Au plus ".$listeseuilstriangles[$#listeseuilstriangles]." morts par million d’hab."; ; #+ gd triangle= max =859
	
	$xtextetriangle=$hauteurtriangle3+ 6+$xlegendetriangle;
		
		foreach $i (1..3)
		{	
		$h="hauteurtriangle".$i;
#		print $h," ",$$h,"\n";
		$stmp="seuiltriangle".$i;
		$legendetriangles.=triangle($xlegendetriangle,$ybaselegendetriangle-$$h,$$h,black,1)."<\/polygon>\n";	
		$ctextey=$ybaselegendetriangle- 2*$$h;

		$legendetriangles.= "<text x=\"$xtextetriangle\" y=\"$ctextey\" style=\"font-size:3px;  font-family:Helvetica\" >$$stmp<\/text>\n";
		#Ci dessous la ligne horizontale
		$legendetriangles.= "<line x1=\"$xlegendetriangle\" y1=\"$ctextey\" x2=\"$xtextetriangle\" y2=\"$ctextey\" stroke=\"purple\" stroke-width=\".2\" />\n";	
		}
	$ylegendetrianglecool=$ybaselegendetriangle+5;
	$legendetriangles.=trianglecool($xlegendetriangle,$ylegendetrianglecool,.8,pink,.5,1)."<\/polygon>\n";	
	$legendetriangles.= "<text x=\"$xtextetriangle\" y=\"$ylegendetrianglecool\" style=\"font-size:3px;  font-family:Helvetica\" >Contrée sans aucun mort<\/text>\n";
		
	$legendetriangles.="<\/g>\n";	
	return $legendetriangles;
	}
	
sub trinum {$a<=>$b}

sub minliste
	{
	local (@liste)=@_;
	my @loste=sort trinum @liste;
	return $loste[0];
	}

sub maxliste
	{
	local (@liste)=@_;
	my @loste=sort trinum @liste;
	return $loste[$#loste];
	}
	
sub parmilliers{ #supposé sans virgule
(my $nb)=@_;
@liste=split(//,$nb);
my $cpt; my $v;
foreach $u (reverse (0..$#liste))
	{
	$cpt++;
	$v= $liste[$u].$v;
	$v =" ".$v if $cpt%3==0;
	}
$v=~s/^ *//g;	
return $v;
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

sub distancecouleursrgb
	{
	local($couleur1,$couleur2)=@_;
	my $dist2;
        $couleur1=~s/rgb\(//g;
        $couleur1=~s/\)//g;
        @cl1=split(/[ ,]+/,$couleur1);
        $couleur2=~s/rgb\(//g;
        $couleur2=~s/\)//g;
        @cl2=split(/[ ,]+/,$couleur2);
        foreach $u (0..$#cl1)
        	{
                $dist2+=($cl1[$u]-$cl2[$u])**2;
                }
	return $dist2;
        }
       
sub couleurcalculee	
	{
	local ($x)=@_;
	next if $x <0;
	my $pythaglocal=0;
	print "\n aie $x supérieur à 1 \n" if $x > 1;
	next if $x >1;
	foreach $u (0..$#couleurdepart)
		{
		$couleurinterm[$u]=sprintf("%.0f",($x*($couleurfin[$u]) + (1-$x)* $couleurdepart[$u]));	
		$pythaglocal+=$couleurinterm[$u]*$couleurinterm[$u];
		}
	$pythaginterpole=($x*$pythagfin)+(1-$x)*$pythagdep;
	$coeffcouleur= sqrt($pythaginterpole/$pythaglocal),"\n"; #coeff mult
	foreach $u (0..$#couleurdepart)
		{
		$couleurinterm[$u]=sprintf("%.0f",($x*($couleurfin[$u]*$coeffcouleur) + (1-$x)* $couleurdepart[$u]*$coeffcouleur));	
		}
	return @couleurinterm;	
	}

sub fonction{
	local ($entree)=@_;	
	$f=$entree; # *sqrt($entree);
	return $f}

sub printliste
	{
	local ($posx,$posy,$taillepolice,$typepolice,$couleur,$opacite,@texte)=@_;	
	local ($taillepoloce,$interligne,$i,$descriptif);
	$taillepoloce=($taillepolice)."px"; #Ajout px
	$interligne=(1.15)*$taillepolice;
	foreach $i (0..$#texte)
		{
		$posy+=$interligne if $i;
		$descriptif.="<text x=\"$posx\" y=\"$posy\" style=\"font-size:$taillepoloce; font-family:$typepolice\" fill=\"$couleur\" opacity=\"$opacite\">$texte[$i]<\/text>\n";
		}
	return $descriptif;	
	}
		
1;

