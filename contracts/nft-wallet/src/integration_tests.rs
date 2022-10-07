#[cfg(test)]
mod tests {

    use cw_multi_test::{App, AppBuilder, Contract, ContractWrapper, Executor};

    const OWNER: &str = "juno1xdekj862ff8vp9jr98cr2e0gfpcnplgj3p0awr";
    const DENOM: &str = "TNT";
    const AMOUNT: Uint128 = Uint128::new(100);
    const BIDDER: &str = "juno1pqn6edrdmr28ekdjv5j2u9uvh6m32tl306kh5h";
    const TOKEN_ID: &str = "token_1234";
    const ADMIN: &str = "juno1xdekj862ff8vp9jr98cr2e0gfpcnplgj3p0awr";

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
            denom: DENOM,
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

        app.init_module(|router, _, storage| {
            router
                .bank
                .init_balance(
                    storage,
                    &Addr::unchecked(BIDDER.to_string()),
                    init_amount.clone(),
                )
                .unwrap();
        })
    }

    pub struct Suite {
        pub app: App,
        pub owner: String,
        cw721_id: u64,
        nft_wallet_id: u64,
    }

    impl Suite {
        pub fn init() -> StResult<Suite> {
            let mut app = mock_app();
            let owner = OWNER.to_string();
            let cw721_id = app.store_code(contract_cw721()).unwrap();
            let nft_wallet_id = app.store_code(contract_nft_wallet()).unwrap();

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
                minter: String::from(USER.clone()),
            };
            let send_funds = vec![];
            let label = "new_NFT_contract".to_string();
            let admin = Some(self.owner.clone());

            self.app
                .instantiate_contract(code_id, sender, &init_msg, &send_funds, label, admin)
        }

        pub fn smart_query(
            &self,
            contract_addr: String,
            msg: QueryMsg,
        ) -> Result<Binary, StdError> {
            self.app.wrap().query_wasm_smart(contract_addr, &msg)
        }

        pub fn query_balance(&self, address: String, denom: String) -> Result<Coin, StdError> {
            self.app.wrap().query_balance(address, denom)
        }
    }

    #[test]
    fn test_deposit_and_withdraw_nft() {
        let mut suite = Suite::init().unwrap();
    }
}
