from traders import Trader
import json

trader_configs = json.load(open('trader_config.json'))
market_data = {}
true_value = 11
market_data['true_value'] = true_value

traders_dictionary = dict()
for name in ['A', 'B', 'C', 'D']:
    traders_dictionary[name] = Trader(trader_configs[name])


def play_a_round(market_provided, player):
    # Play one round
    player.make_market(market_provided)
    market_data['player_market'] = player.myMarket
    print(player.myMarket)
    round_id = market_provided['round']

    for name in ['A', 'B', 'C', 'D']:
        order_type, order_price, order_size,reason = traders_dictionary[name].trade(market_data)
        if order_type is not None:
            print(f"Market is [{player.myMarket['bid_size']}]@{player.myMarket['bid_price']} | [{player.myMarket['ask_size']}]@{player.myMarket['ask_price']}")
            print(f'Trader {name} submits a {order_type} {order_size} @ {order_price}')
            player.update_exposure_and_my_market(order_type, order_size, order_price, round_id)
            market_data['player_market'] = player.myMarket
            print(f"Market is left [{player.myMarket['bid_size']}]@{player.myMarket['bid_price']} | [{player.myMarket['ask_size']}]@{player.myMarket['ask_price']}")
        else:
            print(f"Trader {name} does not trade. Because {reason}")
    return {'exposure': player.exposure,
            'trades': player.trades,
            'current_round': round_id}
