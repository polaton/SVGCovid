$ficperl="/home/guichard/Covid//Monde-fixe-R/tmpdeces.pl";

@delais=(1,3,7);
@freqinv=(1,2,5);

foreach $d (@delais)
  {	
  foreach $f (@freqinv)
    {	
    open (E, "/home/guichard/Covid//Monde-fixe-R/evol-pgm2animl.pl");
    open (F,">$ficperl");
    while (<E>)
      {
      if (/ICIDELTAJOUR/)
        {
        $_="\$deltajour=$d ;\n";
        }
      if (/ICIINVERSEDELAI/)	
        {
        $_="\$inversedelai=$f ;\n";
        }
        print F;
      }
      close (E);	
      close (F);
      system ("/usr/bin/perl $ficperl");
    }
  }
system ("mv /var/www/html/coronavirus/cartes/R-Monde-carte-animee-du-jour-1Jsur1-2JParSec.svg /var/www/html/coronavirus/cartes/R-Monde-carte-animee-du-jour.svg");
      