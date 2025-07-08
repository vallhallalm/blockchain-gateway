const mapPostedAddress = (addressData: {
    address: string;
    privateKey: string;
    mnemonic: string | undefined;
}) => {
    return { address: addressData.address };
};

export default { mapPostedAddress };
