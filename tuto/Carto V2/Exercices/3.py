# python: comprendre un peu les structures et trouver des boucliers quand ça déraille
import csv
import time
MauvaiseListedesRayons = []
ListedesRayons = []  # Il faut définir les variables, listes, etc.
# Pourquoi MauvaiseListedesRayons=ListedesRayons=[] fera une erreur?
# ficCercles="cercles" #le fichier qu'on va lire
nomPythonDuFichierCercles = csv.reader(
	open("../Donnees/Chiffres/cercles.tsv", 'r', encoding='UTF-8'), delimiter='\t')
# csv.reader s'occupe aussi de l'\n, qui risque d'être conservé (pour r) si on l'oublie et si l'on fait
# un:  x,y, r=chaqueligne.split("\t")

lignesCercles = list(nomPythonDuFichierCercles)
print('Première ligne: ', lignesCercles[0][1])
# On enlève l'en-tête et on le met dans une "variable"
entete = lignesCercles.pop(0)
# C'est en fait une liste: entete[1] vaut "Y", comme lignesCercles[0][1]
print(type(entete))
print(type(lignesCercles))  # Idem

for chaqueligne in lignesCercles:
	print("Nouvelle ligne ", chaqueligne)
	print("L'objet chaqueligne est du type ", type(chaqueligne))
	x, y, r = chaqueligne  # Étrangement, ça marche...
	print('Le rayon vaut ', r)
	time.sleep(1)  # Très utile pour comprendre ce qui va (ou pas)
#	Erreur fatale:
	MauvaiseListedesRayons.append(r)
	print("La mauvaise liste: ", MauvaiseListedesRayons,
	      " son min vaut ", min(MauvaiseListedesRayons))
	ListedesRayons.append(int(r))
	print("La bonne liste: ", ListedesRayons,
	      ", son min vaut ", min(ListedesRayons))
	print(type(ListedesRayons), "\n")
#	input("coucou")
exit()  # Utile pour dire à python de s'arrêter là
#Attention, la syntaxe qui suit doit être correcte

#Ici une "ligne =? à mauvaise syntaxe
#Min et max
print('Le min des trois nombres est ', min([12, 5, 4]))
