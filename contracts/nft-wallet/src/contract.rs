use crate::error::ContractError;
use crate::msg::{
    Cw721DepositResponse, Cw721HookMsg, ExecuteMsg, InstantiateMsg, NftContractsResponse,
    OfferResponse, QueryMsg,
};
use crate::state::{Cw721Deposit, Offer, ADMIN, BLACKLIST, CW721_DEPOSITS, OFFERS};
#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;
use cosmwasm_std::{
    from_binary, to_binary, BankMsg, Binary, Coin, Deps, DepsMut, Env, MessageInfo, Order,
    Response, StdError, StdResult, WasmMsg,
};
use cw0::maybe_addr;
use cw2::set_contract_version;
use cw721::Cw721ReceiveMsg;

const CONTRACT_NAME: &str = "crates.io:nft-wallet";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    mut deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    let valid_addr = deps.api.addr_validate(&msg.admin)?;

    ADMIN.set(deps.branch(), Some(valid_addr))?;

    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;

    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("admin", msg.admin))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    let api = deps.api;

    match msg {
        ExecuteMsg::UpdateAdmin { admin } => Ok(ADMIN
            .execute_update_admin(deps, info, maybe_addr(api, Some(admin))?)
            .unwrap()),
        ExecuteMsg::AddToBlacklist { address } => Ok(BLACKLIST
            .execute_add_hook(&ADMIN, deps, info, api.addr_validate(&address)?)
            .unwrap()),
        ExecuteMsg::RemoveFromBlacklist { address } => Ok(BLACKLIST
            .execute_remove_hook(&ADMIN, deps, info, api.addr_validate(&address)?)
            .unwrap()),
        ExecuteMsg::ReceiveNft(cw721_msg) => execute_receive_cw721(deps, info, cw721_msg),
        ExecuteMsg::WithdrawNft { contract, token_id } => {
            execute_withdraw_cw721(deps, info, contract, token_id)
        }
        ExecuteMsg::SubmitOffer {
            nft_owner,
            cw721_contract,
            token_id,
        } => execute_submit_offer(deps, info, nft_owner, cw721_contract, token_id),
        ExecuteMsg::WithdrawOffer {
            cw721_contract,
            token_id,
        } => execute_withdraw_offer(deps, info, cw721_contract, token_id),
        ExecuteMsg::AcceptOffer {
            bidder_address,
            cw721_contract,
            token_id,
        } => execute_accept_offer(deps, info, bidder_address, cw721_contract, token_id),
    }
}

pub fn execute_receive_cw721(
    deps: DepsMut,
    info: MessageInfo,
    cw721_msg: Cw721ReceiveMsg,
) -> Result<Response, ContractError> {
    match from_binary(&cw721_msg.msg) {
        Ok(Cw721HookMsg::Deposit { ask }) => {
            execute_cw721_deposit(deps, info, cw721_msg.sender, cw721_msg.token_id, ask)
        }
        _ => Err(ContractError::CustomError {
            val: "Invalid Cw721HookMsg".to_string(),
        }),
    }
}

pub fn execute_cw721_deposit(
    deps: DepsMut,
    info: MessageInfo,
    owner: String,
    token_id: String,
    ask: Coin,
) -> Result<Response, ContractError> {
    let contract_addr = info.sender.clone().to_string();

    match CW721_DEPOSITS.load(deps.storage, (&owner, &contract_addr, &token_id)) {
        Ok(_) => {
            return Err(ContractError::CustomError {
                val: "Already deposited".to_string(),
            })
        }
        Err(_) => {
            let deposit = Cw721Deposit {
                owner: owner.clone(),
                contract: contract_addr.clone(),
                token_id: token_id.clone(),
                ask: ask.clone(),
            };
            CW721_DEPOSITS.save(deps.storage, (&owner, &contract_addr, &token_id), &deposit)?;

            Ok(Response::new()
                .add_attribute("execute", "cw721_deposit")
                .add_attribute("owner", owner)
                .add_attribute("contract", contract_addr)
                .add_attribute("ask_amount", ask.to_string()))
        }
    }
}

pub fn execute_withdraw_cw721(
    deps: DepsMut,
    info: MessageInfo,
    cw721_contract: String,
    token_id: String,
) -> Result<Response, ContractError> {
    match CW721_DEPOSITS.load(
        deps.storage,
        (&info.sender.clone().to_string(), &cw721_contract, &token_id),
    ) {
        Ok(_) => {
            CW721_DEPOSITS.remove(
                deps.storage,
                (&info.sender.clone().to_string(), &cw721_contract, &token_id),
            );

            /*  NFT_CONTRACTS.remove(deps.storage, &info.sender.to_string()); */

            let exec_msg = nft::contract::ExecuteMsg::TransferNft {
                recipient: info.sender.clone().to_string(),
                token_id: token_id.clone(),
            };

            let msg = WasmMsg::Execute {
                contract_addr: cw721_contract.clone(),
                msg: to_binary(&exec_msg)?,
                funds: vec![],
            };

            Ok(Response::new()
                .add_attribute("execute", "cw721_withdraw")
                .add_attribute("token_id", token_id)
                .add_attribute("receiver_address", info.sender.to_string())
                .add_message(msg))
        }
        Err(_) => return Err(ContractError::NoCw721ToWithdraw {}),
    }
}

pub fn execute_submit_offer(
    deps: DepsMut,
    info: MessageInfo,
    nft_owner: String,
    cw721_contract: String,
    token_id: String,
) -> Result<Response, ContractError> {
    let _valid_addr = deps.api.addr_validate(&nft_owner)?;
    let _valid_contract_addr = deps.api.addr_validate(&cw721_contract)?;

    let blacklist = BLACKLIST.query_hooks(deps.as_ref())?.hooks;

    for address in blacklist {
        if address == info.sender {
            return Err(ContractError::OnTheBlacklist {});
        }
    }

    let sender = info.sender.clone().to_string();
    let offer_amount = info.funds[0].clone();

    match OFFERS.load(deps.storage, (&sender, &cw721_contract, &token_id)) {
        Ok(_) => return Err(ContractError::OfferAlreadyExists {}),
        Err(_) => {
            let offer = Offer {
                owner: sender.clone(),
                cw721_contract: cw721_contract.clone(),
                token_id: token_id.clone(),
                amount: offer_amount.clone(),
            };

            OFFERS.save(deps.storage, (&sender, &cw721_contract, &token_id), &offer)?;
        }
    }

    Ok(Response::new()
        .add_attribute("execute", "submit_offer")
        .add_attribute("bidding_address", sender)
        .add_attribute("cw721_contract", cw721_contract)
        .add_attribute("token_id", token_id)
        .add_attribute("offer_amount", offer_amount.to_string()))
}

pub fn execute_withdraw_offer(
    deps: DepsMut,
    info: MessageInfo,
    cw721_contract: String,
    token_id: String,
) -> Result<Response, ContractError> {
    let _valid_contract_addr = deps.api.addr_validate(&cw721_contract)?;
    let sender = info.sender.clone().to_string();

    match OFFERS.load(deps.storage, (&sender, &cw721_contract, &token_id)) {
        Ok(offer) => {
            let msg = BankMsg::Send {
                to_address: sender.clone(),
                amount: vec![offer.amount.clone()],
            };

            let offer_amount = offer.amount;

            OFFERS.remove(deps.storage, (&sender, &cw721_contract, &token_id));

            Ok(Response::new()
                .add_attribute("execute", "withdraw_offer")
                .add_attribute("cw721_contract", cw721_contract)
                .add_attribute("token_id", token_id)
                .add_attribute("withdraw_amount", offer_amount.to_string())
                .add_message(msg))
        }
        Err(_) => return Err(ContractError::NoOffersExistForTokenID {}),
    }
}

pub fn execute_accept_offer(
    deps: DepsMut,
    info: MessageInfo,
    bidder_address: String,
    cw721_contract: String,
    token_id: String,
) -> Result<Response, ContractError> {
    let _valid_addr = deps.api.addr_validate(&bidder_address)?;
    let _valid_cw721_addr = deps.api.addr_validate(&cw721_contract)?;
    let sender = info.sender.clone().to_string();

    match OFFERS.load(deps.storage, (&bidder_address, &cw721_contract, &token_id)) {
        Ok(offer) => {
            //send money to info sender
            let bank_msg = BankMsg::Send {
                to_address: sender.clone(),
                amount: vec![offer.amount.clone()],
            };

            //sent nft to bidder address
            let exec_msg = nft::contract::ExecuteMsg::TransferNft {
                recipient: bidder_address.clone(),
                token_id: token_id.clone(),
            };

            let msg = WasmMsg::Execute {
                contract_addr: cw721_contract.clone(),
                msg: to_binary(&exec_msg)?,
                funds: vec![],
            };

            //TO DO: SEND ALL OTHER BIDDERS THEIR MONEY BACK IF THE NFT IS SOLD TO SOMEONE ELSE
            //IS THIS POSSIBLE?
            //POSSIBLE ROUTE: 1) QUERY ALL OFFERS 2) GET ADDR, AMOUNT 3) SEND BANKMSG TO THOSE ADDRESSES

            //remove offer from OFFERS
            OFFERS.remove(deps.storage, (&bidder_address, &cw721_contract, &token_id));

            //remove cw721 deposit from CW721_DEPOSITS
            CW721_DEPOSITS.remove(deps.storage, (&sender, &cw721_contract, &token_id));

            /*             NFT_CONTRACTS.remove(deps.storage, &info.sender.to_string());
             */
            Ok(Response::new()
                .add_attribute("execute", "accept_offer")
                .add_attribute("cw721_contract", cw721_contract)
                .add_attribute("token_id", token_id)
                .add_attribute("nft_sent_to", bidder_address)
                .add_attribute("amount_received", offer.amount.to_string())
                .add_message(bank_msg)
                .add_message(msg))
        }
        _ => return Err(ContractError::NoOffersExistForTokenID {}),
    }
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::Cw721Deposits { address, contract } => {
            to_binary(&try_query_cw721_deposit(deps, address, contract)?)
        }
        QueryMsg::Offers {
            owner,
            cw721_contract,
        } => to_binary(&try_query_offers(deps, owner, cw721_contract)?),
        QueryMsg::GetNftContracts { owner } => to_binary(&try_query_nft_contracts(deps, owner)?),
        QueryMsg::GetBlacklist {} => todo!(),
    }
}

pub fn try_query_cw721_deposit(
    deps: Deps,
    address: String,
    contract: String,
) -> StdResult<Cw721DepositResponse> {
    let _valid_addr = deps.api.addr_validate(&address)?;
    let _valid_contract_addr = deps.api.addr_validate(&contract)?;

    let res: StdResult<Vec<_>> = CW721_DEPOSITS
        .prefix((&address, &contract))
        .range(deps.storage, None, None, Order::Ascending)
        .collect();

    let deposits_found = res?;

    if deposits_found.len() == 0 {
        return Err(StdError::generic_err(
            "No cw721 deposits exist for that address",
        ));
    }

    let mut deposits: Vec<Cw721Deposit> = vec![];
    for deposit in deposits_found {
        deposits.push(deposit.1);
    }

    Ok(Cw721DepositResponse { deposits })
}

pub fn try_query_offers(
    deps: Deps,
    owner: String,
    cw721_address: String,
) -> StdResult<OfferResponse> {
    let _valid_addr = deps.api.addr_validate(&owner)?;
    let _valid_contract_addr = deps.api.addr_validate(&cw721_address)?;

    let res: StdResult<Vec<_>> = OFFERS
        .prefix((&owner, &cw721_address))
        .range(deps.storage, None, None, Order::Ascending)
        .collect();

    let offers_found = res?;

    if offers_found.len() == 0 {
        return Err(StdError::generic_err(
            "No offers exist from that wallet address for the cw721 contract address and token id",
        ));
    }

    let mut offers: Vec<Offer> = vec![];
    for offer in offers_found {
        offers.push(offer.1);
    }

    Ok(OfferResponse { offers })
}

pub fn try_query_nft_contracts(deps: Deps, address: String) -> StdResult<NftContractsResponse> {
    let _valid_addr = deps.api.addr_validate(&address)?;

    let res: StdResult<Vec<_>> = CW721_DEPOSITS
        .sub_prefix(&address)
        .range(deps.storage, None, None, Order::Ascending)
        .collect();

    let contracts_found = res?;

    if contracts_found.len() == 0 {
        return Err(StdError::generic_err(
            "No offers exist from that wallet address for the cw721 contract address and token id",
        ));
    }

    let mut nft_contracts: Vec<String> = vec![];

    for nft_contract in contracts_found {
        nft_contracts.push(nft_contract.0 .0)
    }

    Ok(NftContractsResponse { nft_contracts })
}
