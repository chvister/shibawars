import json
from pathlib import Path
import ipfsApi
import requests

tokens = 118

api = ipfsApi.Client('127.0.0.1', 5001)
API_KEY = "3e45d32f73556a64b17e"
SECRET_KEY = "aa5ca76b7e320f16cec5b29e638a1f111119fbdaae47a3bdaf71ecc72d453ba2"

def main():
    write_metadata()

def write_metadata():
    for token_id in range (tokens):
        metadata_file_name = "./metadata/token_metadata/" + str(token_id) + ".json"
        if Path(metadata_file_name).exists():
            print("Metadata exists")
        else:
            imgPath = "../../SHIBAWARS/img_old/token-" + str(token_id) + ".png"
            if Path(imgPath).exists():
                print("Creating metadata")
                image = upload_to_ipfs(imgPath, token_id)
                values = {
                    "name": get_name(token_id), 
                    "description": get_description(token_id),
                    "image": image, 
                    "attributes" : [
                        {"trait_type" : "Generation", "value" : 0}
                    ]
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

def get_name(token_id):
    if token_id == 100:
        return "Lucky Shiba Pack Gen #1"
    elif token_id == 101:
        return "Shibawars Supporter Badge"
    elif token_id == 102:
        return "TEAM OP SHIBA"
    elif token_id == 103:
        return "WoofMeister"
    elif token_id == 104:
        return "Shiba Whale"
    elif token_id == 105:
        return "OG Shiba"
    elif token_id == 106:
        return "Shiba Warlord"
    elif token_id == 107:
        return "Shiba Warrior"
    elif token_id == 108:
        return "Doge Killer"
    elif token_id == 109:
        return "Aggresive Shiba Inu"
    elif token_id == 110:
        return "Bored Shiba Inu"
    elif token_id == 111:
        return "Shiba Inu"
    elif token_id == 112:
        return "Aggresive Shiba Pup"
    elif token_id == 113:
        return "Shib Pup"
    elif token_id == 114:
        return "Doge Father"
    elif token_id == 115:
        return "Floki"
    elif token_id == 116:
        return "Ryoshi"
    elif token_id == 117:
        return "Shiba General"
    elif token_id == 1:
        return "Iron Leash"
    elif token_id == 2:
        return "Silver Leash"
    elif token_id == 3:
        return "Golden Leash"
    elif token_id == 4:
        return "Diamond Leash"
    else:
        return ""

def get_description(token_id):
    if token_id == 100:
        return "Open for a chance to get a very rare Doge, including the WoofMeister themself."
    elif token_id == 101:
        return "Shibawars Supporter Badge"
    elif token_id == 102:
        return "BIG STRONG DOG"
    elif token_id == 103:
        return "The one who has power over all the dogs. We look up to you and believe in you."
    elif token_id == 104:
        return "The true holders of the ShibaArmy."
    elif token_id == 105:
        return "They were here since the beginning. The true loyal ones."
    elif token_id == 106:
        return "These dogs lead the ShibArmy forward."
    elif token_id == 107:
        return "One bark, and they are in the battle."
    elif token_id == 108:
        return "This Shiba is on its infinite blood path."
    elif token_id == 109:
        return "Somebody did something to this shiba and it's seeking a revenge."
    elif token_id == 110:
        return "Somebody queue him to arena or something..."
    elif token_id == 111:
        return "A regular shiba inu, ready to fight"
    elif token_id == 112:
        return "A small cute doggo, but you should better stay away!"
    elif token_id == 113:
        return "AWWWWWWWWWWWWWWWWWW"
    elif token_id == 114:
        return "A friend should always underestimate your virtues and an enemy overestimate your faults."
    elif token_id == 115:
        return "Cute pup that is ready to defend the Doge Father.W"
    elif token_id == 116:
        return "The one who took us under their wings. Ryoshi."
    elif token_id == 117:
        return "When the times are difficult, the Shiba Generals embrace the morale of ShibaArmy."
    elif token_id == 1:
        return "Increases the stats of your shiba in fight by 15%"
    elif token_id == 2:
        return "Increases the stats of your shiba in fight by 20%"
    elif token_id == 3:
        return "Increases the stats of your shiba in fight by 25%"
    elif token_id == 4:
        return "Increases the stats of your shiba in fight by 30%"
    else:
        return ""

main()