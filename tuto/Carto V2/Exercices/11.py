import csv  # traitement csv
import re
import string
from bs4 import BeautifulSoup
import math

FicSource=csv.reader(open('../Donnees/Chiffres/abstention30pc.tsv','r',encoding='UTF-8'), delimiter='\t')
lignes=list(FicSource)
enTete = lignes.pop(0)

dictInfoCirc = {}

for lignecourante in lignes:
    ident=lignecourante[0]
    dictInfoCirc[ident] = {}
    dictInfoCirc[ident]["nbInscrits"]=lignecourante[1]
    dictInfoCirc[ident]["percAbstention"]=lignecourante[2]
    dictInfoCirc[ident]["partiAbsention"]=lignecourante[3]

with open("../Donnees/Cartes/carte2.html", "r",encoding='utf8') as FicFondorigine:
    DonneesHtml = FicFondorigine.read()  
    puree = BeautifulSoup(DonneesHtml, features="html.parser")

    circs=puree.find("g",{"id":"Circ"}).findAll("path")
    for circ in circs:
        print(circ["id"])
        tmpCircId = circ["id"].split("-")[0]
        print(tmpCircId)
        
        if puree.find("g",{"id":tmpCircId+"-TT"}) is None:
            child = BeautifulSoup('<g id="'+tmpCircId+'-TT" style="font-size:0.2px; font-family:Helvetica;" visibility="hidden"/>', features="html.parser")
            baseX = 6
            baseY = 45
            hauteurLigne = 0.4

            for i in range(0,4):
                grandchild = child.new_tag('text', attrs={"x":str(baseX),"y":str(-baseY + (i * hauteurLigne))})
                if i == 0:
                    grandchild.string=enTete[i]+" :" + tmpCircId
                elif i == 1:
                    grandchild.string=enTete[i]+" :" + dictInfoCirc[tmpCircId]["nbInscrits"]
                elif i == 2:
                    grandchild.string=enTete[i]+" :" + dictInfoCirc[tmpCircId]["percAbstention"]
                elif i == 3:
                    grandchild.string=enTete[i]+" :" + dictInfoCirc[tmpCircId]["partiAbsention"]
                print(enTete[i])
                child.g.append(grandchild)
        
            puree.new_tag(child)
            puree.svg.append(child)
        circ["onmouseover"] = "document.getElementById('"+tmpCircId+"-TT').setAttribute('visibility','visible')"
        circ["onmouseout"] = "document.getElementById('"+tmpCircId+"-TT').setAttribute('visibility','hidden')"

        circs=puree.find("g",{"id":"RPzoomcirc"}).findAll("path")
        for circ in circs:
            print(circ["id"])
            tmpCircId = circ["id"].split("-")[1]
            circ["onmouseover"] = "document.getElementById('"+tmpCircId+"-TT').setAttribute('visibility','visible')"
            circ["onmouseout"] = "document.getElementById('"+tmpCircId+"-TT').setAttribute('visibility','hidden')"

with open("../Donnees/Cartes/carte3.html", "wb") as f:
	f.write(puree.prettify("utf-8"))