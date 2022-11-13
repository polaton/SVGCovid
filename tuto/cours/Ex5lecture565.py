import os #systeme de fichier
import re #expressions régulières (https://docs.python.org/3/library/re.html)

seuilabst=30
fichierAbst="ResultatPourAbstentions"+str(seuilabst)+"pc"
resuAbst= open(fichierAbst, "w")
print (fichierAbst)
resuAbst.write ("Circ\tInscrits\tpcAbst\tpcPArtiAbst\n")
os.chdir("1erTourbis")
#print(os.listdir())

for fichier in os.listdir():
	if fichier.endswith("EGO"):
		circ=fichier
		circ=re.sub("EGO", "",str(circ)) #remplace
		print (circ)
		fauxdpt=int(circ[0:2])
		if fauxdpt < 96:
			circ=circ[1:5]
		else:
			pass
#On a les bonnes circonscriptions !				
		
		lignetmp=cand= nuance=nbvoix=pcinscrits=pcvoix=elu=""
		ok=0
		with open(fichier, "r",encoding='utf8') as circons:
			lignes=list(circons)
			for vraieligne in lignes:
#				print (type(vraieligne), " ZZZ ",vraieligne,"\n") 
				vraieligne = vraieligne.strip() #nettoyage	
				if vraieligne.startswith('Inscrits'):
#					print (vraieligne)
					inscrits,totalinscrits=vraieligne.split("\t")
					lignetmp=circ+"\t"+totalinscrits
#				else:
#					pass				
				if vraieligne.startswith('Abstentions'):
					abst,nbabst,pcabst=vraieligne.split("\t")
#					time.sleep(1)
					pcabst=float(pcabst)
					seuilabst=float(seuilabst)
		#Calcul du % du Parti des Abstentionnistes: commentaire en présentiel		
					pcpartiAbst=100*(pcabst-seuilabst) /(100-seuilabst)
					if pcpartiAbst>0:
						pcpartiAbst=pcpartiAbst
					else:
						pcpartiAbst=0
					pcpartiAbst="%.2f"  % pcpartiAbst
#					print ("Resu: ",pcpartiAbst)
#					lignetmp=circ+"\t"+str(pcabst)+"\t"+str(pcpartiAbst)
				else:
					pass
			lignetmp += "\t"+str(pcabst)+"\t"+str(pcpartiAbst)+"\n"
			resuAbst.write (lignetmp)

