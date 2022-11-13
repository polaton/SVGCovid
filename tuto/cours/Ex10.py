import csv #traitement csv
from bs4 import BeautifulSoup

# n seuils et n+1 couleurs
# Ici 5 seuils
# couleurs tirant vers le vert= 'rgb(90, 220, 20)' ; 'rgb(160, 230, 25)' 
# Seuils et couleurs modifiables

# ficCouleurs = open("InfosCouleurs", "w") #On va y écrire En fait inutile

seuils=[25,28,31,35,40]
couleurs=['rgb(255,255,100)' , 'rgb(255,240,60)' , 'rgb(255, 180, 30)' , 'rgb(255, 120, 30)', 'rgb(220, 60, 20)', 'rgb(120, 0, 0)']


#origine: couleurs=['rgb(205,235,30)' , 'rgb(252,220,50)' , 'rgb(255, 150, 0)' , 'rgb(240, 100, 0)', 'rgb(240, 40, 0)', 'rgb(200, 20, 20)']
#origine: seuils=[25,28,31,35,40]
nbseuils=int(len(seuils)) #5
print(nbseuils)
ListeNumDesSeuils = list(range(nbseuils))
print (ListeNumDesSeuils) #[0, 1, 2, 3, 4] Certes, pas si clair...

FicSource=csv.reader(open('ResultatPourAbstentions30pc','r',encoding='UTF-8'), delimiter='\t')
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
#	ficCouleurs.write (ident+"\t"+couleurcirc[ident]+"\t"+str(valeur)+"\n")
 
# Types des Ident: <path id="8303-CC3" ou <path id="7506-CC1" ou <path id="zoom-7506"

with open("Fond.html", "r",encoding='utf8') as FicFondorigine:
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

###Travail sur caissons

couleurvaleursmanquantes="turquoise"
caissonbase='<rect x="-3.2" y="hauteury" width=".3" height=".3"  fill="couleur"/>'

textecaissonbase='<text x="-2.6" y="hauteurYtexte" style="font-size:.2px; font-family:Helvetica"> valeurcaisson </text>'
deltaYcaisson=.4
departYcaisson= -43.4
nbcaissons=0
touscaissons=""

for i in ListeNumDesSeuils:
    caisson=caissonbase
    textecaisson=textecaissonbase
    Ytmp=departYcaisson - i * deltaYcaisson
    YtextTmp=Ytmp + deltaYcaisson/2
    
    caisson=caisson.replace("hauteury",str(Ytmp))
    caisson=caisson.replace("couleur",couleurs[i])
    textecaisson=textecaisson.replace("hauteurYtexte",str(YtextTmp))
    textecaisson=textecaisson.replace("valeurcaisson","< "+str(seuils[i])+" %")
    touscaissons+=caisson+"\n"+textecaisson+"\n"
    nbcaissons+=1
departYcaissonSpecial=Ytmp
 
caissonSup=caissonbase
textecaissonSup=textecaissonbase
YcaissonSup=departYcaissonSpecial - deltaYcaisson
YtextSup=YcaissonSup + deltaYcaisson/2

caissonSup=caissonSup.replace("hauteury",str(YcaissonSup))
caissonSup=caissonSup.replace("couleur",couleurs[nbcaissons])
textecaissonSup=textecaissonSup.replace("hauteurYtexte",str(YtextSup))
textecaissonSup=textecaissonSup.replace("valeurcaisson","≥ "+str(seuils[-1])+" %")
touscaissons+=caissonSup+"\n"+textecaissonSup

caissonMq=caissonbase
textecaissonMq=textecaissonbase
YcaissonMq=departYcaissonSpecial - 2 * deltaYcaisson
YtextSup=YcaissonMq + deltaYcaisson/2

caissonMq=caissonMq.replace("hauteury",str(YcaissonMq))
caissonMq=caissonMq.replace("couleur",couleurvaleursmanquantes)
textecaissonMq=textecaissonMq.replace("hauteurYtexte",str(YtextSup))
textecaissonMq=textecaissonMq.replace("valeurcaisson","Valeur manquante")
touscaissons+=caissonMq+"\n"+textecaissonMq

touscaissons='<g id="caissons">'+"\n"+touscaissons+"\n"+'</g>'+"\n"

# Fin caissons, enveloppés dans un calque svg

# Comme touscaissons est du texte, on utilise BeautifulSoup pour le parser
caissonsTag = BeautifulSoup(touscaissons, features="html.parser")
# Ensuite on récupère le g avec l'id caissons (normalement c'est le seul élément dans la soup caissonsTag) et on le stocke dans touscaissonsTag
touscaissonsTag = caissonsTag.find("g",{"id":"caissons"})

#print(touscaissonsTag)
# Ensuite on cherche le svg dans le «puree» initial, et y «append» le touscaissonsTag qui est au bon format puisque parsé avec BS
puree.find("svg").append(touscaissonsTag)

# il faut ouvrir le fichier en wb et pas w simplement! «b» indique qu'on va lui envoyer des octets (spécifique à avec Beautiful soup)
with open("carte2.html", "wb") as final:
	final.write(puree.prettify("utf-8"))
