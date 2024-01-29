import pprint
import json

# JSON file
f = open ('data.json', "r")

# Reading from file
data = json.loads(f.read())

pprint.pprint(data.keys())

pprint.pprint(data,depth=1)

pprint.pprint(data,depth=2)