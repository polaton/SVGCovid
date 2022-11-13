# python: boucle
# svg: on ajoute un cadre, des cercles, un calque

import csv 

f = open("dessin2.html", "w")

head='<!DOCTYPE html>\n<html> <head> \n<title>Législatives</title>\n<meta charset="UTF-8">\n</head>\n<body>\n'
head+='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" \n'
head+='viewBox="0 0 100 100" width="100%" height="100%" >\n' #800px
finhtml='</svg>\n</body>\n</html>\n'

#Ajout d'un cadre
cadre='<path id="Cadre"  fill="blue" fill-opacity="0.05" stroke="blue" stroke-width=".5" d=" M2 2 L2 98 L98 98 L98 2 Z"> </path>\n'

#opacity traite fond et cadre, d'où fill-opacity

#L'idéal est de mettre ce cadre dans une boîte autonome: un calque: <g>... </g>
calqueCadre='<g id="Paratexte">\n'+cadre+'</g>\n'
#Fin ajout

carresvg= '<path id="Lyon"  fill="COULEURaCHOISIR"   d=" M5 5 L5 50 L50 50 L50 5 Z"> </path>\n'
polycheminsvg='<path id="Ailleurs"  fill="blue" opacity="0.7"   d=" M15 15 L85 15 L60 30 L60 65 Z M70 70 L80 70 L75 75 L70 75 Z"> </path>\n'

id="Paris"
id2="Autre"
couleur="red"
couleur="rgb(200,10,50)" #l'ancienne valeur est remplacée
carresvg=carresvg.replace("COULEURaCHOISIR",couleur)
carresvg=carresvg.replace("REMPLIRID",id)
polycheminsvg=polycheminsvg.replace("REMPLIRID2",id2)

f.write(head)
f.write(calqueCadre) #Ajout
f.write(carresvg)
f.write(polycheminsvg)

#Vrai changement: on passe aux cercles
ficCercles="cercles" #le fichier qu'on va lire
nomPythonDuFichierCercles=csv.reader(open(ficCercles,'r',encoding='UTF-8'), delimiter='\t')
# + simple: nomPythonDuFichierCercles=csv.reader(open("cercles",'r',encoding='UTF-8'), delimiter='\t')

lignesCercles = list(nomPythonDuFichierCercles)
entete = lignesCercles.pop(0) #On enlève l'en-tête

compteur=0
couleursCercles=['yellow','green','skyblue','orange','purple'] 

for chaqueligne in lignesCercles:
	identcercle="IdCercle"
	ajout=str(compteur +1)
# On ne peut imprimer directement des nombres
	print (ajout)
	x=chaqueligne[0]
	y=chaqueligne[1]
	rayon=chaqueligne[2]
	#Par la suite, le + signifie une concaténation. Attention, la syntaxe est un peu lourde...
	#On veut écrire quelque chose comme: <circle id="qqch" cx="10" cy="90" r="5" stroke="black" stroke-width="2" fill="yellow" opacity="0.7" >  </circle> 
	#Solution pour profanes: maligne=<circle id="IdAchanger" cx="CentreXaChanger" cy="CentreYaChanger" etc, puuis faire les substitutions nécessaires
	cerclesvg='<circle id="'+identcercle+ajout+'" cx="'+x+'" cy="'+y+'" r="'+rayon+'" stroke="black" stroke-width="2" fill="'+couleursCercles[compteur]+'" opacity="0.7" >  </circle> \n'	
		
	print (cerclesvg)	
	f.write (cerclesvg)
	compteur+=1
	
titre="On est vite perdu sans cadre" 
textesvg='<text  x="55" y="10"  style="font-size:3px; font-family:Helvetica">'+titre+'</text>\n'
f.write (textesvg)
f.write(finhtml)
#On imagine qu'on aurait pu mettre aussi notre carte dans un calque

