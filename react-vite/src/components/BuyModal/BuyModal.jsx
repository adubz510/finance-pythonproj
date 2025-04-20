import './BuyModal.css';

/**
 * BuyModal component for confirming stock purchases.
 * @param {string} symbol - Stock symbol (e.g., AAPL)
 * @param {string} name - Full stock name (e.g., Apple Inc.)
 * @param {number} quantity - Quantity to buy
 * @param {function} setQuantity - Handler for quantity changes
 * @param {function} onBuy - Handler when "Confirm Buy" is clicked
 * @param {function} onClose - Handler when modal is closed
 */
const BuyModal = ({ symbol, name, quantity, setQuantity, onBuy, onClose }) => {
  return (
    <div className="buy-modal-overlay">
      <div className="buy-modal-content">
        <h2>
          Buy {name ? `${name} (${symbol.toUpperCase()})` : symbol.toUpperCase()}
        </h2>

        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
        />

        <div className="modal-actions">
          <button onClick={onBuy} disabled={quantity <= 0}>Confirm Buy</button>
          <button onClick={onClose} className="cancel-button">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default BuyModal;
