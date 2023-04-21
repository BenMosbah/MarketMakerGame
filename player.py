class Player:
    def __init__(self):
        self.exposure = 0
        self.max_exposure = 10
        self.trades = []
        self.myMarket = {}
        self.markets = []

    def make_market(self, market_provided):
        self.myMarket = {
                "bid_price": float(market_provided['bidPrice']),
                "ask_price": float(market_provided['askPrice']),
                "bid_size": float(market_provided['bidSize']),
                "ask_size": float(market_provided['askSize']),
                }
        self.markets.append(self.myMarket)

    def update_exposure_and_my_market(self, order_type, order_size, order_price, round):
        if order_type == 'buy':
            self.exposure -= order_size
            self.myMarket['ask_size'] -= order_size
        elif order_type == 'sell':
            self.exposure += order_size
            self.myMarket['bid_size'] -= order_size
        fill_type = 'sell' if order_type == 'buy' else 'buy'
        self.trades.append({"fill_type": fill_type, "trading_size": order_size, "order_price": order_price, "round":round})

    def calculate_pnl(self, true_value):
        pnl_raw = sum([trade["trading_size"] * (true_value - trade["order_price"]) for trade in self.trades])
        pnl_percentage = pnl_raw/true_value * 100
        return int(pnl_percentage)

    def get_tightness_score(self):
        markets = self.markets
        spreads = [(m['ask_price']-m['bid_price'])*2/(m['ask_price']+m['bid_price']) for m in markets]
        average_spread = sum(spreads)/len(spreads)
        return round(average_spread*100)

    def get_liquidity_score(self):
        markets = self.markets
        bid_sizes = [m['bid_size'] for m in markets]
        ask_sizes = [m['ask_size'] for m in markets]
        average_bid_size = sum(bid_sizes)/len(bid_sizes)
        average_ask_size = sum(ask_sizes)/len(ask_sizes)
        return round((average_bid_size+average_ask_size)/2,1)


    def get_inventory_score(self):
        return self.exposure