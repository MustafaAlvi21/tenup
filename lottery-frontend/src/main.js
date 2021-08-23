import React, { useEffect, useState } from 'react';
import web3 from './web3';
import './App.css';
import Lottery from './ethereum/Lottery';
import LotteryDetailC from './components/lotteryDetail'
import BuyTicekts from './components/buyTickets';
import CheckWinners from './components/checkWinner';

function Main() {
  const [user, setUser] = useState({});
  const [currentLotryId, setCurrentLotryId] = useState('');
  const [currentLotryDetails, setCurrentLotryDetails] = useState('');

  const getLotryId = async () => {
    const r = await Lottery.methods.currentLotteryId().call();
    const lotteryDetails = await Lottery.methods.viewLottery(r).call();
    console.log(r);
    console.log(lotteryDetails);
    setCurrentLotryId(r);
    setCurrentLotryDetails(lotteryDetails);
  }

  useEffect(() => {
    getLotryId();
  }, []);

  const connectMetamask = async () => {
    console.log("here");
    if (!window.ethereum) {
      alert("Install metamask first!");
    } else if (window.ethereum.chainId !== process.env.REACT_APP_CHAIN_ID) {
        alert("Connect to Ropsten");
    } else {
      var accs = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accs.length > 0) {
        getUser(accs[0]);
      } else {
        alert("Please connect to MetaMask.");
      }
    }
  };

  const setMinAndMaxTicketPriceInCake = async () => {
    let minPrice = document.getElementById('minticket').value;
    let maxPrice = document.getElementById('maxticket').value;
    console.log(minPrice, maxPrice);
    if (minPrice && maxPrice){
      console.log(web3.utils.toWei(minPrice), web3.utils.toWei(maxPrice));
      const r = await Lottery.methods.setMinAndMaxTicketPriceInCake(web3.utils.toWei(minPrice), web3.utils.toWei(maxPrice)).send({
        from: user.address
      });
      console.log(r);
      alert('Success');
    }
    else{
      alert('Failed');
    }
  }

  const setMaxNumberTicketsPerBuy = () => {
    var maxPrice = document.getElementById('maxticketperbuy').value;
    if (maxPrice){
      alert('Success');
    }
    else{
      alert('Failed');
    }
  }

  const addAddress = async () => {
    const opaddress = document.getElementById('opaddress').value;
    const treasuryaddress = document.getElementById('treasuryaddress').value;
    const injectoraddress = document.getElementById('injectoraddress').value;
    if (opaddress && treasuryaddress && injectoraddress){
      const r = await Lottery.methods.setOperatorAndTreasuryAndInjectorAddresses(opaddress, treasuryaddress, injectoraddress).send({from: user.address});
      console.log(r);
      alert('Success');
    }
    else{
      alert('Failed');
    }
  }

  const getUser = (addr) => {
    fetch(`${process.env.REACT_APP_BASE_URL}/users/${addr}`)
      .then((res) => res.json())
      .then(async (res) => {
        if (res.success) {
          console.log(res.user);
          const b = await web3.eth.getBalance(addr);
          res.user.balance = web3.utils.fromWei(b);
          console.log(res);
          setUser(res.user);
        } else {
          console.log(res);
        }
      });
  };

  const startLottery = async () => {
    var divisor = 10;
    var endtime = document.getElementById('endtime').value;
    var ticketpriceincake = document.getElementById('ticketpriceincake').value;
    var treasuryfee = document.getElementById('treasuryfee').value;
    var bone = parseInt(document.getElementById('bone').value);
    var btwo = parseInt(document.getElementById('btwo').value);
    var bthree = parseInt(document.getElementById('bthree').value);
    var bfour = parseInt(document.getElementById('bfour').value);
    var bfive = parseInt(document.getElementById('bfive').value);
    var bsix = parseInt(document.getElementById('bsix').value);
    console.log(endtime);
    let d = new Date(endtime);
    d = d.getTime()/1000;
    if (bone+btwo+bthree+bfour+bfive+bsix === 100){
      try{
        console.log(d, web3.utils.toWei(ticketpriceincake), divisor, [bone*100, btwo*100, bthree*100, bfour*100, bfive*100, bsix*100], parseInt(treasuryfee)*100)
        const r = await Lottery.methods.startLottery(d, web3.utils.toWei(ticketpriceincake), divisor, [bone*100, btwo*100, bthree*100, bfour*100, bfive*100, bsix*100], parseInt(treasuryfee)*100).send({
          from : user.address
        })
        console.log(r);
        getLotryId();
        alert('Success');  
      }
      catch(e){
        console.log(e);
        alert('Failed');
      }
    }
    else{
      alert('Breakdown sum not equal to 100')
    }
  }
  function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
  }

  const closeLottery = async () => {
    if (currentLotryDetails[0] === "1"){ // if open
      const r = await Lottery.methods.closeLottery(currentLotryId).send({
        from: user.address
      });
      console.log(r);
      getLotryId();
      alert('Success');
    }
    else{
      alert(`Failed: Lottery not open, status: ${currentLotryDetails[0]}`);
    }
  }
  const drawLottery = async () => {
    if (currentLotryDetails[0] === "2"){ // if closed
      const r = await Lottery.methods.drawFinalNumberAndMakeLotteryClaimable(currentLotryId, true).send({
        from: user.address
      });
      console.log(r);
      getLotryId();
      alert('Success');
    }
    else{
      alert(`Failed: Lottery not closed, status: ${currentLotryDetails[0]}`);
    }
  }


  if (Object.keys(user).length > 0){
    if (user.address === process.env.REACT_APP_ADMIN_ADDRESS.toLowerCase()){
      return(
        <>
          <div>Admin Logged In as: {user.address}</div>
          <hr/>
          {(currentLotryDetails[0] === "0" | currentLotryDetails[0] === "3") &&  ( // if lottery is either pending or claimable
              <>
              <input placeholder="Min Ticekt Price" id="minticket" type="number" />
              <input placeholder="Max Ticekt Price" id="maxticket" type="number" /><br/>
              <button onClick={setMinAndMaxTicketPriceInCake}>
                setMinAndMaxTicketPriceInCake            
              </button>
              {/* <hr/>
              <input placeholder="Max Ticekt Per Buy" id="maxticketperbuy" type="number" />
              <button onClick={setMaxNumberTicketsPerBuy}>
                setMaxNumberTicketsPerBuy              
              </button> */}
              <hr/>
              <input placeholder="Operator Address" id="opaddress" />
              <input placeholder="Treasury Address" id="treasuryaddress" />
              <input placeholder="Injector Address" id="injectoraddress" />
              <button onClick={addAddress}>
                setOperatorAndTreasuryAndInjectorAddresses
              </button>
              <hr/>
              {/* <input placeholder="Discount Divisor" id="discountdivisor" /> */}
              <input placeholder="End Time" id="endtime" type="datetime-local" />
              <input placeholder="Ticket Price in Cake" id="ticketpriceincake" />
              <input placeholder="Treasury Fee" id="treasuryfee" />
              
              <input placeholder="Breakdown One" id="bone" />
              <input placeholder="Breakdown Two" id="btwo" />
              <input placeholder="Breakdown Three" id="bthree" />
              <input placeholder="Breakdown Four" id="bfour" />
              <input placeholder="Breakdown Five" id="bfive" />
              <input placeholder="Breakdown Six" id="bsix" />

              <button onClick={startLottery}>
                startLottery
              </button>
              <hr/>
              </>
          )}
          {((currentLotryDetails[0] === "1") && (//if it is open
            <>
              <div>
                <p>Lottery ID: {currentLotryId}</p>
                <p>Start Time: {timeConverter(currentLotryDetails[1])}</p>
                <p>End Time: {timeConverter(currentLotryDetails[2])}</p>
                <p>Ticket Price: {web3.utils.fromWei(currentLotryDetails[3])}</p>
                <p>Rewards Breakdown:
                </p>
                <table>
                    <tr>
                      <th>Numbers Matched</th>
                      <th>Percentage</th>
                      <th>Tokens Per Bracket</th>
                      <th>Number of winners in this Bracket</th>
                    </tr>
                    {currentLotryDetails[5].map((percnt, ind) => {
                      return(
                      <tr key={ind}>
                        <td>First {ind+1} numbers matched</td>
                        <td>{percnt/100}%</td>
                        <td>{(percnt/10000)*(currentLotryDetails[11] - (currentLotryDetails[11]*(currentLotryDetails[6]/10000)))}</td>
                        <td>{currentLotryDetails[8][ind]}</td>
                      </tr>);
                    })}
                  </table>
              </div>
              <button onClick={closeLottery}>Close Lottery</button>
            </>
          ))}
          {(currentLotryDetails[0] === "2") && (
            <>
              <div>
                <p>Lottery ID: {currentLotryId}</p>
                <p>Start Time: {timeConverter(currentLotryDetails[1])}</p>
                <p>End Time: {timeConverter(currentLotryDetails[2])}</p>
                <p>Ticket Price: {web3.utils.fromWei(currentLotryDetails[3])}</p>
                <p>Rewards Breakdown:
                </p>
                <table>
                    <tr>
                      <th>Numbers Matched</th>
                      <th>Percentage</th>
                      <th>Tokens Per Bracket</th>
                      <th>Number of winners in this Bracket</th>
                    </tr>
                    {currentLotryDetails[5].map((percnt, ind) => {
                      return(
                      <tr key={ind}>
                        <td>First {ind+1} numbers matched</td>
                        <td>{percnt/100}%</td>
                        <td>{(percnt/10000)*(currentLotryDetails[11] - (currentLotryDetails[11]*(currentLotryDetails[6]/10000)))}</td>
                        <td>{currentLotryDetails[8][ind]}</td>
                      </tr>);
                    })}
                  </table>
              </div>
              <button onClick={drawLottery}>Draw Lottery</button>            
            </>
          )}
          <button onClick={() => setUser({})}>Logout</button>
          
        </>
      );  
    }
    else{
      return(
          <>
            <div>Logged In as: {user.address}</div>
            <button onClick={() => setUser({})}>Logout</button>
            {((currentLotryDetails[0] === "1") && (//if it is open
            <>
              <div>
                <p>Lottery ID: {currentLotryId}</p>
                <p>Start Time: {timeConverter(currentLotryDetails[1])}</p>
                <p>End Time: {timeConverter(currentLotryDetails[2])}</p>
                <p>Ticket Price: {web3.utils.fromWei(currentLotryDetails[3])}</p>
                <p>Rewards Breakdown:
                </p>
                <table>
                    <tr>
                      <th>Numbers Matched</th>
                      <th>Percentage</th>
                      <th>Tokens Per Bracket</th>
                      <th>Number of winners in this Bracket</th>
                    </tr>
                    {currentLotryDetails[5].map((percnt, ind) => {
                      return(
                      <tr>
                        <td>First {ind+1} numbers matched</td>
                        <td>{percnt/100}%</td>
                        <td>{(percnt/10000)*(currentLotryDetails[11] - (currentLotryDetails[11]*(currentLotryDetails[6]/10000)))}</td>
                        <td>{currentLotryDetails[8][ind]}</td>
                      </tr>);
                    })}
                  </table>
              </div>
              <BuyTicekts lotteryId={currentLotryId} lotteryDetails={currentLotryDetails} user={user} />
            </>
            ))}
            <LotteryDetailC user={user} />
            <CheckWinners user={user} />
          </>
      );
    }
  }
  return (
    <div>
      <button onClick={() => connectMetamask()}>Connect Wallet</button>
    </div>
  );
}

export default Main;
