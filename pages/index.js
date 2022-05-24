import React, { useEffect, useState } from 'react';
import Product from '../components/Product';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// Constants
const TWITTER_HANDLE = "Solana";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

  // This will fetch the user's public key
  const { publicKey } = useWallet();

  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (publicKey) {
      fetch(`/api/fetchProducts`)
        .then(response => response.json())
        .then(data => {
          console.log(data);
          setProducts(data);
          console.log("Products", data);
        });
    }
  }, [publicKey]); // Only re-run if publicKey changes

  const renderNotConnectedContainer = () => (
    <div>
      <img src="https://media.giphy.com/media/CEC5hqahyDPRDWjZsC/giphy.gif" alt="emoji" />

      <div className="button-container">
        <WalletMultiButton className="cta-button connect-wallet-button" />
      </div>
    </div>
  );

  const renderItemBuyContainer = () => (
    <div className="products-container">
      {products.map((product) => (
        <Product key={product.id} product={product} />
      ))}
    </div>
  );

  return (
    <div className="App">
      <div className="container">
        <header className="header-container">
          <p className="header"> Solpee </p>
          <p className="sub-text">Happeeness Mascots for your SOL</p>
        </header>

        <main>
          {/* We only render the connect button if public key doesn't exist */}
          {publicKey ? renderItemBuyContainer() : renderNotConnectedContainer()}

        </main>

        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src="twitter-logo.svg" />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built in @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
