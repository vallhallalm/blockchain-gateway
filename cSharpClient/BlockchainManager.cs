using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using System.Text;
using TMPro;
using System.Threading.Tasks;
using System.Collections.Generic;
using UnityEngine.UI;
using Unity.Services.CloudSave;
using Unity.Services.CloudSave.Models.Data.Player;
using System.Threading;
public class BlockchainManager : StaticInstance<BlockchainManager>
{
    #region Constants
    private string baseUrl = "https://api.kolizeo.fr/v1";
    public string PSGAddress = "0xb0Fa395a3386800658B9617F90e834E2CeC76Dd3";
    public string ERC20Address = "0x0E765E63fEcb574D327a7f5Daf99b831f7Ee78C7";
    public string NFTAddress = "0xa042e39761380A69e9f55719D18B682E42E034DB";
    public string NFTContractAddress = "0x3f836f7Bd7cC30c588720cA68eBbf96031D9409d";
    public string MyAddress = null;
    #endregion Constants
    public int currentNFTWinnableNumber = -1;
    public List<Image> _NFTImagesRef = new List<Image>();
    public List<GameObject> _NFTMissedRef = new List<GameObject>();
    public List<Sprite> _NFTImages = new List<Sprite>();

    [SerializeField] private Animator _profilePanelAnimator;
    public TextMeshProUGUI _walletBalance, _pseudo, _discount;

    #region CallAPi
    public void CreateAddress(string userId, Action<AddressResponse> onSuccess, Action<string> onError)
    {
        string url = $"{baseUrl}/address";
        string json = $"{{\"userId\":\"{userId}\"}}";
        StartCoroutine(PostRequest(url, json, onSuccess, onError));
    }

    public void GetAddressMainBalance(string address, Action<BalanceResponse> onSuccess, Action<string> onError)
    {
        string url = $"{baseUrl}/address/{address}/balance";
        StartCoroutine(GetRequest(url, onSuccess, onError));
    }

    public void GetAddressSecondaryBalance(string address, string tokenId, Action<BalanceResponse> onSuccess, Action<string> onError)
    {
        string url = $"{baseUrl}/address/{address}/balance/{tokenId}";
        StartCoroutine(GetRequest(url, onSuccess, onError));
    }

    public void TransferERC20(string from, string to, int amount, string token, Action<string> onSuccess, Action<string> onError)
    {
        string url = $"{baseUrl}/transfer/erc20";
        string json = $"{{\"from\":\"{from}\",\"to\":\"{to}\",\"amount\":{amount},\"token\":\"{token}\"}}";
        StartCoroutine(PostRequest(url, json, onSuccess, onError));
    }

    public void TransferNFT(string from, string to, int amount, string token, int tokenId, Action<string> onSuccess, Action<string> onError)
    {
        string url = $"{baseUrl}/transfer/nft";
        string json = $"{{\"from\":\"{from}\",\"to\":\"{to}\",\"amount\":{amount},\"token\":\"{token}\",\"tokenId\":{tokenId}}}";
        StartCoroutine(PostRequest(url, json, onSuccess, onError));
    }

    public void GetNFTCollection(string address, Action<NFTCollectionResponse> onSuccess, Action<string> onError)
    {
        string endpoint = $"{baseUrl}/address/{address}/balance/nft";
        StartCoroutine(GetRequest(endpoint, onSuccess, onError));
    }

    public void GetMintedNFTs(string address, Action<MintedNFTs> onSuccess, Action<string> onError)
    {
        string endpoint = $"{baseUrl}/address/{address}/mintedToken";
        StartCoroutine(GetRequest(endpoint, onSuccess, onError));
    }

    public void CheckNFTValidity(string address, string token, string tokenId, Action<NFTValidityResponse> onSuccess, Action<string> onError)
    {
        string endpoint = $"{baseUrl}/address/{address}/token/{token}/tokenId/{tokenId}/validity";
        StartCoroutine(GetRequest(endpoint, onSuccess, onError));
    }

    public void SubmitMatch(string matchJson, Action<string> onSuccess, Action<string> onError)
    {
        string url = $"{baseUrl}/match";
        StartCoroutine(PostRequest(url, matchJson, onSuccess, onError));
    }

    public void SubmitDraw(string giveawayJson, Action<string> onSuccess, Action<string> onError)
    {
        string url = $"{baseUrl}/draw";
        StartCoroutine(PostRequest(url, giveawayJson, onSuccess, onError));
    }
    #endregion CallAPi

    /// ---------- Core GET ----------
    private IEnumerator GetRequest<T>(string uri, Action<T> onSuccess, Action<string> onError)
    {
        using (UnityWebRequest request = UnityWebRequest.Get(uri))
        {
            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                try
                {
                    T data = JsonUtility.FromJson<T>(request.downloadHandler.text);
                    onSuccess?.Invoke(data);
                }
                catch (Exception e)
                {
                    onError?.Invoke("Parsing error: " + e.Message);
                }
            }
            else
            {
                onError?.Invoke($"GET Error {request.error}");
            }
        }
    }

    // ---------- Core POST ----------
    private IEnumerator PostRequest<T>(string uri, string json, Action<T> onSuccess, Action<string> onError)
    {
        using (UnityWebRequest request = new UnityWebRequest(uri, "POST"))
        {
            byte[] bodyRaw = Encoding.UTF8.GetBytes(json);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");

            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                try
                {
                    T data = JsonUtility.FromJson<T>(request.downloadHandler.text);
                    onSuccess?.Invoke(data);
                }
                catch (Exception e)
                {
                    onError?.Invoke("Parsing error: " + e.Message);
                }
            }
            else
            {
                onError?.Invoke($"POST Error {request.error}");
            }
        }
    }

    public void AnimateProfilePanel(bool open)
    {
        _profilePanelAnimator.SetBool("Profile", open);
    }

    public async Task<bool> SetAccountInfoAsync(string address)
    {
        if (string.IsNullOrEmpty(address))
            address = await SaveService.GetEVMAddress();

        MyAddress = address;
        currentNFTWinnableNumber = -1;

        GetAddressSecondaryBalance(address, PSGAddress,
            onSuccess: (res) => _walletBalance.text = res.balance,
            onError: (err) =>
            {
                Debug.LogError("Erreur balance: " + err + " - Adresse: " + address);
                _walletBalance.text = "0";
            });

        var Pseudo = await SaveService.GetPseudo();
        _pseudo.text = Pseudo == null ? "Anonymous" : Pseudo;

        List<int> tokenIds = new List<int>();

        GetNFTCollection(address,
        onSuccess: (res) =>
        {
            foreach (var nftcoll in res.nftCollections)
            {
                foreach (var nft in nftcoll.nfts)
                {
                    tokenIds.Add(int.Parse(nft.tokenId));
                }
            }
            GetMintedNFTs(NFTContractAddress,
        onSuccess: (res) =>
        {
            _discount.text = $"Current discount  :   <b>{tokenIds.Count * 5}%</b>";
            foreach (var nft in res.mintedNfts)
            {
                if (int.Parse(nft.tokenId) != res.mintedNfts.Length)
                    _NFTImagesRef[int.Parse(nft.tokenId) - 1].sprite = _NFTImages[int.Parse(nft.tokenId) - 1];

                if (tokenIds.Contains(int.Parse(nft.tokenId)))
                {
                    _NFTImagesRef[int.Parse(nft.tokenId) - 1].sprite = _NFTImages[int.Parse(nft.tokenId) - 1];
                    _NFTMissedRef[int.Parse(nft.tokenId) - 1].SetActive(false);
                }
                else if (int.Parse(nft.tokenId) != res.mintedNfts.Length)
                {
                    _NFTMissedRef[int.Parse(nft.tokenId) - 1].SetActive(true);
                }
                else
                {
                    currentNFTWinnableNumber = int.Parse(nft.tokenId);
                }
            }
        },
        onError: (err) => Debug.LogError("Erreur GetMintedNFTs: " + err));
        },
        onError: (err) => Debug.LogError("Erreur NFT: " + err));
        return true;
    }

    public async void SubmitFanToken()
    {
        var topResults = (await LeaderboardService.GetPaginatedScores(LeaderBoardGameManager.Instance.GameId, 0, LeaderBoardGameManager.Instance.Lots.Count)).Results;
        int lotResults = 0;
        foreach (var winner in topResults)
        {
            var playerData = await CloudSaveService.Instance.Data.Player.LoadAsync(new HashSet<string> { "EVMAddress" }, new LoadOptions(new PublicReadAccessClassOptions(winner.PlayerId)));
            if (playerData.TryGetValue("EVMAddress", out var keyName))
            {
                TransferERC20(
                ERC20Address,
                keyName.Value.GetAs<string>(),
                LeaderBoardGameManager.Instance.Lots[lotResults].Amount,
                Instance.PSGAddress,
                onSuccess: (res) => Debug.Log("TransferERC20 valide"),
                onError: (err) => Debug.LogError("Erreur TransferERC20: " + err));
            }
            lotResults++;
            Thread.Sleep(2000);
        }

        var matchResults = (await LeaderboardService.GetPaginatedScores(LeaderBoardGameManager.Instance.GameId, 0, 100)).Results;

        string matchJson = @"{
        ""matchSummary"": [";
        foreach (var player in matchResults)
        {
            matchJson += $@"{{""userId"": ""{player.PlayerId}"", ""score"": {player.Score}}},";
        }
        matchJson = matchJson.Remove(matchJson.Length - 1);
        matchJson += @"],
            ""location"": ""Parc des princes""
        }";

        SubmitMatch(matchJson,
        onSuccess: (res) => Debug.Log("SubmitMatch valide"),
        onError: (err) => Debug.LogError("Erreur SubmitMatch: " + err));
    }
    
    public async void SubmitGiveaway()
    {
        var matchResults = (await LeaderboardService.GetPaginatedScores("PSGxChiliz", 0, 100)).Results;

        string giveawayJson = "[";
        foreach (var player in matchResults)
        {
            var playerData = await CloudSaveService.Instance.Data.Player.LoadAsync(new HashSet<string> { "EVMAddress" }, new LoadOptions(new PublicReadAccessClassOptions(player.PlayerId)));
            if (playerData.TryGetValue("EVMAddress", out var keyName))
            {
                giveawayJson += $@"""{keyName.Value.GetAs<string>()}"",";
            }
        }
        giveawayJson = giveawayJson.Remove(giveawayJson.Length - 1);
        giveawayJson += "]";

        SubmitDraw(giveawayJson,
        onSuccess: (res) => Debug.Log($"SubmitGiveaway valide {res}"),
        onError: (err) => Debug.LogError("Erreur SubmitGiveaway: " + err));
        
    }
}

[System.Serializable]
public class AddressResponse
{
    public string address;
}

[System.Serializable]
public class BalanceResponse
{
    public string address;
    public string balance;
    public string token;
}

[System.Serializable]
public class NFTCollectionResponse
{
    public NFTCollection[] nftCollections;
}

[System.Serializable]
public class NFTCollection
{
    public NFT[] nfts;
}

[System.Serializable]
public class NFT
{
    public string contractAddress;
    public string tokenId;
    public int balance;
    public Metadata metadata;
}

[System.Serializable]
public class MintedNFTs
{
    public MintedNFT[] mintedNfts;
}

[System.Serializable]
public class MintedNFT
{
    public string tokenId;
    public Metadata metadata;
}

[System.Serializable]
public class Metadata
{
    public string name;
    public string description;
    public string image;
}

[System.Serializable]
public class NFTValidityResponse
{
    public bool isValid;
}