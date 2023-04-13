class Player:
    def __init__(self):
        self.exposure = 0
        self.max_exposure = 10
        self.trades = []
        self.myMarket = {}

    def make_market(self, market_provided):
        self.myMarket = {
                "bid_price": float(market_provided['bidPrice']),
                "ask_price": float(market_provided['askPrice']),
                "bid_size": float(market_provided['bidSize']),
                "ask_size": float(market_provided['askSize']),
                }

    def update_exposure_and_my_market(self, order_type, order_size, order_price):
        if order_type == 'buy':
            self.exposure -= order_size
            self.myMarket['ask_size'] -= order_size
        elif order_type == 'sell':
            self.exposure += order_size
            self.myMarket['bid_size'] -= order_size
        fill_type = 'sell' if order_type == 'buy' else 'buy'
        self.trades.append({"fill_type": fill_type, "trading_size": order_size, "order_price": order_price})

    def calculate_pnl(self, true_value):
        """
        Needs to be modified lol. This is bad.
        :param true_value:
        :return:
        """
        pnl = (true_value * self.exposure) - sum([trade["trading_size"] * trade["order_price"] for trade in self.trades])
        return pnl
