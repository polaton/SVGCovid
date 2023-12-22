import math

def lat_lon_to_xy(latitude, longitude, width, height):
    # Conversion de la latitude et de la longitude en radians
    lat_rad = math.radians(latitude)
    lon_rad = math.radians(longitude)

    # Projection Mercator
    x = (longitude + 180) * (width / 360)
    y = height / 2 - (width * math.log(math.tan(math.pi / 4 + lat_rad / 2)) / (2 * math.pi))

    return x, y

# Dimensions de la carte SVG
width, height = 420, 202  # Exemple de dimensions

# Exemple de coordonnées
latitude, longitude = 0, 0  # Centree

# Calcul des positions X et Y
x, y = lat_lon_to_xy(latitude, longitude, width, height)
print(f"Position X: {x}, Position Y: {y}")