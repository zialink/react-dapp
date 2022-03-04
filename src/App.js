import { useState } from "react";
import { ethers } from "ethers";
import Greeter from "./artifacts/contracts/Greeter.sol/Greeter.json";

const greeterAddress = "0x52fe55aF9AB97C68dE5CeE87FE140C9D8d53B012";

function App() {
  const [greeting, setGreetingValue] = useState(null);
  const [greetingMessage, setGreetingMessage] = useState("Hi");

  //request access to the user's MetaMask account
  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  // call the smart contrat, read the current greeting value
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
      fetchGreeting();
    }
  }
  return (
    <div>
      <header>
        <div>{greetingMessage && greetingMessage}</div>
        <div>
          <button onClick={fetchGreeting}> Fetch Greeting</button>
        </div>
        <div>
          <input
            onChange={(e) => setGreetingValue(e.target.value)}
            placeholder="Set greeting"
          />
          <button onClick={setGreeting}>Set Greeting</button>
        </div>
      </header>
    </div>
  );
}

export default App;
