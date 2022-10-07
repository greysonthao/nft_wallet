use cosmwasm_std::Coin;
use cw721::Cw721ReceiveMsg;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::state::{Cw721Deposit, Offer};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct InstantiateMsg {
    pub admin: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    UpdateAdmin {
        admin: String,
    },
    ReceiveNft(Cw721ReceiveMsg),
    WithdrawNft {
        contract: String,
        token_id: String,
    },
    SubmitOffer {
        nft_owner: String,
        cw721_contract: String,
        token_id: String,
    },
    WithdrawOffer {
        cw721_contract: String,
        token_id: String,
    },
    AddToBlacklist {
        address: String,
    },
    RemoveFromBlacklist {
        address: String,
    },
    AcceptOffer {
        bidder_address: String,
        cw721_contract: String,
        token_id: String,
    },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    Cw721Deposits {
        address: String,
        contract: String,
    },
    Offers {
        owner: String,
        cw721_contract: String,
    },
    //QUERY NFT CONTRACT ADDRESSES -> Call Owner Of to see which tokens you own
    GetNftContracts {
        owner: String,
    }, //QUERY blacklisted addresses
    GetBlacklist {},
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct Cw721DepositResponse {
    pub deposits: Vec<Cw721Deposit>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct OfferResponse {
    pub offers: Vec<Offer>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct NftContractsResponse {
    pub nft_contracts: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct BlacklistResponse {
    pub blacklisted_addresses: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum Cw721HookMsg {
    Deposit { ask: Coin },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum MigrateMsg {}
