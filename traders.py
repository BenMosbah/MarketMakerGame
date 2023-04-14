import random
import numpy as np


class Trader:
    def __init__(self, profile, std_dev=0.1):
        self.name = profile['name']
        self.risk_aversion_mean = profile['risk_aversion']
        self.expertise_mean = profile['expertise']
        self.trading_frequency_mean = profile['trading_frequency']
        self.risk_aversion = max(0., min(1., random.gauss(self.risk_aversion_mean, std_dev)))
        self.expertise = max(0., min(10., random.gauss(self.expertise_mean, std_dev)))
        self.trading_frequency = max(0., min(1., random.gauss(self.trading_frequency_mean, std_dev)))
        self.trading_size = profile['trading_size']
        self.position = 0

    def get_fair_bid_and_fair_ask(self, market_data, min_spread=0.05, max_spread=0.2, max_blur=0.5):
        risk_aversion = self.risk_aversion
        expertise = self.expertise
        true_value = market_data['true_value']

        noise_scale = (1 - expertise) * max_blur
        blurred_value = true_value + np.random.uniform(-true_value * noise_scale, true_value * noise_scale)
        blurred_value = max(min(blurred_value, true_value * (1 + max_blur)), true_value * (1 - max_blur))

        # Calculate the spread based on expertise
        spread = max_spread - (max_spread - min_spread) * risk_aversion

        # Calculate the fair bid and fair ask values
        fair_bid = blurred_value * (1 - spread / 2)
        fair_ask = blurred_value * (1 + spread / 2)

        return fair_bid, fair_ask

    def trade(self, market_data):
        player_market = market_data['player_market']
        bid_price, ask_price = player_market['bid_price'], player_market['ask_price']
        bid_size, ask_size = player_market['bid_size'],player_market['ask_size']

        fair_bid, fair_ask = self.get_fair_bid_and_fair_ask(market_data)

        # Only trade "trading_frequency" of the time
        if random.random() < self.trading_frequency:
            if fair_bid >= ask_price and ask_size > 0:
                # Buy at the ask price
                order_type = 'buy'
                order_price = ask_price
                order_size = min(self.trading_size, ask_size)
            elif fair_ask <= bid_price and bid_size > 0:
                # Sell at the bid price
                order_type = 'sell'
                order_price = bid_price
                order_size = min(self.trading_size, bid_size)
            else:
                # No trade
                order_type = None
                order_price = None
                order_size = None
        else:
            # No trade
            order_type = None
            order_price = None
            order_size = None

        return order_type, order_price, order_size

    def update_position(self, order_type, trading_size):
        if order_type == 'buy':
            self.position += trading_size
        elif order_type == 'sell':
            self.position -= trading_size

