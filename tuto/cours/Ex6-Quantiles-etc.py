# numpy.quantile() method
import numpy as np
import csv

fichierDentree="ResultatPourAbstentions30pc"
#Circ	Inscrits	pcAbst	pcPArtiAbst

numColonneIntuitif=4
numColPy=numColonneIntuitif-1

fichierLu = csv.reader(open(fichierDentree,'r',encoding='UTF-8'), delimiter='\t')
ListeNombres=[]
lignes = list(fichierLu)
enTete = lignes.pop(0) #s'il y a un en-tête descriptif

for chaqueligne in lignes:
#	print(chaqueligne[numColPy])
	ListeNombres.append(float(chaqueligne[numColPy]))
#print (ListeNombres)

quantiles=[1,2,3,4,5,6,7,8,9]
for q in quantiles:
	qsur10=q/10
#	print (qsur10)
	print("Quantile num ",q, " : ",np.quantile(ListeNombres, qsur10))

print ("Min: ",min(ListeNombres))
print ("Max: ",max(ListeNombres))

ecartType= np.std(ListeNombres, ddof=1) 
moyenne=np.mean(ListeNombres)
print ("Moyenne: ",moyenne)
print("Ecart-type: ",ecartType)

