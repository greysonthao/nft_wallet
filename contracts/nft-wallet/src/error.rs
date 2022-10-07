use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Custom Error val: {val:?}")]
    CustomError { val: String },

    #[error("Invalid Owner")]
    InvalidOwner {},

    #[error("Invalid Coin")]
    InvalidCoin {},

    #[error("Offer from this address already exits for this token_id. Remove offer before submitting a new one.")]
    OfferAlreadyExists {},

    #[error("No offers exist from this sender for this token_id")]
    NoOffersExistForTokenID {},

    #[error("Address cannot submit an offer because it is on the blacklist")]
    OnTheBlacklist {},

    #[error("Contract does not possess token_id from this cw721 to withdraw")]
    NoCw721ToWithdraw {},
}
