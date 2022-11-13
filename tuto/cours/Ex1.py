#Basiques de python
#Lire un fichier, écrire dans un autre
#Rudiments svg
f = open("dessin1.html", "w")

head='<!DOCTYPE html>\n<html> <head> \n<title>Législatives</title>\n<meta charset="UTF-8">\n</head>\n<body>\n'
head+='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" \n'
head+='viewBox="0 0 100 100" width="100%" height="100%" >\n' #800px
finhtml='</svg>\n</body>\n</html>\n'

carresvg= '<path id="REMPLIRID"  fill="COULEURaCHOISIR"   d=" M5 5 L5 50 L50 50 L50 5 Z"> </path>\n'
#L, M= Line/Move/to l,m: coord relatives
polycheminsvg='<path id="REMPLIRID2"  fill="blue"   d=" M15 15 L85 15 L60 30 L60 65 Z M70 70 L80 70 L75 75 L70 75 Z"> </path>\n'
#Ici 2 composantes connexes

#Quelques jeux simples de programmation
id="Paris"
id2="Autre"
couleur="red"
couleur="rgb(200,10,50)" #l'ancienne valeur est remplacée
carresvg=carresvg.replace("COULEURaCHOISIR",couleur)
carresvg=carresvg.replace("REMPLIRID",id)
polycheminsvg=polycheminsvg.replace("REMPLIRID2",id2)

f.write(head)
f.write(carresvg)
f.write(polycheminsvg)
	
titre="Premier essai en SVG"
textesvg='<text  x="60" y="10"  style="font-size:3px; font-family:Helvetica">'+titre+'</text>\n'
f.write (textesvg)
f.write(finhtml)
#Vous pouvez ouvrir et visualiser le fichier dessin1.html
