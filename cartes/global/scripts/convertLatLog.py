import math

PI = 4 * math.atan2(1, 1)
def convert_coords(coords):
    print(1,repr(coords))
    lat,long = coords.split(" ")

    x = float(long)*math.cos(float(lat)*(PI/180))
    y = float(lat)
    return([x,y])
# long * cos (lat) -> x
#lat -> y 

with open("data") as file:
    for line in file:
        path_data = convert_coords(line.replace("\n", ""))
        print(2,path_data)

# Continuer le reste du script si nécessaire.