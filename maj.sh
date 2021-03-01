#!/bin/bash
rm NCas*
rm RFast*
rm RStandard*
rm Confirmes*
rm Morts*
wget http://barthes.enssib.fr/coronavirus/cartes/Rmonde/NCas
wget http://barthes.enssib.fr/coronavirus/cartes/Rmonde/RFast
wget http://barthes.enssib.fr/coronavirus/cartes/Rmonde/RStandard
wget http://barthes.enssib.fr/coronavirus/cartes/Rmonde/methode-confirmesaccrjourpop
mv methode-confirmesaccrjourpop Confirmes
wget http://barthes.enssib.fr/coronavirus/cartes/Rmonde/methode-mortsaccrjourpop
mv methode-mortsaccrjourpop Morts