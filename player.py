class Player:
    def __init__(self):
        self.exposure = 0
        self.max_exposure = 10
        self.trades = []
        self.myMarket = {}

    def make_market(self):
        while True:
            try:
                bid_price = float(input("Enter the bid price: "))
                ask_price = float(input("Enter the ask price: "))
                if bid_price >= ask_price:
                    print("The bid price must be lower than the ask price.")
                    continue

                bid_size = int(input("Enter the bid size: "))
                ask_size = int(input("Enter the ask size: "))
                if bid_size <= 0 or ask_size <= 0:
                    print("The bid size and ask size must be positive. Please try again.")
                    continue

                worst_case_exposure = max(abs(self.exposure + bid_size), abs(self.exposure - ask_size))
                if worst_case_exposure > self.max_exposure:
                    print("Your worst-case exposure cannot exceed 10 Units.")
                    continue

                self.myMarket = {
                    "bid_price": bid_price,
                    "ask_price": ask_price,
                    "bid_size": bid_size,
                    "ask_size": ask_size,
                }
                return
            except ValueError:
                print("Invalid input. Please try again.")

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
