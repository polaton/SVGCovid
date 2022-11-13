# Tout d'abord les commentaires, ils sont non multilignes et commencent par un #
# Pour exécuter un script Python on utilise la commande "python3 tutoPython.py Argument1 Argument2". 
# Sur certaines installations, la commande python est simplement "python" au lieu de "python3"

#Un programme python commence par les imports
import sys #appels systemes
import os #systeme de fichier
import csv #traitement csv
import json #traitement json
import re #expressions régulières (https://docs.python.org/3/library/re.html)
import random #génération aléatoire
import math #fonctions mathématiques
from datetime import date,datetime #gestion des dates

# pour gérer tout ce qui est modifications de HTML ou de XML, nous allons utiliser la librairie Beautiful Soup. Etant donné qu'elle n'est pas comprise dans l'installation initiale de Python, nous allons devoir la télécharger.
# Pour commencer on va installer PIP (le gestionnaire de paquets spour Python) : https://www.odoo.com/fr_FR/forum/aide-1/how-to-install-pip-in-python-3-on-ubuntu-18-04-167715 ( dans un terminal 'sudo apt update' puis 'sudo apt install python3-pip')
# Ensuite on va utiliser Pip pour installer Beautiful Soup: dans un terminal 'pip install beautifulsoup4'
from bs4 import BeautifulSoup

# sys.argv permet de récupérer le tableaux des arguments. Ils sont accessible via leur index, et l'index 0 correspond au nom du script
# On voit aussi que = sert à assigner une valeur à une variable
mode = sys.argv[1]
fichier = sys.argv[2]
# Le plus simple est de maintenant se rendre sur la dernière définition de fonction => main()

########################DEBUT DES FONCTIONS

def processCSV(fichier):
    # On charge le fichier CSV dans un csv.reader qui va transformer les lignes du CSV en tableau d'éléments, CSV reader prend en argument un fichier et d'autres options dont delimiter qui permet de définir le caractère délimitant dans un CSV
    # open(cheminFichier,modeOuverture,encoding='Encodage') permet d'ouvrir un fichier. cheminFichier est chemin vers le fichier sous forme de chaine de caractères './Cas.csv' , modeOuverture correspond au mode d'ouverture: r correspond à lecture, w à l'écriture, et d'autres modes sont disponibles, encoding=X définit l'utilisation d'un encodage particulier  
    inputFile = csv.reader(open(fichier,'r',encoding='UTF-8'), delimiter=',')
    # On transforme ensuite le contenu du CSV en une liste via la fonction list
    lines = list(inputFile)

    input("Appuyez sur une touche pour passer à la suite")
    print("Affichage des lignes du fichier "+fichier+" :")
    print(lines)

    # Souvent dans les CSV, on veut exclure les headers, pour ce faire, on peut utiliser pop(n) qui enlevera le n-ième élément d'une liste et le renverra
    # Ici, on va stocker le header du CSV pour s'en resservir plus tard. headerCSV est une liste
    headerCSV = lines.pop(0)
    print("headerCSV",headerCSV,type(headerCSV))
    input("Appuyez sur une touche pour passer à la suite")
    # On va ensuite créer un dictionnaire permettant de stocker nos résultats
    resultats = {}

    # On va ensuite traiter les lignes une par une via un for. Le for est très simple d'utilisation:
    for disque in lines:
        # On peut accéder ensuite aux données de la ligne comme on accéderait aux index d'un tableau
        print("Artiste:",disque[0],"Album:",disque[1])
        # Cette méthode est simple, mais quand on commence à avoir des fichiers avec beaucoup de colonnes on s'y perd vite
        
        # Pour y remédier, on peut utiliser le header CSV qu'on a extrait. A noter que le plus optimal serait de faire un fonction dédiée pour les actions suivantes, mais pour des raisons de facilité de lecture, j'ai choisi de ne pas le faire.
        # On commence par créer un dictionnaire vide qui va venir contenir les valeurs de notre ligne
        tmpDisque = {}
        # Ensuite on boucle sur les champs de notre header via une énumération: une énumération permet de récupérer deux valeurs en bouclant sur une liste, l'index (ici i) et la valeur à cet index (ici field)
        for i,field in enumerate(headerCSV): 
            tmpDisque[field] = disque[i]
            # Les deux lignes en dessous permettent de clarifier un peu la ligne au dessus
            if field=="genre":
                print("Mapping:",field,i,disque[i],tmpDisque[field])

        # L'opération au dessus (ligne 46) est complexe a décrire, mais en résultante, on aura un dictionnaire avec des clés correspondant à notre header csv, et des valeurs correspondant aux valeurs de la ligne qu'on est en train de traiter:
        print("TMPDisque:",tmpDisque)
        # On peut maintenant accéder de manière plus simple aux propriétés de notre liste
        print("Test propriétés:",tmpDisque["artiste"],tmpDisque["element"],tmpDisque["genre"])
        print(" ")


        # On peut aussi stocker les données de l'élément dans notre dictionnaire de resultat
        # Ici on stockera le genre et l'artiste de chaque element dans notre dictionnaire de resultats:
        resultats[tmpDisque["element"]] = {"Artiste":tmpDisque["artiste"],"Genre":tmpDisque["genre"],"Valeurs":[random.randrange(100),random.randrange(100),random.randrange(100),random.randrange(100)]}
        # On a utilisé random.randrange pour générer un tableau d'entiers entre 0 et 99 inclus
    
    # On va stocker les résultats du dans un fichier json. En effet, un dictionnaire en python peut être exporté sous forme de JSON.
    # On ouvre le fichier en mode écriture, puis on utilise json.dump qui convertit un dictionnaire en chaîne de caractères JSON.
    with open("resultats.json", "w",encoding='utf8') as outfile:
        json.dump(resultats, outfile, ensure_ascii=False)

    # De même, on peut récupérer le contenu d'un fichier JSON et le charger dans une variable dictionnaire
    # On ouvre le fichier et on utilise json.load pour convertir une chaîne de caractère json en un dictionnaire
    with open("resultats.json","r",encoding='utf8') as readFile:
        dictResultats = json.load(readFile)

    # On peut ajouter la date et l'heure du jour dans un fichier en l'ouvrant en mode append 'a'
    with open("executions", "a") as file_object:
        file_object.write(datetime.now().strftime("%d/%m/%Y %H:%M:%S")+"\n")

    # On peut ensuite lire le fichier ligne par ligne
    with open("executions", "r") as file_object:
        # On utilise ici une structure raccourcie qui permet de faire une action simple pour chaque ligne du fichier, en l'occurence, afficher la ligne
        [print(line) for line in file_object.readlines()]

    
    # Il existe d'autres fonctions sur les ouvertures de fichiers: https://www.pythontutorial.net/python-basics/python-read-text-file/

    input("Appuyez sur une touche pour passer à la suite")
    # Pour parcourir un dictionnaire, on peut boucler sur ses clés avec for:
    for element in dictResultats:
        # A noter que "element" contient juste la clé, et non sa valeur
        print(element)
        # Pour accéder à la valeur de cette clé, on utilisateur la ligne suivante.
        print(dictResultats[element])
        # Et pour plus de simplicité on peut stocker cette valeur dans une variable
        tmpValeur = dictResultats[element]
        # On peut ensuite utiliser les fonctions min et max pour détérminer les valeurs minimale et maximale de la liste Valeurs de notre dictionnaire.
        print(min(tmpValeur["Valeurs"]),tmpValeur["Valeurs"],max(tmpValeur["Valeurs"]))
    
    # Pour écrire dans un fichier du texte brut, on procèdre de la sorte: ouverture, écriture, fermeture.
    # A noter que le mode w créera le fichier s'il n'existe pas.
    f = open("infos.txt", "w")
    f.write("Il fait beau aujourd'hui")
    f.close()

    # Pour lire simplement le contenu d'un fichier, on utilise:
    f = open("infos.txt", "r")
    print(f.read())
    f.close()

    # Pour écrire dans un fichier CSV on utilise un CSV writer après avoir ouvert le fichier:
    with open('eggs.csv', 'w', newline='') as csvfile:
        spamwriter = csv.writer(csvfile, delimiter=';', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        # On peut écrire les lignes une par une 
        spamwriter.writerow(["Test","Test2","Test3"])
        # ou lui donner une liste de lignes
        spamwriter.writerows(lines)

    # Pour lister les fichiers dans à chemin, on utilise os.listdir(chemin). On recupère le nom des fichiers sous forme de liste
    print(os.listdir())
    # Et si on voulait traiter chaque fichier et dossier du répertoire, on pourrait boucler sur os.listdir(), puis par exemple ouvrir les fichiers.
    for file in os.listdir():
        print("Contenu présent:"+file)
        pass

    # Pour récupérer la date, on utilise:
    today = date.today()
    print("Nous sommes le ", today)
    # On peut aussi changer le formatage de sortie
    print("Nous sommes le ", today.strftime("%Y-%m-%d"))
    # Et on peut transformer une chaîne de caractères de date en datetime python. En indiquant la chaîne puis le format
    maDate = datetime.strptime("29/01/17 11:35:00", '%d/%m/%y %H:%M:%S')
    print("Une date est:",maDate.strftime("%Y-%m-%d %H:%M:%S"))
    # A noter qu'il existe énormément de fonctions sur les dates et le temps: https://o7planning.org/11443/python-date-time

    # Pour un appel système, rien de plus simple:
    os.system("ls -l")

    # Pour découper une chaîne de caractères, on utilisera split(caractère) qui renverra une liste
    tableauTest = "Bob&Bib&Bub&Bab".split("&")
    print(tableauTest)
    # On peut aussi vouloir fusionner une liste en utilisant un caractère de jointure
    chaineTest = " et ".join(tableauTest)
    print(chaineTest)
    # Pour finir, on peut aussi remplacer certains bouts de chaines par d'autres:
    chaineTest = chaineTest.replace("et","+")
    print(chaineTest)
    # Et on peut aussi tester la présence d'une chaine dans une autre avec in
    print("Bob" in chaineTest)
    print("Byb" in chaineTest)
    
    # Lower met la chaine en miniscule
    chaineTest = chaineTest.lower()
    print(chaineTest)
    # upper en majuscule
    chaineTest = chaineTest.upper()
    print(chaineTest)

    chaineTest="   Antoine   "
    # On peut utiliser startswith et endswith pour savoir si une chaine commence ou finit par une autre chaîne
    print(chaineTest.startswith("An"))
    print(chaineTest.endswith("ne"))
    # strip enlève les espaces de début et de fin
    chaineTest = chaineTest.strip()
    print(chaineTest)
    print(chaineTest.startswith("An"))
    print(chaineTest.endswith("ne"))
    # Comme pour une liste, on peut aussi subdiviser une chaîne comme ceci:
    print(chaineTest[:-1])
    print(chaineTest[0:4])

    nombre = 45.23168432164654654
    # Pour limiter le nombre de chiffres après la virgule: "%.nf" % variable , où n sera le nombre de chiffres
    print("%.2f" % nombre)

    # Pour ce qui est des regex, n'ayant pas une connaissance parfaite je propose une documentation assez complète: https://www.w3schools.com/python/python_regex.asp
    # Les exemples suivants proviennent de cette page:
    # On utilise search pour voir si une chaîne répond favorablement à une regex 
    print(re.search("pluie", "Il pleut en Espagne"))
    print(re.search("pleut", "Il pleut en Espagne"))

    # sub permet de remplacer n matches par une chaîne de caractères définie. Le 4ème paramètre n est facultatif, et s'il est omis, on remplacera toutes les occurences
    print(re.sub("a","o","Albi Aladdin Alibi BAlbi Bibal Liban Alddde Cyclade",5))





def processHtml():
    # on va charger un fichier HTML pour ensuite le parcourir et le manipuler:
    with open('svgTest.svg', 'r') as file:
        htmlData = file.read()
    
    # on utilise ensuite beautiful soup pour parser le html
    soup = BeautifulSoup(htmlData, features="html.parser")
    
    # on peut ensuite récupérer une balise spécifique avec la fonction .find(type de la balise,options)
    tooltipFinlande = soup.find("g", {"id": "FIN-TT"})
    print(tooltipFinlande)
    # on peut accéder au texte de l'élément via l'attribut text (cela enlèvera toutes les balises internes à la balise cible)
    print(tooltipFinlande.text)

    # Beautiful soup permet d'enchaîner les fonctions, ici on va par exemple sélectionner un élement, puis rechercher dans son contenu via findAll()
    listRectCaissons = soup.find("g", {"id": "caissons"}).findAll("rect")
    # On peut ensuite parcourir la liste des caissons et obtenir leurs couleurs. On accède aux propriétés de la balise comme pour un dictionnaire
    for rect in listRectCaissons:
        print(rect['fill'])

    # On va ensuite modifier les textes de légendes des différents caissons
    listTextCaissons = soup.findAll("text", {"class": "legText"})
    # On modifie le texte via la propriété via string
    for text in listTextCaissons:
        text.string = "On modifie le html"
        # De la même manière on peut modifier les propriétés
        text["x"] = 155
    # On peut ensuite voir nos changements répércutés sur le HTML
    for text in listTextCaissons:
        print(text)

    # Pour finir on peut sauvegarder le html en ecrivant le retour de la fonction prettify de Beautiful Soup
    with open("svg2.svg", "wb") as f:
        f.write(soup.prettify("utf-8"))

    # Modifications des path de cirsconscriptions
    with open('Antoine.html', 'r') as file:
        htmlData = file.read()

    inputFile = csv.reader(open("DataLeg",'r',encoding='UTF-8'), delimiter=';')
    lines = list(inputFile)

    dictResultats= {}

    for line in lines:
        dictResultats[line[0]] = float(line[1])
    
    print(dictResultats)

    soup = BeautifulSoup(htmlData, features="html.parser")

    circonscriptions = soup.findAll("path", {"class": "circonscription"})

    for circonscription in circonscriptions:
        print(circonscription['id'],dictResultats[circonscription['id']])
        circonscription['valeur'] = dictResultats[circonscription['id']]
        if (math.floor(circonscription['valeur']) % 2 == 1):
            circonscription['fill'] = 'purple'
        else:
            circonscription['fill'] = 'pink'
    
    with open("svg3.svg", "wb") as f:
        f.write(soup.prettify("utf-8"))



    # Beautiful Soup étant un outil très complet, en voici la documentation complète: https://www.crummy.com/software/BeautifulSoup/bs4/doc/



########################DEFINITION DU MAIN


# Le main est défini en dernier, c'est la fonction qui sera exécutée au lancement du programme. Ce comportement est du au bloc "if __name__" situé en dessous de la définition du main.
def main():
    # La première chose qu'on peut noter, c'est qu'en python, il y a peu de "ponctuation", en revanche si l'indentation n'est pas bonne, le programme plantera. On utilise une tabulation comme indentation.
    # Ici on voit que la définition de la fonction main est au premier niveau de tabulation mais que le code qui va venir en dessous est indenté à une tabulation
    
    # On a défini les variables stockant les arguments en dehors du corps de notre fonction, il faut donc utiliser la commande global pour récupérer la variable globale définie au début du programme
    global mode
    global fichier

    # print() est utilisé pour afficher du contenu dans la console, que ce soit une variable ou du texte. On peut afficher plusieurs valeurs en les séparant par des virgules ,
    # L'opérateur de concaténation de texte est +
    print("Mode:"+mode)
    print("Mode:"+mode,"Fichier:"+fichier)

    # Avant de passer à la suite, il faut parler des deux structures de données qu'on utilisera le plus dans ce tutoriel
    # La list: Elle se rapproche d'un tableau en Perl. C'est une structure ordonnée, modifiable et qui accepte les valeurs dupliquées. Pour en déclairer une, on utilisera les lignes suivantes:
    maListe = [] # Une vide
    maListe = [1,2,"aze","test",5] # Une remplie
    # On accède aux valeurs via l'index
    print("Liste1",maListe[2])
    print("Liste11",maListe[-1])
    print("Liste12",maListe[1:-1])
    # On ajoute des valeurs via .append()
    maListe.append("Ajout")
    print("Liste2",maListe)
    # Plus d'informations sur les listes ici : https://o7planning.org/11433/python-list

    # Le dictionary: C'est une structure de données basée sur le modèle clé/valeur. Elle est ordonnée et n'autorise pas les clés dupliquées, mais elle est modifiable.
    monDict = {} # Un vide
    monDict = {"Editeur":"Larousse","Année":1994,"Couleurs":True,"Pages":2500} #Un rempli
    # On accède aux valeurs via leur clé:
    print("Dict1",monDict["Editeur"],monDict["Pages"])
    # On peut tester si une clé est définie avec l'opérateur in. (Plus d'infos sur if plus bas)
    if "Couleurs" in monDict:
        print("Dict2",monDict["Couleurs"])
    if "Langue" in monDict:
        # Le programme ne devrait jamais passer ici puisqu'on a pas de clé Langue
        print("Dict3",monDict["Langue"])
    else:
        # On attribue ou on modifie la valeur d'une clé comme ceci
        monDict["Langue"] = "Français"
        print("Dict4",monDict)
    # On peut supprimer une clé du dictionnaire en utilisant .pop
    monDict.pop("Langue")
    print("Dict5",monDict)
    # Plus d'informations sur les dictionnaires ici: https://o7planning.org/11437/python-dictionary
    
    # On trouve aussi les tuples: https://o7planning.org/11435/python-tuple
    # Et les sets: https://www.w3schools.com/python/python_sets.asp
    # Ne m'en étant jamais servi, je ne les ai pas présenté plus en détails
    # A noter aussi qu'une liste peut contenir des dictionnaires ou d'autres listes. Et les valeurs des clés d'un dictionnaire peuvent elles aussi contenir des listes, des dictionnaires ou même des liste de dictionnaires!

    # On voit ici une structure simple de if. On le verra plus tard, mais pour informations le "et" s'écrit "and" et le "ou" s'écrit "or"
    # Pour comparer ou utiliser du texte, on utilise " " ou ' ' pour entourer le texte
    # Ce qui définit la fin du if c'est l'indentation. 
    if mode == "html":
        # Dans les 2 if, on exécute une fonction. Avant d'aller voir ce qu'elles font, on va descendre tout en bas du programme pour voir le code qui lance le main.
        processHtml()
    # Else if
    elif mode == "csv":
        processCSV(fichier)
    # Else
    else:
        print("Mode inconnu")

# C'est ce bloc qui va éxecuter notre fonction main au lancement du programme
if __name__ == "__main__":
    main()
# On peut maintenant retourner au commentaire ancre tout en haut pour regarder la fonction processCSV