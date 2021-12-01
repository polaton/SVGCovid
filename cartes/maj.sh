rm -rf france
mkdir france
mkdir france/data
mkdir france/includes

wget https://raw.githubusercontent.com/polaton/SVGCovid/main/cartes/france/france.html
mv france.html france/

wget https://raw.githubusercontent.com/polaton/SVGCovid/main/cartes/france/includes/jquerycsv.js
mv jquerycsv.js france/includes/
wget https://raw.githubusercontent.com/polaton/SVGCovid/main/cartes/france/includes/france.js
mv france.js france/includes/

wget http://barthes.enssib.fr/coronavirus/cartes/RFrance/France
mv France france/data/
wget http://barthes.enssib.fr/coronavirus/cartes/RFrance/Infections
mv Infections france/data/



rm -rf monde
mkdir monde
mkdir monde/data
mkdir monde/includes

wget https://raw.githubusercontent.com/polaton/SVGCovid/main/cartes/monde/monde.html
mv monde.html monde/

wget https://raw.githubusercontent.com/polaton/SVGCovid/main/cartes/monde/includes/jquerycsv.js
mv jquerycsv.js monde/includes/
wget https://raw.githubusercontent.com/polaton/SVGCovid/main/cartes/monde/includes/monde.js
mv monde.js monde/includes/
wget https://raw.githubusercontent.com/polaton/SVGCovid/main/cartes/monde/includes/monde.css
mv monde.css monde/includes/

wget http://barthes.enssib.fr/coronavirus/cartes/Rmonde/NCas 
mv NCas monde/data/
wget http://barthes.enssib.fr/coronavirus/cartes/Rmonde/RFast
mv RFast monde/data/
wget http://barthes.enssib.fr/coronavirus/cartes/Rmonde/RStandard
mv RStandard monde/data/
wget http://barthes.enssib.fr/coronavirus/cartes/Rmonde/methode-confirmesaccrjourpop
mv methode-confirmesaccrjourpop monde/data/
wget http://barthes.enssib.fr/coronavirus/cartes/Rmonde/methode-mortsaccrjourpop
mv methode-mortsaccrjourpop monde/data/