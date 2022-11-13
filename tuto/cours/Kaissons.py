import csv 
seuils=[25,28,31,35,40]
couleurs=['rgb(255,255,100)' , 'rgb(255,240,60)' , 'rgb(255, 180, 30)' , 'rgb(255, 120, 30)', 'rgb(220, 60, 20)', 'rgb(120, 0, 0)']
nbseuils=int(len(seuils)) #5
ListeNumDesSeuils = list(range(nbseuils))

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
#print (caissonSup,textecaissonSup)

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
print (touscaissons)

