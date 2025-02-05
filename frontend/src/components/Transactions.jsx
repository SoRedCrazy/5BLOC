import React, { useEffect, useState } from 'react';
import { getTransactionHistory } from '../contract/contract';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 10000);
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const transactionHistory = await getTransactionHistory();
        setTransactions(transactionHistory);
      } catch (error) {
        console.error("Erreur lors de la récupération des transactions:", error);
        showNotification("Erreur lors de la récupération des transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return <p>Chargement des transactions...</p>;
  }

  return (
    <div className="transactions-container">
      {notification && <div className="notification">{notification}</div>}
      <table>
        <thead>
          <tr>
            <th>ID du Token</th>
            <th>De</th>
            <th>À</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={index}>
              <td>{transaction.tokenId}</td>
              <td>{transaction.from}</td>
              <td>{transaction.to}</td>
              <td>{new Date(transaction.timestamp * 1000).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Transactions;
