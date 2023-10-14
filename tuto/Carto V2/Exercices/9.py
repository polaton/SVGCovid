import csv #traitement csv
from bs4 import BeautifulSoup

# n seuils et n+1 couleurs
# Ici 5 seuils
# couleurs tirant vers le vert= 'rgb(90, 220, 20)' ; 'rgb(160, 230, 25)' 
# Seuils et couleurs modifiables

ficCouleurs = open("../Donnees/Chiffres/InfosCouleurs", "w") #On va y écrire

seuils=[25,28,31,35,40]
couleurs=['rgb(255,255,100)' , 'rgb(255,240,60)' , 'rgb(255, 180, 30)' , 'rgb(255, 120, 30)', 'rgb(220, 60, 20)', 'rgb(120, 0, 0)']

# couleurs=['rgb(255,255,100)' , 'rgb(255,240,60)' , 'rgb(255, 180, 30)' , 'rgb(255, 120, 30)', 'rgb(220, 60, 20)', 'none']

#origine: couleurs=['rgb(205,235,30)' , 'rgb(252,220,50)' , 'rgb(255, 150, 0)' , 'rgb(240, 100, 0)', 'rgb(240, 40, 0)', 'rgb(200, 20, 20)']
#origine: seuils=[25,28,31,35,40]
nbseuils=int(len(seuils)) #5
print(nbseuils)
ListeNumDesSeuils = list(range(nbseuils))
print (ListeNumDesSeuils) #[0, 1, 2, 3, 4] Certes, pas si clair...

FicSource=csv.reader(open('../Donnees/Chiffres/abstention30pc.tsv','r',encoding='UTF-8'), delimiter='\t')
numColonneIntuitif=4 
numColPy=numColonneIntuitif-1
lignes=list(FicSource)
enTete = lignes.pop(0)
couleurcirc={}

for lignecourante in lignes:
	ident=lignecourante[0]
	valeur=	float(lignecourante[numColPy])
#	print (ident)
	for u in ListeNumDesSeuils: # de 0 à 4
		if valeur > seuils[u]:
			couleurcirc[ident]=couleurs[u+1]
	#la circ prend plusieurs couleurs jusqu'à la bonne
	#sinon...		
	if valeur <= seuils[0]:
		couleurcirc[ident]=couleurs[0] # gardée en mémoire
	ficCouleurs.write (ident+"\t"+couleurcirc[ident]+"\t"+str(valeur)+"\n")
 
# Types des Ident: <path id="8303-CC3" ou <path id="7506-CC1" ou <path id="zoom-7506"

with open("../Donnees/Cartes/Fond.html", "r",encoding='utf8') as FicFondorigine:
	DonneesHtml = FicFondorigine.read()  
	puree = BeautifulSoup(DonneesHtml, features="html.parser")
	
	zoomParis=puree.find("g",{"id":"RPzoomcirc"}).find_all("path")
	for circ in zoomParis:
		idcirc=circ["id"].split("-")[1]
		circ["fill"]=couleurcirc[idcirc] #je rajoute un élément du dictionnaire	

	Fr=puree.find("g",{"id":"Circ"}).find_all("path")
	for circ in Fr:
		idcirc=circ["id"].split("-")[0]
		circ["fill"]=couleurcirc[idcirc]
	#	circ["opacity"]=.7
  
with open("../Donnees/Cartes/carte1.html", "wb") as f:
	f.write(puree.prettify("utf-8"))
