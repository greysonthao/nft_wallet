#[cfg(test)]
mod tests {

    use crate::msg::{
        BlacklistResponse, Cw721DepositResponse, Cw721HookMsg, ExecuteMsg, OfferResponse, QueryMsg,
    };

    use anyhow::Error;
    use cosmwasm_std::to_binary;
    use cosmwasm_std::{Addr, Coin, Empty, StdError, StdResult, Uint128};

    use cw721::OwnerOfResponse;
    use cw721::{ContractInfoResponse, NumTokensResponse};
    use cw721_base::msg::MintMsg;
    use cw_multi_test::{App, Contract, ContractWrapper, Executor};
    use nft::contract::ExecuteMsg as NFTExecuteMsg;
    use nft::contract::QueryMsg as NFTQueryMsg;

    const OWNER: &str = "juno1xdekj862ff8vp9jr98cr2e0gfpcnplgj3p0awr";
    const DENOM: &str = "TNT";
    const AMOUNT: Uint128 = Uint128::new(100);
    const BIDDER: &str = "juno1pqn6edrdmr28ekdjv5j2u9uvh6m32tl306kh5h";
    const BAD_BIDDER: &str = "juno1tr8fflkqmfqp7tclrgcl0hucdzn5prm8xj3d5h";
    const TOKEN_ID: &str = "token_1234";

    pub fn contract_cw721() -> Box<dyn Contract<Empty>> {
        let contract = ContractWrapper::new(
            nft::contract::entry::execute,
            nft::contract::entry::instantiate,
            nft::contract::entry::query,
        );
        Box::new(contract)
    }

    pub fn contract_nft_wallet() -> Box<dyn Contract<Empty>> {
        let contract = ContractWrapper::new(
            crate::contract::execute,
            crate::contract::instantiate,
            crate::contract::query,
        );
        Box::new(contract)
    }

    pub fn mock_app() -> App {
        let init_amount = vec![Coin {
            denom: DENOM.to_string(),
            amount: AMOUNT,
        }];

        let mut app = App::new(|router, _, storage| {
            router
                .bank
                .init_balance(
                    storage,
                    &Addr::unchecked(OWNER.to_string()),
                    init_amount.clone(),
                )
                .unwrap()
        });

        app.init_modules(|router, _, storage| {
            router
                .bank
                .init_balance(
                    storage,
                    &Addr::unchecked(BIDDER.to_string()),
                    init_amount.clone(),
                )
                .unwrap();
        });

        app.init_modules(|router, _, storage| {
            router
                .bank
                .init_balance(
                    storage,
                    &Addr::unchecked(BAD_BIDDER.to_string()),
                    init_amount.clone(),
                )
                .unwrap();
        });

        app
    }

    pub struct Suite {
        pub app: App,
        pub owner: String,
        cw721_id: u64,
        nft_wallet_id: u64,
    }

    impl Suite {
        pub fn init() -> StdResult<Suite> {
            let mut app = mock_app();
            let owner = OWNER.to_string();
            let cw721_id = app.store_code(contract_cw721());
            let nft_wallet_id = app.store_code(contract_nft_wallet());

            Ok(Suite {
                app,
                owner,
                cw721_id,
                nft_wallet_id,
            })
        }

        pub fn instantiate_nft_wallet(&mut self, admin_addr: String) -> Result<Addr, Error> {
            let code_id = self.nft_wallet_id;
            let sender = Addr::unchecked(self.owner.clone());
            let init_msg = crate::msg::InstantiateMsg { admin: admin_addr };
            let send_funds = vec![];
            let label = "nft_wallet".to_string();
            let admin = None;

            self.app
                .instantiate_contract(code_id, sender, &init_msg, &send_funds, label, admin)
        }

        pub fn instantiate_cw721(&mut self) -> Result<Addr, Error> {
            let code_id = self.cw721_id;
            let sender = Addr::unchecked(self.owner.clone());
            let init_msg = cw721_base::InstantiateMsg {
                name: "NFT_project".to_string(),
                symbol: "NFT".to_string(),
                minter: String::from(OWNER.clone()),
            };
            let send_funds = vec![];
            let label = "new_NFT_contract".to_string();
            let admin = Some(self.owner.clone());

            self.app
                .instantiate_contract(code_id, sender, &init_msg, &send_funds, label, admin)
        }

        pub fn query_balance(&self, address: String, denom: String) -> Result<Coin, StdError> {
            self.app.wrap().query_balance(address, denom)
        }
    }

    #[test]
    fn test_deposit_and_withdraw_nft() {
        let mut suite = Suite::init().unwrap();
        let nft_contract_addr = suite.instantiate_cw721().unwrap();
        let nft_wallet_addr = suite.instantiate_nft_wallet(suite.owner.clone()).unwrap();
        //println!("NFT CONTRACT ADDR: {:?}", nft_contract_addr);

        //QUERY OWNER ADDRESS BALANCE
        let res = suite
            .query_balance(OWNER.to_string(), "TNT".to_string())
            .unwrap();
        assert_eq!(res.denom, "TNT".to_string());
        assert_eq!(res.amount, Uint128::new(100));

        //QUERY BIDDER ADDRESS BALANCE
        let res = suite
            .query_balance(BIDDER.to_string(), "TNT".to_string())
            .unwrap();
        assert_eq!(res.denom, "TNT".to_string());
        assert_eq!(res.amount, Uint128::new(100));

        //QUERY THE NFT WALLET CONTRACT. SHOULD BE 0 BALANCE
        let res = suite
            .query_balance(nft_wallet_addr.clone().to_string(), "TNT".to_string())
            .unwrap();
        assert_eq!(res.denom, "TNT".to_string());
        assert_eq!(res.amount, Uint128::new(0));

        //QUERY token info for NFT contract
        let msg = NFTQueryMsg::ContractInfo {};
        let res: ContractInfoResponse = suite
            .app
            .wrap()
            .query_wasm_smart(nft_contract_addr.clone().to_string(), &msg)
            .unwrap();
        //println!("CONTRACT INFO RESPONSE: {:?}", res);

        assert_eq!(res.name, "NFT_project".to_string());

        //QUERY TOKENS MINTED. SHOULD BE 0.
        let msg = NFTQueryMsg::NumTokens {};
        let res: NumTokensResponse = suite
            .app
            .wrap()
            .query_wasm_smart(nft_contract_addr.clone().to_string(), &msg)
            .unwrap();
        assert_eq!(res.count, 0);

        //MINT FIRST NFT
        let mint_msg = MintMsg {
            token_id: TOKEN_ID.to_string(),
            owner: suite.owner.clone(),
            token_uri: Some("https://touger.dev".to_string()),
            extension: None,
        };
        let msg = NFTExecuteMsg::Mint(mint_msg);
        let res = suite
            .app
            .execute_contract(
                Addr::unchecked(suite.owner.clone()),
                nft_contract_addr.clone(),
                &msg,
                &[],
            )
            .unwrap();

        assert_eq!(
            res.events[1].attributes[3].value,
            "juno1xdekj862ff8vp9jr98cr2e0gfpcnplgj3p0awr".to_string()
        );
        assert_eq!(res.events[1].attributes[4].value, "token_1234".to_string());

        //QUERY TOKENS MINTED. SHOULD BE 1.
        let msg = NFTQueryMsg::NumTokens {};
        let res: NumTokensResponse = suite
            .app
            .wrap()
            .query_wasm_smart(nft_contract_addr.clone().to_string(), &msg)
            .unwrap();
        assert_eq!(res.count, 1);

        //QUERY TOKEN HOLDER ON NFT CONTRACT
        let msg = NFTQueryMsg::OwnerOf {
            token_id: TOKEN_ID.to_string(),
            include_expired: None,
        };
        let res: OwnerOfResponse = suite
            .app
            .wrap()
            .query_wasm_smart(nft_contract_addr.clone().to_string(), &msg)
            .unwrap();
        assert_eq!(res.owner, suite.owner.clone());

        //SEND NFT TO NFT WALLET
        let msg = NFTExecuteMsg::SendNft {
            contract: nft_wallet_addr.clone().to_string(),
            token_id: TOKEN_ID.clone().to_string(),
            msg: to_binary(&Cw721HookMsg::Deposit {
                ask: Coin {
                    denom: "TNT".to_string(),
                    amount: Uint128::new(10),
                },
            })
            .unwrap(),
        };

        let _res = suite
            .app
            .execute_contract(
                Addr::unchecked(suite.owner.clone().to_string()),
                nft_contract_addr.clone(),
                &msg,
                &[],
            )
            .unwrap();

        //println!("CONTRACT INFO RESPONSE: {:?}", res);

        //QUERY CW721_DEPOSITS. SHOULD HAVE ONE DEPOSIT
        let msg = QueryMsg::Cw721Deposits {
            address: OWNER.to_string(),
            contract: nft_contract_addr.clone().to_string(),
        };

        let res: Cw721DepositResponse = suite
            .app
            .wrap()
            .query_wasm_smart(nft_wallet_addr.clone(), &msg)
            .unwrap();

        assert_eq!(res.deposits.len(), 1);
        assert_eq!(res.deposits[0].token_id, TOKEN_ID.to_string());

        //QUERY TOKEN HOLDER ON NFT CONTRACT. SHOULD BE NFT_WALLET_ADDR
        let msg = NFTQueryMsg::OwnerOf {
            token_id: TOKEN_ID.to_string(),
            include_expired: None,
        };
        let res: OwnerOfResponse = suite
            .app
            .wrap()
            .query_wasm_smart(nft_contract_addr.clone().to_string(), &msg)
            .unwrap();
        assert_eq!(res.owner, nft_wallet_addr.clone());

        //ADD BAD_BIDDER TO BLACKLIST
        let msg = ExecuteMsg::AddToBlacklist {
            address: BAD_BIDDER.to_string(),
        };

        let _res = suite
            .app
            .execute_contract(
                Addr::unchecked(suite.owner.clone()),
                nft_wallet_addr.clone(),
                &msg,
                &[],
            )
            .unwrap();

        //QUERY BLACKLIST. SHOULD RETURN BAD_BIDDER
        let msg = QueryMsg::GetBlacklist {};

        let res: BlacklistResponse = suite
            .app
            .wrap()
            .query_wasm_smart(nft_wallet_addr.clone().to_string(), &msg)
            .unwrap();

        //println!("BLACKLIST: {:?}", res);

        assert_eq!(res.blacklisted_addresses[0], BAD_BIDDER.to_string());

        //SUBMIT OFFER AS BAD_BIDDER. SHOULD ERROR
        let msg = ExecuteMsg::SubmitOffer {
            nft_owner: suite.owner.clone().to_string(),
            cw721_contract: nft_contract_addr.clone().to_string(),
            token_id: TOKEN_ID.to_string(),
        };

        let send_funds = vec![Coin {
            denom: DENOM.to_string(),
            amount: Uint128::new(1),
        }];

        let res = suite.app.execute_contract(
            Addr::unchecked(BAD_BIDDER.to_string()),
            Addr::unchecked(nft_wallet_addr.clone().to_string()),
            &msg,
            &send_funds,
        );

        match res {
            Err(_) => {}
            _ => panic!("Should error here"),
        }

        //REMOVE BAD_BIDDER FROM BLACKLIST
        let msg = ExecuteMsg::RemoveFromBlacklist {
            address: BAD_BIDDER.to_string(),
        };

        let _res = suite
            .app
            .execute_contract(
                Addr::unchecked(suite.owner.clone()),
                nft_wallet_addr.clone(),
                &msg,
                &[],
            )
            .unwrap();

        //QUERY BLACKLIST. SHOULD ERROR
        let msg = QueryMsg::GetBlacklist {};

        let res: BlacklistResponse = suite
            .app
            .wrap()
            .query_wasm_smart(nft_wallet_addr.clone().to_string(), &msg)
            .unwrap();

        assert_eq!(res.blacklisted_addresses.len(), 0);

        //SUBMIT OFFER 1 FROM BIDDER
        let msg = ExecuteMsg::SubmitOffer {
            nft_owner: suite.owner.clone().to_string(),
            cw721_contract: nft_contract_addr.clone().to_string(),
            token_id: TOKEN_ID.to_string(),
        };

        let send_funds = vec![Coin {
            denom: DENOM.to_string(),
            amount: Uint128::new(1),
        }];

        let _res = suite
            .app
            .execute_contract(
                Addr::unchecked(BIDDER.to_string()),
                Addr::unchecked(nft_wallet_addr.clone().to_string()),
                &msg,
                &send_funds,
            )
            .unwrap();

        //println!("SUBMIT OFFER RESPONSE: {:?}", res);

        //QUERY OFFER #1
        let msg = QueryMsg::Offers {
            owner: BIDDER.to_string(),
            cw721_contract: nft_contract_addr.clone().to_string(),
        };

        let _res: OfferResponse = suite
            .app
            .wrap()
            .query_wasm_smart(nft_wallet_addr.clone(), &msg)
            .unwrap();

        //println!("offer response: {:?}", res);

        //QUERY BALANCE ON NFT WALLET CONTRACT. SHOULD BE 1 TNT
        let res = suite
            .query_balance(nft_wallet_addr.clone().to_string(), DENOM.to_string())
            .unwrap();

        assert_eq!(res.amount, Uint128::new(1));
        //println!("offer response: {:?}", res);

        //QUERY BALANCE ON BIDDER WALLET CONTRACT. SHOULD BE 99 TNT
        let res = suite
            .query_balance(BIDDER.to_string(), DENOM.to_string())
            .unwrap();

        assert_eq!(res.amount, Uint128::new(99));

        //SUMBIT OFFER #2. SHOULD ERROR AND SAY OFFER ALREADY EXISTS FOR THAT BIDDER
        let msg = ExecuteMsg::SubmitOffer {
            nft_owner: suite.owner.clone().to_string(),
            cw721_contract: nft_contract_addr.clone().to_string(),
            token_id: TOKEN_ID.to_string(),
        };

        let send_funds = vec![Coin {
            denom: DENOM.to_string(),
            amount: Uint128::new(10),
        }];

        let res = suite.app.execute_contract(
            Addr::unchecked(BIDDER.to_string()),
            Addr::unchecked(nft_wallet_addr.clone().to_string()),
            &msg,
            &send_funds,
        );

        match res {
            Err(_) => {}
            _ => panic!("Should error here"),
        }

        //REMOVE OFFER 1
        let msg = ExecuteMsg::WithdrawOffer {
            cw721_contract: nft_contract_addr.clone().to_string(),
            token_id: TOKEN_ID.to_string(),
        };

        let _res = suite
            .app
            .execute_contract(
                Addr::unchecked(BIDDER.to_string()),
                nft_wallet_addr.clone(),
                &msg,
                &[],
            )
            .unwrap();

        //println!("withdraw offer response: {:?}", res);

        //QUERY BALANCE ON NFT WALLET CONTRACT. SHOULD BE 0 TNT
        let res = suite
            .query_balance(nft_wallet_addr.clone().to_string(), DENOM.to_string())
            .unwrap();

        assert_eq!(res.amount, Uint128::new(0));
        //println!("offer response: {:?}", res);

        //QUERY BALANCE ON BIDDER WALLET CONTRACT. SHOULD BE 100 TNT
        let res = suite
            .query_balance(BIDDER.to_string(), DENOM.to_string())
            .unwrap();

        assert_eq!(res.amount, Uint128::new(100));

        //SUBMIT OFFER #3
        let msg = ExecuteMsg::SubmitOffer {
            nft_owner: suite.owner.clone().to_string(),
            cw721_contract: nft_contract_addr.clone().to_string(),
            token_id: TOKEN_ID.to_string(),
        };

        let send_funds = vec![Coin {
            denom: DENOM.to_string(),
            amount: Uint128::new(10),
        }];

        let _res = suite
            .app
            .execute_contract(
                Addr::unchecked(BIDDER.to_string()),
                Addr::unchecked(nft_wallet_addr.clone().to_string()),
                &msg,
                &send_funds,
            )
            .unwrap();

        //ACCEPT OFFER #3
        let msg = ExecuteMsg::AcceptOffer {
            bidder_address: BIDDER.to_string(),
            cw721_contract: nft_contract_addr.clone().to_string(),
            token_id: TOKEN_ID.to_string(),
        };

        let _res = suite
            .app
            .execute_contract(
                Addr::unchecked(suite.owner.to_string()),
                Addr::unchecked(nft_wallet_addr.clone().to_string()),
                &msg,
                &[],
            )
            .unwrap();

        //println!("accept offer response: {:?}", res);

        //QUERY TOKEN HOLDER ON NFT CONTRACT. SHOULD BE BIDDER
        let msg = NFTQueryMsg::OwnerOf {
            token_id: TOKEN_ID.to_string(),
            include_expired: None,
        };
        let res: OwnerOfResponse = suite
            .app
            .wrap()
            .query_wasm_smart(nft_contract_addr.clone().to_string(), &msg)
            .unwrap();
        assert_eq!(res.owner, BIDDER.to_string());

        //QUERY BALANCE ON NFT WALLET CONTRACT. SHOULD BE 0 TNT
        let res = suite
            .query_balance(nft_wallet_addr.clone().to_string(), DENOM.to_string())
            .unwrap();

        assert_eq!(res.amount, Uint128::new(0));

        //QUERY BALANCE ON OWNER WALLET CONTRACT. SHOULD BE 110 TNT
        let res = suite
            .query_balance(suite.owner.clone().to_string(), DENOM.to_string())
            .unwrap();

        assert_eq!(res.amount, Uint128::new(110));

        //QUERY OFFERS. SHOULD ERROR OUT BECAUSE NO OFFERS EXISTS IN THE MAP
        let msg = QueryMsg::Offers {
            owner: BIDDER.to_string(),
            cw721_contract: nft_contract_addr.clone().to_string(),
        };

        let res: Result<OfferResponse, StdError> = suite
            .app
            .wrap()
            .query_wasm_smart(nft_wallet_addr.clone(), &msg);

        match res {
            Err(_) => {}
            _ => panic!("Should error here"),
        }

        //QUERY CW721_DEPOSITS. SHOULD ERROR OUT BECAUSE NO deposits EXISTS IN THE MAP
        let msg = QueryMsg::Cw721Deposits {
            address: OWNER.to_string(),
            contract: nft_contract_addr.clone().to_string(),
        };

        let res: Result<Cw721DepositResponse, StdError> = suite
            .app
            .wrap()
            .query_wasm_smart(nft_wallet_addr.clone(), &msg);

        match res {
            Err(_) => {}
            _ => panic!("Should error here"),
        }
    }
}
