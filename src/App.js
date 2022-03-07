import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Greeter from "./artifacts/contracts/Greeter.sol/Greeter.json";
import Token from "./artifacts/contracts/Token.sol/Token.json";

const greeterAddress = "0xBB2816b38C63668a3f7B2c0Afc084320C9853e11";
const tokenAddress = "0x34a98b7A7ea4bDA2F2913809778b9459DCfb399a";

function App() {
  const [greeting, setGreetingValue] = useState(null);
  const [greetingMessage, setGreetingMessage] = useState();
  const [userAccount, setUserAccount] = useState();
  const [amount, setAmount] = useState(0);
  const [balance, setBalance] = useState();
  const [successfulTransfer, setSuccessfulTransfer] = useState(false);

  //request access to the user's MetaMask account
  async function requestAccount() {
    const [account] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    return account;
  }

  // call the smart contrat, read the current greeting value
  useEffect(() => {
    async function fetchGreeting() {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(
          greeterAddress,
          Greeter.abi,
          provider
        );
        try {
          const data = await contract.greet();
          console.log("data: ", data);
          setGreetingMessage(data);
        } catch (error) {
          console.log("Error: ", error);
        }
      }
    }

    fetchGreeting();
  }, [greetingMessage]);

  // call the smart contract, send an update
  async function setGreeting() {
    if (!greeting) return;
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer);
      const transaction = await contract.setGreeting(greeting);
      await transaction.wait();
    }
  }

  useEffect(() => {
    async function getBalance() {
      if (typeof window.ethereum !== "undefined") {
        const account = requestAccount();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(tokenAddress, Token.abi, provider);
        const _getBalance = await contract.balanceOf(account);
        setBalance(_getBalance.toString());
      }
    }

    getBalance();
  }, [successfulTransfer, balance]);

  async function sendCoins() {
    setSuccessfulTransfer(false);
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(tokenAddress, Token.abi, signer);
      const transaction = await contract.transfer(userAccount, amount);
      await transaction.wait();
      transaction && setSuccessfulTransfer(true);
    }
  }

  return (
    <div>
      <header>
        <div>{greetingMessage && greetingMessage}</div>
        {successfulTransfer && balance ? (
          <div>
            You have successfully transeferred {amount} of ZETH, your balance is{" "}
            {balance}
          </div>
        ) : (
          balance && <div> Your wallet balance is {balance} </div>
        )}

        <div>
          <input
            onChange={(e) => setGreetingValue(e.target.value)}
            placeholder="Set greeting"
          />
          <button onClick={setGreeting}>Set Greeting</button>
        </div>
        <div>
          <input
            onChange={(e) => setUserAccount(e.target.value)}
            placeholder="Account ID"
          />
          <input
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
          />
          <button onClick={sendCoins}>Send Coins</button>
        </div>
      </header>
    </div>
  );
}

export default App;
