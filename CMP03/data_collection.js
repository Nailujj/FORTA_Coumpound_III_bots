const ethers = require("ethers");
const fs = require("fs");
const { Parser } = require("json2csv");
require('dotenv').config();

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const Contract_address = '0xc3d688B66703497DAA19211EEdff47f25384cdc3';

const provider = new ethers.providers.AlchemyProvider('mainnet', ALCHEMY_API_KEY);

const abi = [
    "event Supply(address indexed from, address indexed dst, uint256 amount)",
    "event WithdrawCollateral(address indexed src, address indexed to, address indexed asset, uint256 amount)",
    "event Withdraw(address indexed src, address indexed to, uint256 amount)",
    "event Transfer(address indexed from, address indexed to, uint256 amount)",
    "event SupplyCollateral(address indexed from, address indexed dst, address indexed asset, uint256 amount)",
];

const iface = new ethers.utils.Interface(abi);

async function fetchSupplyEvents() {
    const toBlock = await provider.getBlockNumber();
    const fromBlock = toBlock - 100000;
    
    const logs = await provider.getLogs({
        address: Contract_address,
        topics: [],
        fromBlock,
        toBlock,
    });

    const csvData = [];

    logs.forEach(log => {
        const originalLog = {
            transactionHash: log.transactionHash,
            blockNumber: log.blockNumber,
            blockHash: log.blockHash,
            address: log.address,
            data: log.data,
            topics: log.topics.join(", "),
        };

        try {
            const decodedEvent = iface.parseLog(log);

            const decodedLog = {
                eventName: decodedEvent.name,
                ...decodedEvent.args,
            };

            csvData.push({ ...originalLog, ...decodedLog });
        } catch (err) {
            csvData.push({ ...originalLog, eventName: "Unknown Event", error: "Event konnte nicht dekodiert werden" });
        }
    });

    const fields = [
        "transactionHash",
        "blockNumber",
        "blockHash",
        "address",
        "data",
        "topics",
        "eventName",
        "from",
        "to",
        "dst",
        "src",
        "asset",
        "amount",
        "error"
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(csvData);

    fs.writeFileSync("event_logs.csv", csv);
    console.log("CSV-file successfully generated: event_logs.csv");
}

fetchSupplyEvents();
