rm -rf francee
mkdir francee
mkdir francee/data
mkdir francee/includes

wget https://raw.githubusercontent.com/polaton/SVGCovid/main/cartes/francee/france.html
mv france.html francee/

wget https://raw.githubusercontent.com/polaton/SVGCovid/main/cartes/francee/includes/jquerycsv.js
mv jquerycsv.js francee/includes/
wget https://raw.githubusercontent.com/polaton/SVGCovid/main/cartes/francee/includes/france.js
mv france.js francee/includes/

wget http://barthes.enssib.fr/coronavirus/cartes/RFrance/France
mv France francee/data/
wget http://barthes.enssib.fr/coronavirus/cartes/RFrance/Infections
mv Infections francee/data/



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


wget https://raw.githubusercontent.com/polaton/SVGCovid/main/cartes/monde/data/nomenclatures-pays
mv nomenclatures-pays monde/data/
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
wget http://barthes.enssib.fr/coronavirus/cartes/Rmonde/methode-confirmes-debruites-accrjourpop
mv methode-confirmes-debruites-accrjourpop monde/data/