const mapPostedAddress = (addressData: {
    address: string;
    privateKey: string;
    mnemonic: string | undefined;
}) => {
    return { address: addressData.address };
};

const mapAddressBalance = (addressData: { address: string; balance: string }, token: string) => {
    return {
        address: addressData.address,
        token,
        balance: addressData.balance,
    };
};

const mapAddressNftBalance = (addressData: {
    balances: Record<number, number>;
    tokenMetadata: Record<string, any>;
    contractAddress: string;
}) => {
    return Object.entries(addressData.balances)
        .map(([tokenId, balance]) => ({
            tokenId: Number(tokenId),
            balance,
            contractAddress: addressData.contractAddress,
            metadata: addressData.tokenMetadata[tokenId] || {},
        }))
        .filter((nft) => nft.balance > 0);
};

const mapAddressNftValidity = (balance: bigint) => {
    return { isValid: balance > 0 };
};

const mapContractIssuedNfts = (tokenMetadata: Record<string, any> = {}) => {
    return {
        mintedNfts: Object.entries(tokenMetadata).map(([id, metadata]) => ({
            tokenId: id,
            metadata,
        })),
    };
};

export default {
    mapPostedAddress,
    mapAddressBalance,
    mapAddressNftBalance,
    mapAddressNftValidity,
    mapContractIssuedNfts,
};
