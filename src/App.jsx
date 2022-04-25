import './App.css';
import { useEffect, useState } from 'react';
import decorationVideo from './assets/background.mp4';
import backgroundVideo from './assets/nftvideo.mp4';
import NFTImage from './assets/NFT.png';
import ReactLoading from 'react-loading';
import { useMoralis } from 'react-moralis';
import ABI from './contracts/Web3Build1155.json';
const JimmyWeb3Build1155ContractAddress = '0x43d5f1dCBf98d868dcE05804B3e393101Fad722b';
const options = {
  chain: 'rinkeby',
  address: JimmyWeb3Build1155ContractAddress,
  function_name: 'totalSupply',
  abi: ABI,
  params: {
    id: '0', //should pass as string and smart contract will convert it to uint
  },
};

function App() {
  const [inProgress, setInProgress] = useState(false);
  const [hash, setHash] = useState('');
  const [totalSupply, setTotalSupply] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { Moralis, authenticate, isAuthenticated, logout, isInitialized } = useMoralis();

  const mint = async () => {
    const sendOptions = {
      contractAddress: JimmyWeb3Build1155ContractAddress,
      functionName: 'mint',
      abi: ABI,
      params: {
        id: 0,
        amount: 1,
      },
      msgValue: Moralis.Units.ETH('0.001'),
    };

    const transaction = await Moralis.executeFunction(sendOptions);
    // console.log(transaction);
    setInProgress(true);
    setHash(transaction.hash);

    const receipt = await transaction.wait(3);
    // console.log(receipt);
    setInProgress(false);
    setHash('');
    setCompleted(true);

    // console.log('mint confirmed');
  };

  const logOutFunc = () => {
    logout();
    setCompleted(false);
  };

  const checkEtherScan = () => {
    window.open(`https://rinkeby.etherscan.io/tx/${hash}`, '_blank');
  };

  const viewOnOpenSea = () => {
    window.open('https://testnets.opensea.io/assets/0x43d5f1dcbf98d868dce05804b3e393101fad722b/0', '_blank');
  };

  const fetchTotalSupply = async () => {
    const result = await Moralis.Web3API.native.runContractFunction(options);
    // console.log(result);
    setTotalSupply(result);
  };

  useEffect(() => {
    // console.log('I ran!');
    if (isInitialized)
      (async () => {
        await fetchTotalSupply();
      })();
  }, [isInitialized, completed]);

  useEffect(() => {
    if (isAuthenticated) {
      (async () => {
        await Moralis.enableWeb3();
      })();
    }
  }, [isAuthenticated]);

  return (
    <div className="App">
      <video className="background-video" src={backgroundVideo} autoPlay muted loop width="500" height="300" />
      <div className="main">
        <div className="content">
          <div className="nft-container">
            <img src={NFTImage} className="nft-image" width="100" alt="big eyes" />
          </div>
          <div className="description">
            <video className="decoration-video" src={decorationVideo} autoPlay muted loop width="500" height="300" />
            <div className="heading">Big Eyes: INTO THE METAVERSE</div>
            <div className="info-text">{completed ? "Congratulations! You've just minted one NFT!" : `${totalSupply} minted / 100`}</div>
            {inProgress && <ReactLoading className="spinner" type="bubbles" color="#fff" height={34} />}
            <div className="actions">
              {isAuthenticated ? (
                <>
                  {inProgress ? (
                    <button className="filled-button" onClick={checkEtherScan}>
                      Check Etherscan
                    </button>
                  ) : completed ? (
                    <button className="filled-button" onClick={viewOnOpenSea}>
                      View OpenSea
                    </button>
                  ) : (
                    <button className="filled-button" onClick={mint}>
                      Mint
                    </button>
                  )}

                  <button className="transparent-button" onClick={logOutFunc} disabled={inProgress}>
                    {inProgress ? 'Wait...' : 'Start Over'}
                  </button>
                </>
              ) : (
                <>
                  <button className="filled-button" onClick={authenticate}>
                    Connect Wallet
                  </button>
                  <button className="transparent-button">Learn More</button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="footer">MINTING NOW</div>
      </div>
    </div>
  );
}

export default App;
