import json
from pathlib import Path
import random
import ipfsApi
import requests
import random

api = ipfsApi.Client('127.0.0.1', 5001)
API_KEY = "e792de1e4aff38e5d97a"
SECRET_KEY = "3a083806b61dd024b640d51ec22c7cf9f9895b719691ba7c75563222923e8c28"

LUCKY_SHIBA_PACK_GEN_1 = 100
SHIBAWARS_SUPPORTER = 101
BOJAR_DA_KILLA = 102
KAYA_THE_WOLFMOTHER = 103
WOOFMEISTER = 104
SHIBA_WHALE = 105
OG_SHIBA = 106
SHIBA_WARLORD = 107
SHIBA_WARRIOR = 108
DOGE_KILLER = 109
AGGRESIVE_SHIBA_INU = 110
BORED_SHIBA_INU = 111
SHIBA_INU = 112
AGGRESIVE_SHIBA_PUP = 113
SHIBA_PUP = 114
DOGE_FATHER = 115
FLOKI = 116
RYOSHI = 117
SHIBA_GENERAL = 118

IRON = 1
SILVER = 2
GOLDEN = 3
DIAMOND = 4

def main():
    write_metadata(SHIBA_WARRIOR, backgrounds = 1, earrings = 2, eyes = 3, heads = 5, necklaces = 1, miscs = 7, weapons = 1)

def write_metadata(shibaId, backgrounds, earrings, eyes, heads, necklaces, miscs, weapons):
    combinations = backgrounds * (earrings if (earrings > 0) else 1) * (eyes if (eyes> 0) else 1) * (heads if (heads > 0) else 1) * (necklaces if (necklaces > 0) else 1) * (miscs if (miscs > 0) else 1) * (weapons if (weapons > 0) else 1)
    print(combinations)
    ids = list(range(0,  combinations))
    random.shuffle(ids)
    for bgI in range(0, backgrounds):
        for earringI in range(0, (earrings if (earrings > 0)  else 1)):
            for eyeI in range(0, (eyes if (eyes > 0)  else 1)):
                for headI in range(0, (heads if (heads > 0)  else 1)):
                    for neckI in range(0, (necklaces if (necklaces > 0)  else 1)):
                        for miscI in range(0, (miscs if (miscs > 0)  else 1)):
                            for weaponI in range(0, (weapons if (weapons > 0)  else 1)):
                                id = ids.pop()
                                tokenId = (shibaId * 1000000) + id
                                metadata_file_name = "./metadata/token_metadata/" + str(tokenId) + ".json"
                                if Path(metadata_file_name).exists():
                                    print("Metadata exists")
                                else:
                                    imgPath = "../../SHIBAWARS/shibas/{}{}{}{}{}{}{}{}.png".format(shibaId, bgI, eyeI if(eyes > 0) else "", headI if(heads > 0) else "", miscI if(miscs > 0) else "", neckI if(necklaces > 0) else "", weaponI if(weapons > 0) else "", earringI if(earrings > 0) else "")
                                    if Path(imgPath).exists():
                                        print("Creating metadata")
                                        image = upload_to_ipfs(imgPath, tokenId)
                                        values = {
                                            "name": get_name(shibaId), 
                                            "description": get_description(shibaId),
                                            "image": image, 
                                            "attributes" : [
                                                {"trait_type" : "Generation", "value" : 1},
                                                {"trait_type" : "Rarity", "value" : getRarity(shibaId)},
                                                {"trait_type" : "Background", "value" : backgroundName(shibaId, bgI)},
                                                {"trait_type" : "Earring", "value" : earringName(shibaId, earringI)},
                                                {"trait_type" : "Eyes", "value" : eyeName(shibaId, eyeI)},
                                                {"trait_type" : "Headgear", "value" : headName(shibaId, headI)},
                                                {"trait_type" : "Necklace", "value" : necklaceName(shibaId, neckI)},
                                                {"trait_type" : "Miscellanous", "value" : miscName(shibaId, miscI)},
                                                {"trait_type" : "Weapon", "value" : weaponName(shibaId, weaponI)}
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
    if token_id == LUCKY_SHIBA_PACK_GEN_1:
        return "Lucky Shiba Pack Gen #1"
    elif token_id == SHIBAWARS_SUPPORTER:
        return "Shibawars Supporter Badge"
    elif token_id == BOJAR_DA_KILLA:
        return "Bojar da Killa"
    elif token_id == KAYA_THE_WOLFMOTHER:
        return "Kaya the Wolfmother"
    elif token_id == WOOFMEISTER:
        return "WoofMeister"
    elif token_id == SHIBA_WHALE:
        return "Shiba Whale"
    elif token_id == OG_SHIBA:
        return "OG Shiba"
    elif token_id == SHIBA_WARLORD:
        return "Shiba Warlord"
    elif token_id == SHIBA_WARRIOR:
        return "Shiba Warrior"
    elif token_id == DOGE_KILLER:
        return "Doge Killer"
    elif token_id == AGGRESIVE_SHIBA_INU:
        return "Aggresive Shiba Inu"
    elif token_id == BORED_SHIBA_INU:
        return "Bored Shiba Inu"
    elif token_id == SHIBA_INU:
        return "Shiba Inu"
    elif token_id == AGGRESIVE_SHIBA_PUP:
        return "Aggresive Shiba Pup"
    elif token_id == SHIBA_PUP:
        return "Shib Pup"
    elif token_id == DOGE_FATHER:
        return "Doge Father"
    elif token_id == FLOKI:
        return "Floki"
    elif token_id == RYOSHI:
        return "Ryoshi"
    elif token_id == SHIBA_GENERAL:
        return "Shiba General"
    elif token_id == IRON:
        return "Iron Leash"
    elif token_id == SILVER:
        return "Silver Leash"
    elif token_id == GOLDEN:
        return "Golden Leash"
    elif token_id == DIAMOND:
        return "Diamond Leash"
    else:
        return ""

def get_description(token_id):
    if token_id == LUCKY_SHIBA_PACK_GEN_1:
        return "Open for a chance to get a very rare Doge, including the WoofMeister themself."
    elif token_id == SHIBAWARS_SUPPORTER:
        return "Shibawars Supporter Badge"
    elif token_id == BOJAR_DA_KILLA:
        return "Altough he's not a shiba, do not mess with him. The warden of order."
    elif token_id == KAYA_THE_WOLFMOTHER:
        return "She may be cute, but she will get you. Beware, she bites."
    elif token_id == WOOFMEISTER:
        return "The one who has power over all the dogs. We look up to you and believe in you."
    elif token_id == SHIBA_WHALE:
        return "The true holders of the ShibaArmy."
    elif token_id == OG_SHIBA:
        return "They were here since the beginning. The true loyal ones."
    elif token_id == SHIBA_WARLORD:
        return "These dogs lead the ShibArmy forward."
    elif token_id == SHIBA_WARRIOR:
        return "One bark, and they are in the battle."
    elif token_id == DOGE_KILLER:
        return "This Shiba is on its infinite blood path."
    elif token_id == AGGRESIVE_SHIBA_INU:
        return "Somebody did something to this shiba and it's seeking a revenge."
    elif token_id == BORED_SHIBA_INU:
        return "Somebody queue him to arena or something..."
    elif token_id == SHIBA_INU:
        return "A regular shiba inu, ready to fight"
    elif token_id == AGGRESIVE_SHIBA_PUP:
        return "A small cute doggo, but you should better stay away!"
    elif token_id == SHIBA_PUP:
        return "AWWWWWWWWWWWWWWWWWW"
    elif token_id == DOGE_FATHER:
        return "A friend should always underestimate your virtues and an enemy overestimate your faults."
    elif token_id == FLOKI:
        return "Doge Father's young pup"
    elif token_id == RYOSHI:
        return "The one who took us under their wings. Ryoshi."
    elif token_id == SHIBA_GENERAL:
        return "When the times are difficult, the Shiba Generals embrace the morale of ShibaArmy."
    elif token_id == IRON:
        return "Increases the stats of your shiba in fight by 15%"
    elif token_id == SILVER:
        return "Increases the stats of your shiba in fight by 20%"
    elif token_id == GOLDEN:
        return "Increases the stats of your shiba in fight by 25%"
    elif token_id == DIAMOND:
        return "Increases the stats of your shiba in fight by 30%"
    else:
        return ""

def getRarity(token_id):
    # common - can be bought
    # rare - can be found with <= 10%
    # epic - can be found with <= 1%
    # legendary - can be found with <= 0.1%
    # mythical - can be found with <= 0.01%
    # limited supply - according to % of supply, epic at lowest
    # exclusive - epic
    if token_id == BOJAR_DA_KILLA:
        return "Mythical"
    elif token_id == KAYA_THE_WOLFMOTHER:
        return "Mythical"
    elif token_id == WOOFMEISTER:
        return "Mythical"
    elif token_id == SHIBA_WHALE:
        return "Legendary"
    elif token_id == OG_SHIBA:
        return "Epic"
    elif token_id == SHIBA_WARLORD:
        return "Epic"
    elif token_id == SHIBA_WARRIOR:
        return "Epic"
    elif token_id == DOGE_FATHER:
        return "Legendary"
    elif token_id == FLOKI:
        return "Rare"
    elif token_id == RYOSHI:
        return "Epic"
    elif token_id == SHIBA_GENERAL:
        return "Epic"
    else:
        return "Common"

def backgroundName(tokenId, id):
    if (tokenId == SHIBA_WARRIOR):
        if(id == 0):
            return "Shiba Castle"
    elif (tokenId == SHIBA_WARLORD):
        if(id == 0):
            return "Boneyard"
    return ""

def earringName(tokenId, id):
    if (tokenId == SHIBA_WARRIOR):
        if(id == 0):
            return "Single earring"
        elif(id == 1):
            return "Triple earring"
    elif (tokenId == SHIBA_WARLORD):
        if(id == 0):
            return "Septum"
    return "None"

def eyeName(tokenId, id):
    if (tokenId == SHIBA_WARRIOR):
        if(id == 0):
            return "Blind"
        elif(id == 1):
            return "Bloody"
        elif(id == 2):
            return "Normal"
    return "Normal"

def headName(tokenId, id):
    if (tokenId == SHIBA_WARRIOR):
        if(id == 0):
            return "Silver Helmet"
        elif(id == 1):
            return "Golden Helmet"
        elif(id == 2):
            return "Kawaii Helmet"
        elif(id == 3):
            return "Bronze Helmet"
        elif(id == 4):
            return "Diamond Helmet"
    elif (tokenId == SHIBA_WARLORD):
        if(id == 0):
            return "Viking Hair"
    return "None"

def necklaceName(tokenId, id):
    if (tokenId == SHIBA_WARRIOR):
        if(id == 0):
            return "Bone Necklace"
    elif (tokenId == SHIBA_WARLORD):
        if(id == 0):
            return "Rib Necklace"
    return "None"

def miscName(tokenId, id):
    if (tokenId == SHIBA_WARRIOR):
        if(id == 0):
            return "Bloody Teeth"
        elif(id == 1):
            return "Iron Armor"
        elif(id == 2):
            return "Silver Armor"
        elif(id == 3):
            return "Diamond Armor"
        elif(id == 4):
            return "Golden Armor"
        elif(id == 5):
            return "Bronze Armor"
        elif(id == 6):
            return "Kawaii Armor"
    elif (tokenId == SHIBA_WARLORD):
        if(id == 0):
            return "Bloody Teeth"
        elif(id == 1):
            return "Black Battle Painting"
        elif(id == 2):
            return "Red Battle Painting"
    return "None"

def weaponName(tokenId, id):
    if (tokenId == SHIBA_WARRIOR):
        if(id == 0):
            return "Knife"
    elif (tokenId == SHIBA_WARLORD):
        if(id == 0):
            return "Battle Axe"
    return ""

main()             