// pages/fees.tsx
import React from 'react';

const Fees = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Fees</h1>
      <p className="text-lg">
        Here is an overview of the fees associated with our platform:
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">Trading Fees</h2>
          <p>We charge a 0.2% fee on each transaction made on our platform.</p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold">Deposit/Withdrawal Fees</h2>
          <p>Fees for deposits and withdrawals depend on the method used and the cryptocurrency involved.</p>
        </div>
      </div>
    </div>
  );
};

export default Fees;
