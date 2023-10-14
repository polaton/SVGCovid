# Un peu d'ordre dans le svg
# svg: on ajoute des classes, des css, des calques pour structurer et alléger le svg

import csv 

f = open("../Donnees/Dessins/dessin3.html", "w")

head='<!DOCTYPE html>\n<html> <head> \n<title>Législatives</title>\n<meta charset="UTF-8">\n</head>\n<body>\n'
head+='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" \n'
head+='viewBox="0 0 100 100" width="100%" height="100%" >\n' #800px
finhtml='</svg>\n</body>\n</html>\n'

debutcss="<style type='text/css'>\n"
fincss='\n</style>\n'
#Ruse: 1er style entre guillemets à cause de l'apostrophe

csscercle=".cercle {stroke: black; stroke-width: 2 ;opacity: 0.7 }"
#Description de la classe cercle, on pourra en ajouter d'autres
#Ex.: csscarre
infocss=debutcss+csscercle+fincss
#print (infocss)
#exit()

cadre='<path id="Cadre"  fill="blue" fill-opacity="0.05" stroke="blue" stroke-width=".5" d=" M2 2 L2 98 L98 98 L98 2 Z"> </path>\n'
calqueCadre='<g id="Paratexte">\n'+cadre+'</g>\n'

carresvg= '<path id="Lyon"  fill="red"   d=" M5 5 L5 50 L50 50 L50 5 Z"> </path>\n'
polygsvg='<path id="Ailleurs"  fill="blue" fill-opacity="0.7"   d=" M15 15 L85 15 L60 30 L60 65 Z M70 70 L80 70 L75 75 L70 75 Z"> </path>\n'
#On les met dans un calque
calquepolyg='<g id="Anguleux">\n' + carresvg  + polygsvg + '</g>\n'
print (calquepolyg)

#On passe aux cercles
ficCercles="../Donnees/Chiffres/cercles.tsv" #le fichier qu'on va lire
nomPythonDuFichierCercles=csv.reader(open(ficCercles,'r',encoding='UTF-8'), delimiter='\t')
lignesCercles = list(nomPythonDuFichierCercles)
entete = lignesCercles.pop(0) #On enlève l'en-tête

compteur=0
couleursCercles=['yellow','green','skyblue','orange','purple'] 
calquecercle=""

for chaqueligne in lignesCercles:
	identcercle="IdCercle"
	ajout=str(compteur +1)
	identcercle=identcercle+ajout
	x=chaqueligne[0]
	y=chaqueligne[1]
	rayon=chaqueligne[2]
	#Solution pour profanes: maligne=<circle id="IdAchanger" cx="CentreXaChanger" cy="CentreYaChanger" etc, puuis faire les substitutions nécessaires
	cerclesvg='<circle class="cercle" id="{}" cx="{}" cy="{}" r="{}" fill="{}" >  </circle> \n'.format(identcercle,x,y,rayon,couleursCercles[compteur])
	print ("L'déal aurait été de mettre des guillemets autour des paramètres: ",cerclesvg)
# cx={} cy={} r={} stroke=\"black\" stroke-width=\"2\"  fill={} opacity=\"0.7\" >  </circle> \n".format(x,y,rayon,couleursCercles[compteur]			
		
	calquecercle+=cerclesvg	
	compteur+=1

calquecercle='<g id="Cercles">\n' + calquecercle + '</g>\n'
titre="On est vite perdu sans cadre" 
textesvg='<text  x="55" y="10"  style="font-size:3px; font-family:Helvetica">'+titre+'</text>\n'

f.write(head)
f.write(infocss)
f.write(calqueCadre) #Ajout
f.write(calquepolyg)
f.write (calquecercle)
f.write (textesvg)
f.write(finhtml)
#On imagine qu'on aurait pu mettre aussi notre carte dans un calque

