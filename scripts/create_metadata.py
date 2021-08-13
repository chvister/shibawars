import json
from pathlib import Path
import ipfsApi
import requests

tokens = 21

api = ipfsApi.Client('127.0.0.1', 5001)
API_KEY = "e792de1e4aff38e5d97a"
SECRET_KEY = "3a083806b61dd024b640d51ec22c7cf9f9895b719691ba7c75563222923e8c28"

def main():
    write_metadata()

def write_metadata():
    for token_id in range (tokens):
        metadata_file_name = "./metadata/token_metadata/" + str(token_id) + ".json"
        if Path(metadata_file_name).exists():
            print("Metadata exists")
        else:
            print("Creating metadata")
            imgPath = "./client/img/token-" + str(token_id) + ".png"
            image = upload_to_ipfs(imgPath, token_id)
            values = {
                "name": get_name(token_id), 
                "description": get_description(token_id),
                "image": image, 
                "attributes" : []
            }
            jsonString = json.dumps(values)
            jsonFile = open(metadata_file_name, "w")
            jsonFile.write(jsonString)
            jsonFile.close()

def upload_to_ipfs(filePath, token_id):
    with Path(filePath).open("rb") as fp:
        image_binary = fp.read()
        ipfs_url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
        response = requests.post(ipfs_url, 
            files = {"file": image_binary},
            headers = { "pinata_api_key" : API_KEY, "pinata_secret_api_key" : SECRET_KEY})
        ipfs_hash = response.json()["IpfsHash"]
        image_uri = "https://ipfs.io/ipfs/{}?filename=token-{}.png".format(ipfs_hash, token_id)
        print(image_uri)
        return image_uri
    return None

def get_name(token_id):
    if token_id == 0:
        return "Bojar da Killa"
    elif token_id == 1:
        return "Kaya the Wolfmother"
    elif token_id == 2:
        return "WoofMeister"
    elif token_id == 3:
        return "Shiba Whale"
    elif token_id == 4:
        return "OG Shiba"
    elif token_id == 5:
        return "Shiba Warlord"
    elif token_id == 6:
        return "Shiba Warrior"
    elif token_id == 7:
        return "Doge Killer"
    elif token_id == 8:
        return "Aggresive Shiba Inu"
    elif token_id == 9:
        return "Bored Shiba Inu"
    elif token_id == 10:
        return "Shiba Inu"
    elif token_id == 11:
        return "Aggresive Shiba Pup"
    elif token_id == 12:
        return "Shib Pup"
    elif token_id == 13:
        return "Lucky Doge Pack Gen #1"
    elif token_id == 14:
        return "Doge Father"
    elif token_id == 15:
        return "Golden Doge"
    elif token_id == 16:
        return "Ryoshi"
    elif token_id == 17:
        return "Iron Leash"
    elif token_id == 18:
        return "Silver Leash"
    elif token_id == 19:
        return "Golden Leash"
    elif token_id == 20:
        return "Diamond Leash"
    else:
        return ""

def get_description(token_id):
    if token_id == 0:
        return "Altough he's not a shiba, do not mess with him. The warden of order."
    elif token_id == 1:
        return "She may be cute, but she will get you. Beware, she bites."
    elif token_id == 2:
        return "The one who has power over all the dogs. We look up to you and believe in you."
    elif token_id == 3:
        return "The true holders of the ShibaArmy."
    elif token_id == 4:
        return "They were here since the beginning. The true loyal ones."
    elif token_id == 5:
        return "Altough they may not be recognized, they do lead the ShibArmy forward."
    elif token_id == 6:
        return "One bark, and they are in the battle."
    elif token_id == 7:
        return "All doges are family. But this is a doge killer."
    elif token_id == 8:
        return "Somebody did something to this shiba and it's seeking a revenge."
    elif token_id == 9:
        return "Somebody queue him to arena or something..."
    elif token_id == 10:
        return "A regular shiba inu, ready to fight"
    elif token_id == 11:
        return "A small cute doggo, but you should better stay away!"
    elif token_id == 12:
        return "AWWWWWWWWWWWWWWWWWW"
    elif token_id == 13:
        return "Open for a chance to get a very rare Doge, including the WoofMeister themself."
    elif token_id == 14:
        return "A friend should always underestimate your virtues and an enemy overestimate your faults."
    elif token_id == 15:
        return "A member of very rare race of golden shiba inus"
    elif token_id == 16:
        return "The one who took us under their wings. Ryoshi."
    elif token_id == 17:
        return "Increases the stats of your doge in fight by 15%"
    elif token_id == 18:
        return "Increases the stats of your doge in fight by 20%"
    elif token_id == 19:
        return "Increases the stats of your doge in fight by 25%"
    elif token_id == 20:
        return "Increases the stats of your doge in fight by 30%"
    else:
        return ""

main()

#
#backgrounds = 1
#shibas = 1
#chains = 2
#
#def main():
#    print("Working on" + network.show_active())
#    for bgIndex in range(backgrounds):
#        for shibaIndex in range(shibas):
#            for chainIndex in range(chains):
#
#                