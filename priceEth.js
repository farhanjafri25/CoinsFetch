const { default: axios } = require("axios");

//A custom response object from the price list API
const respObj = {
    "0xb9ef770b6a5e12e45983c5d80545258aa38f3b78": {
        "usd": 0.329295
    },
    "0x4594cffbfc09bc5e7ecf1c2e1c1e24f0f7d29036": {
        "usd": 0.00203447
    }
}

//Coin object to check for the price of desired coins
const coinObject = {
    "ethereum": "ethereum",
    "arbitrum-one": "arbitrum-one",
    "polygon-pos": "polygon-pos",
    "binance-smart-chain" : "binance-smart-chain"
};


//A custom response object from coins list API
const pricesList = [
    {
        "id": "01coin",
        "symbol": "zoc",
        "name": "01coin",
        "platforms": {}
    },
    {
        "id": "0chain",
        "symbol": "zcn",
        "name": "Zus",
        "platforms": {
            // "ethereum": "0xb9ef770b6a5e12e45983c5d80545258aa38f3b78",
            "polygon-pos": "0x8bb30e0e67b11b978a5040144c410e1ccddcba30"
        }
    },
    {
        "id": "0-knowledge-network",
        "symbol": "0kn",
        "name": "0 Knowledge Network",
        "platforms": {
            "ethereum": "0x4594cffbfc09bc5e7ecf1c2e1c1e24f0f7d29036"
        }
    },
    {
        "id": "0-mee",
        "symbol": "ome",
        "name": "O-MEE",
        "platforms": {
            "ethereum": "0xbd89b8d708809e7022135313683663911826977e"
        }
    },
    {
        "id": "0vix-protocol",
        "symbol": "vix",
        "name": "0VIX Protocol",
        "platforms": {}
    },
    {
        "id": "0vm",
        "symbol": "zerovm",
        "name": "0VM",
        "platforms": {
            "binance-smart-chain": "0x1a8e64b7d6c34d46671f817c0ffa041cd9cee87d"
        }
    },
    {
        "id": "0x",
        "symbol": "zrx",
        "name": "0x Protocol",
        "platforms": {
            "ethereum": "0xe41d2489571d322189246dafa5ebde1f4699f498",
            "energi": "0x591c19dc0821704bedaa5bbc6a66fee277d9437e",
            "harmony-shard-0": "0x8143e2a1085939caa9cef6665c2ff32f7bc08435",
            "avalanche": "0x596fa47043f99a4e0f122243b841e55375cde0d2"
        }
    },
    {
        "id": "0x0-ai-ai-smart-contract",
        "symbol": "0x0",
        "name": "0x0.ai: AI Smart Contract",
        "platforms": {
            "ethereum": "0x5a3e6a77ba2f983ec0d371ea3b475f8bc0811ad5"
        }
    },
    {
        "id": "0x1-tools-ai-multi-tool",
        "symbol": "0x1",
        "name": "0x1.tools: AI Multi-tool",
        "platforms": {
            "ethereum": "0xfcdb9e987f9159dab2f507007d5e3d10c510aa70"
        }
    },
    {
        "id": "0xaiswap",
        "symbol": "0xaiswap",
        "name": "0xAISwap",
        "platforms": {
            "ethereum": "0x8c6778023c3d4fd79ddd14810079f64c39e9e43d"
        }
    },
    {
        "id": "0xanon",
        "symbol": "0xanon",
        "name": "0xAnon",
        "platforms": {
            "ethereum": "0x7199b5a15c7fb79aa861780230adc65fff99ec73"
        }
    },
    {
        "id": "0xblack",
        "symbol": "0xb",
        "name": "0xBlack",
        "platforms": {
            "ethereum": "0xfc226294dafb6e69905b3e7635b575d0508a42c5"
        }
    },
    {
        "id": "0xcoco",
        "symbol": "coco",
        "name": "0xCoco",
        "platforms": {
            "ethereum": "0xcb50350ab555ed5d56265e096288536e8cac41eb"
        }
    },
    {
        "id": "0xconnect",
        "symbol": "0xcon",
        "name": "0xConnect",
        "platforms": {
            "ethereum": "0x29ef81cc8737f19449d501396d4968d138140675"
        }
    },
    {
        "id": "0xdao",
        "symbol": "oxd",
        "name": "0xDAO",
        "platforms": {
            "fantom": "0xc165d941481e68696f43ee6e99bfb2b23e0e3114"
        }
    }]

//Fuction to fetch coins list
async function getCoinList() {
	try {
		// const pricesList = await axios.get(
		// 	`https://api.coingecko.com/api/v3/coins/list?include_platform=true`
        // );
        // const data = pricesList?.data || [];
		await getCoinsHashVal(pricesList);
    } catch (error) {
        console.log(`getCoinList error`, error);
    }
}

//Fuction to get coins hash value 
async function getCoinsHashVal(data) {
    try {
        //Creating a hashobject which will store the hash value corresponding to a coin id
        const hashObj = {}
        data.map((ele) => {
            //Check if platform is not empty
            if (Object.keys(ele.platforms).length > 0) {
                let matchingKey = null;
                //if platform is not empty fetch the hashvalue and store in object, 
                //I am storing only one key of presesnt in the platforms object 
                for (const key in coinObject) {
                    if ((ele.platforms).hasOwnProperty(key)) {
                        console.log(`matching key`, key)
                        matchingKey = key;
                        //Push all the hash value for a particular platform key in an object
                        if (hashObj.hasOwnProperty(matchingKey)) {
                            hashObj[matchingKey].push(ele.platforms[matchingKey])
                        } else {
                            hashObj[matchingKey] = [ele.platforms[matchingKey]];
                        }
                        break;
                    }
                }
            }
        })
        console.log(hashObj);
        await getCoinsPrice(hashObj)
    } catch (error) {
        console.log(`error getCoinsHashVal`, error);
    }
}
//Get coins prices based on the hashvalue recieved
async function getCoinsPrice(valueObject) {
    try {
        const objectValues = Object.entries(valueObject);
        objectValues.forEach(([key, value]) => {
            console.log(value);
            //Dynamic API call which fetches data from key and the addresses passed
            // const resp = await axios.get(`https://api.coingecko.com/api/v3/simple/token_price/${key}?contact_addresses=${value}
            // &vs_currencies=usd`)
            // const valueData = resp;
            mergeValueDataWithData(respObj, pricesList);
        });
    } catch (error) {
        console.log(`getCoinsPrice error`,error);
    }
}

//Function to merge the value data and the main coins list
function mergeValueDataWithData(valueData, coinsListData) {
    /*Loop through the recieved data object, check it in the main coins list,
    if present add the price key to the coins lit object
    */
    coinsListData.map((ele) => {
        for (const key in (ele.platforms)) {
            const hashVal = ele.platforms[key];
            if (valueData.hasOwnProperty(hashVal)) {
                ele['price'] = valueData[hashVal].usd
            }
        }
    });
    console.log(`coinstListData`, coinsListData);
    return;
}

getCoinList();

