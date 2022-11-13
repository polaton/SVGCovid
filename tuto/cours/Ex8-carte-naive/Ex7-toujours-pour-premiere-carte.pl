#Etant donné une série de coordonnées (surfaces), faire le svg associé
#Fichiers du type 
#Id	x1	y1	etc
@listecouleurs=('silver','darkgray','slategray','gray','black','rosybrown','coral','orangered','red','crimson','indianred','firebrick','brown','sienna','chocolate','darkorange','lightsalmon','salmon','darkgoldenrod','peru','goldenrod','darkkhaki','lime','limegreen','yellowgreen','mediumaquamarine','darkseagreen','green','seagreen','olive','darkgreen','darkslategray','darkolivegreen','turquoise','lightseagreen','cadetblue','darkcyan','steelblue','deepskyblue','skyblue','cornflowerblue','dodgerblue','slateblue','royalblue','blue','darkslateblue','navy','indigo','blueviolet','mediumpurple','mediumorchid','magenta','hotpink','violet','palevioletred','deeppink','mediumvioletred','purple');
#On suppose qu'il y a moins de lignes que de couleurs
$nbcouleurs=$#listecouleurs;

$debut="<!DOCTYPE html>\n<html>\n<head>\n<title>Test</title>\n <meta charset=\"UTF-8\"\/>\n<\/head>\n<body>\n";
$debut.="<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" \n viewBox=\"xmin ymin lgx lgy\" width=\"100%\" height=\"100%\" >";
$fin="<\/svg>\n<\/body>\n<\/html>\n";

$fic="FondEx8";
$fichtml=$fic;
$fichtml.=".html";

open (F,"$fic");
open (G,">$fichtml");

$nblignes=`wc $fic`;
chop ($nblignes);

#PARAMETRES
$separateurcoord=" "; # ou \t
$epaisseur="epaisseur";
$coeffmultiplicateur=1000;
#FIN PARAMETRES

while (<F>)
	{
	chop;
	$path="";
	($id,$coord)=split (/\t/);
	@listecoord=split ($separateurcoord,$coord);
	foreach $l (0..$#listecoord)
		{
		$listecoord[$l]=$coeffmultiplicateur*$listecoord[$l];
		push (@lesx,$listecoord[$l]) if $l % 2==0;
		push (@lesy,$listecoord[$l]) if $l % 2==1;
		$path.=' L'.$listecoord[$l] if $l % 2==0;
		$path.=' '.$listecoord[$l] if $l % 2==1;
		
		}
	$mesuresurface= surface(@listecoord),"\n";
	$path=~s/^ L/M/;
	$couleur=$. % $nbcouleurs;
	$couleur= $listecouleurs[$couleur];
	$path="fill=\"$couleur\" stroke=\"black\" stroke-width=\"epaisseur\" d=\"".$path." Z \"><\/path>";
	$od="<path id=\"".$id."-".$.."\" ".$path."\n";
	#Ajout surface
	$infoS="<!-- Le polygone précité a une surface de $mesuresurface -->\n";
	$od.=$infoS;
	$tout.= $od;
	}
close (F);	
$xmin=minliste(@lesx);
$xmax=maxliste(@lesx);
$ymin=minliste(@lesy);
$ymax=maxliste(@lesy);

$lgx=$xmax-$xmin;
$lgy=$ymax-$ymin;
$debut=~s/xmin/$xmin/;
$debut=~s/ymin/$ymin/;
$debut=~s/lgx/$lgx/;
$debut=~s/lgy/$lgy/;

$epaisseur=minliste($lgx,$lgy)/1000;
$rect="<rect 
x=\"$xmin\" y=\"$ymin\" width=\"$lgx\" height=\"$lgy\"  stroke-width=\"$epaisseur\"  stroke=\"blue\" fill=\"red\"  fill-opacity=\"0.1\"
<\/rect>\n";
print G $debut,"\n";

$tout=~s/epaisseur/$epaisseur/g;
print G $tout;
print G $rect;

print G $fin;

	

#ROUTINES

sub trinum {$a<=>$b}

sub minliste
	{
	local (@listem)=@_;
	my @loste=sort trinum @listem;
	return $loste[0];
	}

sub maxliste
	{
	local (@listeM)=@_;
	my @loste=sort trinum @listeM;
	return $loste[$#loste];
	}
	
	
sub surface
	{
	local (@liste)=@_;
	local(@lesx,@lesy,$xmin,$ymin,$xmax,$ymax,$deltax,$deltay,$surface);
	foreach $l (0..$#liste)
		{
		push (@lesx,$liste[$l]) if $l % 2==0;
		push (@lesy,$liste[$l]) if $l % 2==1;
		}
	$xmin= minliste(@lesx);
	$ymin= minliste(@lesy);
	$xmax=	maxliste(@lesx);
	$ymax=	maxliste(@lesy);

	$deltax=$xmax- $xmin;	
	$deltay=$ymax- $ymin; #ici pb

	$surface= $deltax * $deltay;
	return $surface;
	}	
	