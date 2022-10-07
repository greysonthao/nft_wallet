#[cfg(test)]
mod tests {
    use cosmwasm_std::{
        from_binary,
        testing::{mock_dependencies, mock_env, mock_info},
        to_binary, Coin, DepsMut, Response, Uint128,
    };
    use cw721::Cw721ReceiveMsg;

    use crate::{
        contract::{execute, instantiate, query},
        msg::{
            Cw721DepositResponse, Cw721HookMsg, ExecuteMsg, InstantiateMsg, NftContractsResponse,
            OfferResponse, QueryMsg,
        },
        state::BLACKLIST,
        ContractError,
    };

    const SENDER: &str = "sender_address";
    const AMOUNT: u128 = 100000;
    const DENOM: &str = "utest";

    fn proper_instantiate(deps: DepsMut) -> Result<Response, ContractError> {
        let msg = InstantiateMsg {
            admin: "juno1pqn6edrdmr28ekdjv5j2u9uvh6m32tl306kh5h".to_string(),
        };
        let info = mock_info(SENDER, &[]);
        instantiate(deps, mock_env(), info, msg)
    }

    /*  fn execute_cw20_deposit(deps: DepsMut) -> Result<Response, ContractError> {
        let cw20_msg = Cw20ReceiveMsg {
            sender: "".to_string(),
            amount: Uint128::new(0),
            msg: to_binary(&Cw20HookMsg::Deposit {
                owner: "right_guy".to_string(),
                amount: 100u128,
            })?,
        };

        let msg = ExecuteMsg::Receive(cw20_msg);
        let info = mock_info(&"contract_addr", &[]);
        execute(deps, mock_env(), info, msg)
    } */

    fn execute_cw721_deposit(deps: DepsMut) -> Result<Response, ContractError> {
        let ask = Coin {
            denom: DENOM.to_owned(),
            amount: Uint128::new(AMOUNT),
        };
        let cw721_msg = Cw721ReceiveMsg {
            sender: "juno1pqn6edrdmr28ekdjv5j2u9uvh6m32tl306kh5h".to_string(),
            token_id: "TNT".to_string(),
            msg: to_binary(&Cw721HookMsg::Deposit { ask: ask })?,
        };

        let msg = ExecuteMsg::ReceiveNft(cw721_msg);
        let info = mock_info(&"contract_addr", &[]);
        execute(deps, mock_env(), info, msg)
    }

    fn execute_cw721_deposit_2(deps: DepsMut) -> Result<Response, ContractError> {
        let ask = Coin {
            denom: DENOM.to_owned(),
            amount: Uint128::new(AMOUNT),
        };
        let cw721_msg = Cw721ReceiveMsg {
            sender: "juno1pqn6edrdmr28ekdjv5j2u9uvh6m32tl306kh5h".to_string(),
            token_id: "MKT".to_string(),
            msg: to_binary(&Cw721HookMsg::Deposit { ask: ask })?,
        };

        let msg = ExecuteMsg::ReceiveNft(cw721_msg);
        let info = mock_info(&"contract_addr_2", &[]);
        execute(deps, mock_env(), info, msg)
    }

    #[test]
    fn instantiate_test() {
        let mut deps = mock_dependencies();
        let res = proper_instantiate(deps.as_mut()).unwrap();
        //println!("RES: {:?}", res.clone());
        assert_eq!(res.attributes[0].value, "instantiate");
    }

    #[test]
    fn test_deposit_cw721_and_withdraw() {
        let mut deps = mock_dependencies();
        let _res = proper_instantiate(deps.as_mut()).unwrap();
        let _res = execute_cw721_deposit(deps.as_mut()).unwrap();

        let msg = QueryMsg::Cw721Deposits {
            address: "juno1pqn6edrdmr28ekdjv5j2u9uvh6m32tl306kh5h".to_string(),
            contract: "contract_addr".to_string(),
        };
        let res = query(deps.as_ref(), mock_env(), msg).unwrap();
        let res: Cw721DepositResponse = from_binary(&res).unwrap();
        assert_eq!(
            res.deposits[0].owner,
            "juno1pqn6edrdmr28ekdjv5j2u9uvh6m32tl306kh5h"
        );

        let _res = execute_cw721_deposit_2(deps.as_mut()).unwrap();
        //println!("RES: {:?}", res);

        let msg = QueryMsg::Cw721Deposits {
            address: "juno1pqn6edrdmr28ekdjv5j2u9uvh6m32tl306kh5h".to_string(),
            contract: "contract_addr_2".to_string(),
        };
        let res = query(deps.as_ref(), mock_env(), msg).unwrap();

        let res: Cw721DepositResponse = from_binary(&res).unwrap();
        assert_eq!(res.deposits[0].token_id, "MKT".to_string());

        let msg = ExecuteMsg::WithdrawNft {
            contract: "contract_addr".to_string(),
            token_id: "TNT".to_string(),
        };
        let info = mock_info(&"juno1pqn6edrdmr28ekdjv5j2u9uvh6m32tl306kh5h", &[]);
        let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();
        //println!("RES: {:?}", res);

        let msg = QueryMsg::Cw721Deposits {
            address: "juno1pqn6edrdmr28ekdjv5j2u9uvh6m32tl306kh5h".to_string(),
            contract: "contract_addr".to_string(),
        };
        let res = query(deps.as_ref(), mock_env(), msg);

        match res {
            Err(_) => {}
            _ => panic!("Should error here"),
        }
    }

    #[test]
    fn test_submit_offer_and_withdraw_offer() {
        let nft_owner = "juno1pqn6edrdmr28ekdjv5j2u9uvh6m32tl306kh5h";
        let contract_addr = "contract_addr";
        let token_id = "TNT";

        let mut deps = mock_dependencies();
        let _res = proper_instantiate(deps.as_mut()).unwrap();
        let _res = execute_cw721_deposit(deps.as_mut()).unwrap();

        let msg = QueryMsg::Cw721Deposits {
            address: nft_owner.clone().to_string(),
            contract: contract_addr.clone().to_string(),
        };
        let res = query(deps.as_ref(), mock_env(), msg).unwrap();
        let res: Cw721DepositResponse = from_binary(&res).unwrap();
        assert_eq!(res.deposits[0].owner, nft_owner.clone().to_string());

        // add address to blacklist
        let auth_info = mock_info("juno1pqn6edrdmr28ekdjv5j2u9uvh6m32tl306kh5h", &[]);
        let msg = ExecuteMsg::AddToBlacklist {
            address: "bad_guy".to_string(),
        };
        let _res = execute(deps.as_mut(), mock_env(), auth_info, msg).unwrap();

        // try to buy from blacklisted address
        let msg = ExecuteMsg::SubmitOffer {
            nft_owner: nft_owner.clone().to_string(),
            cw721_contract: contract_addr.clone().to_string(),
            token_id: token_id.clone().to_string(),
        };

        let info = mock_info(
            "bad_guy",
            &[Coin {
                denom: "LUNA".to_string(),
                amount: Uint128::new(10),
            }],
        );

        let res = execute(deps.as_mut(), mock_env(), info, msg);

        match res {
            Err(_) => {}
            _ => panic!("Should error here"),
        }

        let msg = ExecuteMsg::SubmitOffer {
            nft_owner: nft_owner.clone().to_string(),
            cw721_contract: contract_addr.clone().to_string(),
            token_id: token_id.clone().to_string(),
        };

        let info = mock_info(
            "bidder",
            &[Coin {
                denom: "LUNA".to_string(),
                amount: Uint128::new(10),
            }],
        );

        let res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

        //println!("Res for Bid: {:?}", res);
        assert_eq!(res.attributes[3].value, "TNT".to_string());

        let msg = QueryMsg::Offers {
            owner: "bidder".to_string(),
            cw721_contract: contract_addr.clone().to_string(),
        };
        let res = query(deps.as_ref(), mock_env(), msg).unwrap();
        let _res: OfferResponse = from_binary(&res).unwrap();

        //WITHDRAW OFFERS
        let msg = ExecuteMsg::WithdrawOffer {
            cw721_contract: contract_addr.clone().to_string(),
            token_id: token_id.clone().to_string(),
        };

        let info = mock_info(
            "bidder",
            &[Coin {
                denom: "LUNA".to_string(),
                amount: Uint128::new(10),
            }],
        );

        let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();
        //println!("Res for Bid: {:?}", res);

        let msg = QueryMsg::Offers {
            owner: "bidder".to_string(),
            cw721_contract: contract_addr.clone().to_string(),
        };
        let res = query(deps.as_ref(), mock_env(), msg);

        match res {
            Err(_) => {}
            _ => panic!("Should error here because all offers were withdrawn"),
        }
    }

    #[test]
    fn add_and_remove_from_blacklist() {
        let mut deps = mock_dependencies();
        let _res = proper_instantiate(deps.as_mut()).unwrap();

        // add address to blacklist
        let auth_info = mock_info("juno1pqn6edrdmr28ekdjv5j2u9uvh6m32tl306kh5h", &[]);
        let msg = ExecuteMsg::AddToBlacklist {
            address: "bad_guy".to_string(),
        };
        let res = execute(deps.as_mut(), mock_env(), auth_info, msg).unwrap();

        //println!("BLACKLIST: {:?}", res);
        assert_eq!(res.attributes[1].value, "bad_guy");

        //query blacklist
        let blacklist = BLACKLIST.query_hooks(deps.as_ref()).unwrap().hooks;
        assert_eq!(blacklist.len(), 1);
        //println!("added to blacklist: {:?}", blacklist);

        // remove address from blacklist
        let auth_info = mock_info("juno1pqn6edrdmr28ekdjv5j2u9uvh6m32tl306kh5h", &[]);
        let msg = ExecuteMsg::RemoveFromBlacklist {
            address: "bad_guy".to_string(),
        };
        let _res = execute(deps.as_mut(), mock_env(), auth_info, msg).unwrap();

        //println!("BLACKLIST: {:?}", res);

        //query blacklist
        let blacklist = BLACKLIST.query_hooks(deps.as_ref()).unwrap().hooks;
        assert_eq!(blacklist.len(), 0);
        //println!("removed from blacklist: {:?}", blacklist);
    }

    #[test]
    fn accept_offer() {
        let nft_owner = "juno1pqn6edrdmr28ekdjv5j2u9uvh6m32tl306kh5h";
        let contract_addr = "contract_addr";
        let token_id = "TNT";

        let mut deps = mock_dependencies();
        let _res = proper_instantiate(deps.as_mut()).unwrap();
        let _res = execute_cw721_deposit(deps.as_mut()).unwrap();

        let msg = ExecuteMsg::SubmitOffer {
            nft_owner: nft_owner.clone().to_string(),
            cw721_contract: contract_addr.clone().to_string(),
            token_id: token_id.clone().to_string(),
        };

        let info = mock_info(
            "bidder",
            &[Coin {
                denom: "LUNA".to_string(),
                amount: Uint128::new(10),
            }],
        );

        let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

        //println!("RES: {:?}", res);

        //query offers
        let msg = QueryMsg::Offers {
            owner: "bidder".to_string(),
            cw721_contract: contract_addr.clone().to_string(),
        };

        let res = query(deps.as_ref(), mock_env(), msg).unwrap();

        let res: OfferResponse = from_binary(&res).unwrap();

        assert_eq!(res.offers.len(), 1);
        //println!("RES: {:?}", res);

        //query cw721 deposits
        let msg = QueryMsg::Cw721Deposits {
            address: nft_owner.clone().to_string(),
            contract: contract_addr.clone().to_string(),
        };

        let res = query(deps.as_ref(), mock_env(), msg).unwrap();

        let res: Cw721DepositResponse = from_binary(&res).unwrap();

        assert_eq!(res.deposits.len(), 1);
        //println!("RES cw721 deposits: {:?}", res);

        //accept offer
        let msg = ExecuteMsg::AcceptOffer {
            bidder_address: "bidder".to_string(),
            cw721_contract: contract_addr.clone().to_string(),
            token_id: token_id.clone().to_string(),
        };

        let info = mock_info(nft_owner, &[]);

        let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

        //println!("RES: {:?}", res);

        //query offers
        let msg = QueryMsg::Offers {
            owner: "bidder".to_string(),
            cw721_contract: contract_addr.clone().to_string(),
        };

        let res = query(deps.as_ref(), mock_env(), msg);

        match res {
            Err(_) => {}
            _ => panic!("Should error here"),
        }

        //query cw721 deposits
        let msg = QueryMsg::Cw721Deposits {
            address: nft_owner.clone().to_string(),
            contract: contract_addr.clone().to_string(),
        };

        let res = query(deps.as_ref(), mock_env(), msg);

        match res {
            Err(_) => {}
            _ => panic!("Should error here"),
        }
    }

    #[test]
    fn query_nft_contracts() {
        let nft_owner = "juno1pqn6edrdmr28ekdjv5j2u9uvh6m32tl306kh5h";
        /* let contract_addr = "contract_addr";
        let token_id = "TNT"; */

        let mut deps = mock_dependencies();
        let _res = proper_instantiate(deps.as_mut()).unwrap();
        let _res = execute_cw721_deposit(deps.as_mut()).unwrap();
        let _res = execute_cw721_deposit_2(deps.as_mut()).unwrap();

        let msg = QueryMsg::GetNftContracts {
            owner: nft_owner.clone().to_string(),
        };

        let res = query(deps.as_ref(), mock_env(), msg).unwrap();

        let res: NftContractsResponse = from_binary(&res).unwrap();

        println!("NFT CONTRACTS: {:?}", res);
    }
}
