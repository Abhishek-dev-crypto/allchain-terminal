'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import OrderBook from '../components/OrderBook';

const OrderPanel = ({ price, coin }: { price: number; coin: string }) => {
  return (
    <div className="w-full bg-neutral-900 p-4">
      <Tabs defaultValue="orderbook">

        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="orderbook">Order Book</TabsTrigger>
          <TabsTrigger value="history">Trade History</TabsTrigger>
        </TabsList>

        {/* ORDER BOOK */}
        <TabsContent value="orderbook">
          <div className="flex justify-between text-xs text-gray-400 py-2">
            <span>Bids</span>
            <span>Asks</span>
          </div>

         <OrderBook symbol={coin} />
        </TabsContent>

        {/* TRADE HISTORY */}
        <TabsContent value="history">
          <div className="text-xs text-gray-400 mt-2">Recent Trades</div>
          <ul className="text-xs mt-1 space-y-1 break-all">
            <li className="text-green-400">BUY @ 0.0000000656</li>
            <li className="text-red-400">SELL @ 0.0000000657</li>
          </ul>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default OrderPanel;