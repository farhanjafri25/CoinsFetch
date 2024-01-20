const { default: axios } = require("axios");


//Coin object to check for the price of desired coins
const coinObject = {
	ethereum: "ethereum",
	"arbitrum-one": "arbitrum-one",
	"polygon-pos": "polygon-pos",
	"binance-smart-chain": "binance-smart-chain",
};


const queryPayload = 3;

function encodeArrayValues(array) {
	const encodedString = array.map((value) => value.toString()).join("%2C");
	return encodedString;
}

//Helper function to stop the no of requests sent to avoid 429 error code
async function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

//Fuction to fetch coins list
async function getCoinList() {
	try {
		const pricesList = await axios.get(
			`https://api.coingecko.com/api/v3/coins/list?include_platform=true`,
			{
				maxContentLength: Infinity,
				maxBodyLength: Infinity,
			}
		);
		const data = pricesList?.data || [];
		await getCoinsHashVal(data);
	} catch (error) {
		console.log(`getCoinList error`, error);
	}
}

//Fuction to get coins hash value
async function getCoinsHashVal(coinsList) {
	try {
		//Creating a hashobject which will store the hash value corresponding to a coin id
		const hashObj = {};
		coinsList.map((ele) => {
			//Check if platform is not empty
			if (Object.keys(ele.platforms).length > 0) {
				let matchingKey = null;
				/* If platform is not empty fetch the hashvalue and store in object, 
                I am storing only one key of presesnt in the platforms object*/
				for (const key in coinObject) {
					if (ele.platforms.hasOwnProperty(key)) {
						console.log(`matching key`, key);
						matchingKey = key;
						//Push all the hash value for a particular platform key in an object
						if (hashObj.hasOwnProperty(matchingKey)) {
							hashObj[matchingKey].push(ele.platforms[matchingKey]);
						} else {
							hashObj[matchingKey] = [ele.platforms[matchingKey]];
						}
						break;
					}
				}
			}
		});
		await getCoinsPrice(hashObj, coinsList);
	} catch (error) {
		console.log(`error getCoinsHashVal`, error);
	}
}
//Get coins prices based on the hashvalue recieved
async function getCoinsPrice(valueObject, coinsList) {
	try {
		const objectValues = Object.entries(valueObject);
		for (let k = 0; k < objectValues.length; k++) {
			let key = objectValues[k][0];
			let value = objectValues[k][1];
			//Dynamic API call which fetches data from key and the addresses passed
			let i = 0;
			//While function call to send requests in chunks
			while (i < 10) {
				//slice the array values in order to remove large payload error
				let slicedValue = value.slice(i, i + queryPayload);
				try {
					const queryParams = {
						contract_addresses: encodeArrayValues(slicedValue),
						vs_currencies: "usd",
					};
					console.log(`contract_addresses`, queryParams.contract_addresses);
					let config = {
						method: "get",
						maxBodyLength: Infinity,
						url: `https://api.coingecko.com/api/v3/simple/token_price/${key}?contract_addresses=${queryParams.contract_addresses}&vs_currencies=usd`,
						headers: {
							accept: "application/json",
							Cookie:
								"__cf_bm=0.n4elDvNTh5FRUKVlL85eqNBHJ4X2YUASTWcQlmoz8-1705759144-1-AbfTaYswxxSzsIX3EF3u2nYcpjwEwCJQcfsEwMyP819yMW26KmkfHfdgN4OUMMy9FaVNI72cziVOwan3TM7KjKs=",
						},
					};
					axios
						.request(config)
						.then((response) => {
							console.log(JSON.stringify(response.data));
							mergeValueDataWithData(response.data, coinsList);
						})
						.catch((error) => {
							console.log(error);
						});

				} catch (error) {
					console.log(`get details error`, error);
				}
				i = i + queryPayload;
				await sleep(10000);
			}
		}
	} catch (error) {
		console.log(`getCoinsPrice error`, error);
	}
}

//Function to merge the value data and the main coins list
function mergeValueDataWithData(valueData, coinsListData) {
	/*Loop through the recieved data object, check it in the main coins list,
    if present add the price key to the coins lit object
    */
	coinsListData.map((ele) => {
		for (const key in ele.platforms) {
			const hashVal = ele.platforms[key];
			if (valueData.hasOwnProperty(hashVal)) {
				ele["price"] = valueData[hashVal].usd;
			}
		}
	});
	console.log(`coinstListData`, coinsListData);
	return;
}

getCoinList();
