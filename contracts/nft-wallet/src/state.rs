use cosmwasm_std::Coin;
use cw_controllers::{Admin, Hooks};
use cw_storage_plus::Map;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Cw721Deposit {
    pub owner: String,
    pub contract: String,
    pub token_id: String,
    pub ask: Coin,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Offer {
    pub owner: String,
    pub cw721_contract: String,
    pub token_id: String,
    pub amount: Coin,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct NftContracts {
    pub owner: String,
    pub cw721_contract: String,
}

//key is nft owner address, cw721_contract address, and token_id
pub const CW721_DEPOSITS: Map<(&str, &str, &str), Cw721Deposit> = Map::new("cw721deposits");

//key is offer owner address, cw721_contract address, and token_id
pub const OFFERS: Map<(&str, &str, &str), Offer> = Map::new("offers");

//key is owner address
pub const NFT_CONTRACTS: Map<&str, NftContracts> = Map::new("nft_contracts");

pub const ADMIN: Admin = Admin::new("admin");

pub const BLACKLIST: Hooks = Hooks::new("blacklist");
