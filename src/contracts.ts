export const PONS_V2_CONFIG = {
  chainId: 4663,
  chainName: 'Robinhood Chain',
  currency: 'ETH',
  contracts: {
    token: import.meta.env.VITE_TOKEN_ADDRESS || '0xa6a44f24780b95d467d482de278a017fd6d7c2b3',
    curve: import.meta.env.VITE_CURVE_ADDRESS || '0x77cc005727f671058d9EC29F7D5e470bd99727F6',
    creator: import.meta.env.VITE_CREATOR_ADDRESS || '0x71dfd25CFf0BEb5128Bf655A2e72a9D01b518F2c',
    factory: '0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e',
    feeEscrow: '0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e',
    buybackVault: '0x42df2a798f82289E177311362e8f5ccC45c1219c',
    memeHook: '0xE5e702641Ea86F4ae6cC3cDaeD2B886f976Be044',
    launchLocker: '0x267444D099b10fB5Ed7c3Cc7B7c767AdcA574952',
    deadAddress: '0x000000000000000000000000000000000000dEaD'
  }
};
