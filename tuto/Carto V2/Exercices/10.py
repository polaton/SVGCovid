import csv  # traitement csv
import re
import string
from bs4 import BeautifulSoup
import math
# print (list(string.ascii_uppercase))

#### REPRISE Ex10
# Paramètres et initialisations
seuils=[25,28,31,35,40]
couleurs=['rgb(255,255,100)' , 'rgb(255,240,60)' , 'rgb(255, 180, 30)' , 'rgb(255, 120, 30)', 'rgb(220, 60, 20)', 'rgb(120, 0, 0)']
nbseuils=int(len(seuils)) #5
ListeNumDesSeuils = list(range(nbseuils))
print (ListeNumDesSeuils) #[0, 1, 2, 3, 4] 

FicSource=csv.reader(open('../Donnees/Chiffres/abstention30pc.tsv','r',encoding='UTF-8'), delimiter='\t')
numColonneIntuitif=4 
numColPy=numColonneIntuitif-1
numColCercle=2 # les nb d'inscrits sont en colonne 2 : Ajout cercles
lignes=list(FicSource)
enTete = lignes.pop(0)
couleurcirc={}
InfosRayons={}
listecoord=[]
listeDesX=[]
listeDesY=[]
colle="\t"
CerclesCirc={}
CerclesPourVoir=""
CerclesRP=""
CerclesFR=""

for lignecourante in lignes:
	ident=lignecourante[0]
	valeur=	float(lignecourante[numColPy])
	for u in ListeNumDesSeuils: # de 0 à 4
		if valeur > seuils[u]:
			couleurcirc[ident]=couleurs[u+1]
	#la circ prend plusieurs couleurs jusqu'à la bonne
	#sinon...		
	if valeur <= seuils[0]:
		couleurcirc[ident]=couleurs[0] # gardée en mémoire
 
# SPECIAL cercles
	InfosRayons[ident]=math.sqrt(float(lignecourante[numColCercle])/10000)
	if InfosRayons[ident] < 0: # pour le log...
		InfosRayons[ident]=0
	if re.search("^75|^92|^93|^94", ident):  
		InfosRayons[ident]=InfosRayons[ident]/7
	InfosRayons[ident]="%.2f" % InfosRayons[ident]
# FIN spécial cercles 

# REPRISE B SOUP

with open("../Donnees/Cartes/Fond.html", "r",encoding='utf8') as FicFondorigine:
	DonneesHtml = FicFondorigine.read()  
	puree = BeautifulSoup(DonneesHtml, features="html.parser")
	
	zoomParis=puree.find("g",{"id":"RPzoomcirc"}).find_all("path")
	for circ in zoomParis:
		idcirc=circ["id"].split("-")[1]
	#	print(idcirc)	
		circ["fill"]=couleurcirc[idcirc] #je rajoute un élément du dictionnaire	
	#	print(circ["fill"])
	Fr=puree.find("g",{"id":"Circ"}).find_all("path")
	for circ in Fr:
		idcirc=circ["id"].split("-")[0]
		circ["fill"]=couleurcirc[idcirc]
 
 #Insertion cercles
 
	TousChemins=puree.find_all("path")
	for chemin in TousChemins: #dès que l'on voit path...
		ok=0
		idchemin=chemin["id"]
		coord=chemin["d"]
		idchemin=idchemin.replace("zoom-","") #Il faudra garder le zoom pour les cercles de la RP
		idchemin=idchemin.split("-")[0]
		voir=re.sub('[A-Z]+','',coord) #OUF
		voir=voir.strip()
		listecoord=re.split('[ +]',voir)
#		if len(listecoord) %2==1:
#			print(idchemin,len(listecoord)) #restait un dernier pb avec 8306-CC2
		for i in range(0,len(listecoord)):
			if i %2==0:
				listeDesX.append(float(listecoord[i]))
			else:
				listeDesY.append(float(listecoord[i]))
    
		centreX=min(listeDesX)+ max(listeDesX)
		centreX=centreX/2
		centreX= "%.2f" % float(centreX)
		centreY=min(listeDesY)+ max(listeDesY)
		centreY=centreY/2
		centreY="%.2f" % centreY
  
#		listeinfernale=(chemin["id"],idchemin,str(centreX),str(centreY))
#		lignecercle=colle.join(listeinfernale)
#		print (lignecercle)
# On veut quelque chose du genre
#		<circle id="IdCercle2" cx="30" cy="60" r="10" stroke="black" stroke-width="2" fill="green" opacity="0.7" >  </circle> 
		cerclesvg='<circle id="{}" cx="{}" cy="{}" r="{}" >  </circle> '.format(chemin["id"],centreX,centreY,InfosRayons[idchemin])
		if re.search("zoom", chemin["id"]): 
			CerclesRP+=cerclesvg
		if re.search("CC1", chemin["id"]): # pas la peine de mettre un gros cercle sur une petite ile d'une circ...
			CerclesFR+=cerclesvg
		
		listeDesX=[]
		listeDesY=[]
		ok=0
CerclesFR='<g id="LesCerclesPourVoirFR" class="cerclesstd" transform="scale(1,-1)">'+"\n"+CerclesFR+"\n"+'</g>'+"\n"
CerclesRP='<g id="LesCerclesPourVoirRP" class="cercleszoom" transform="translate(-5.2,291.5) scale(7,-7)" >'+"\n"+CerclesRP+"\n"+'</g>'+"\n"
#print (CerclesRP)

CerclesRPTag = BeautifulSoup(CerclesRP, features="html.parser")
# Ensuite on récupère le g avec l'id LesCerclesPourVoirRP  et on le stocke dans TousCerclesRPTag
TousCerclesRPTag = CerclesRPTag.find("g",{"id":"LesCerclesPourVoirRP"})

CerclesFRTag = BeautifulSoup(CerclesFR, features="html.parser")
# Ensuite on récupère le g avec l'id LesCerclesPourVoirFr  et on le stocke dans TousCerclesRPTag
TousCerclesFRTag = CerclesFRTag.find("g",{"id":"LesCerclesPourVoirFR"})

# Ensuite on cherche le svg dans le «puree» initial, et y «append» les Cercles*Tag qui sont au bon format puisque parsés avec BS
puree.find("svg").append(TousCerclesRPTag)
puree.find("svg").append(TousCerclesFRTag)

 #Fin Insertion cercles
  
# REPRISE CAISSONS
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

# Ensuite on cherche le svg dans le «puree» initial, et y «append» le touscaissonsTag qui est au bon format puisque parsé avec BS
puree.find("svg").append(touscaissonsTag)

#### FIN
	
with open("../Donnees/Cartes/carte2.html", "wb") as final:
	final.write(puree.prettify("utf-8"))
