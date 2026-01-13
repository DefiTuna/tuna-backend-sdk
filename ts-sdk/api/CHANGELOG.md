# @crypticdot/defituna-api

## 3.0.2

### Patch Changes

- 99797c1: FeeAmountWithUsd struct update

## 3.0.1

### Patch Changes

- dff8249: Fix autoconversion of all i64 to bigint

## 3.0.0

### Major Changes

- 8489d4b: SDK based on OpenAPI autogeneration

## 1.10.16

### Patch Changes

- 4699593: fix: [TUNA-1675] Revert Pool Typing (stats.groups)

## 1.10.15

### Patch Changes

- 2410143: fix: [TUNA-1675] Pool Typing (stats.groups)

## 1.10.14

### Patch Changes

- 8c35e16: fix: SubscriptionPayload type

## 1.10.13

### Patch Changes

- 6919552: fix: StateSnapshot typing wasn't updated

## 1.10.12

### Patch Changes

- 1666e24: feat: [TUNA-1675] Update Pool DTO, and make all entities with pool_address to use Pool DTO now

## 1.10.11

### Patch Changes

- b300446: feat: [TUNA-1675] Update state snapshot & markets & pools API

## 1.10.10

### Patch Changes

- 4259acc: fix: Pool Sqrt Price in State Snapshot

## 1.10.9

### Patch Changes

- a75d8b6: feat: Order book inverted price && removed pool prices

## 1.10.8

### Patch Changes

- 73fa14f: feat: Add pool price to order book state snapshot

## 1.10.7

### Patch Changes

- dba2a26: feat: Add PoolSnapshot object to StateSnapshot

## 1.10.6

### Patch Changes

- 2cb8460: feat: Add OrderBook types to state snapshot

## 1.10.5

### Patch Changes

- 1672b27: feat: Add order mint to LimitOrder DTO

## 1.10.4

### Patch Changes

- 6891828: feat: Limit Order DTO update + removed unnessary notifications

## 1.10.3

### Patch Changes

- 86a02be: fix: Replace lower/upper_price by lower/upper_tick_index in LP position DTO v2

## 1.10.2

### Patch Changes

- bcdf222: feat: Add name to mints and use mint object inside SPOT & LP positions

## 1.10.1

### Patch Changes

- ea79ddd: Changing tuna LP position DTO for GET ../users/{wallet}/tuna-positions

## 1.10.0

### Minor Changes

- ce882a0: LP history API endpoints

## 1.9.0

### Minor Changes

- c730964: Update zod and fix notification authority type

## 1.8.4

### Patch Changes

- 7bfa48f: Fix state snapshot schema

## 1.8.3

### Patch Changes

- de09c15: Export additional types

## 1.8.2

### Patch Changes

- 1f3e123: Migrate StateSnapshot to PoolPriceUpdate

## 1.8.1

### Patch Changes

- c319dc7: Add state snapshot notification entity

## 1.8.0

### Minor Changes

- f9e84c4: Add snapshot update notification entity

## 1.7.0

### Minor Changes

- eff2c40: Add close spot position quote endpoint

## 1.6.0

### Minor Changes

- 5ad901e: Add limit orders quotes endpoints and allow AbortSignal in quote requests

## 1.5.3

### Patch Changes

- ccf107d: Update quote and tradable amount endpoints

## 1.5.2

### Patch Changes

- 8512b7a: Add ui liquidation price to tuna spot positions

## 1.5.1

### Patch Changes

- 1074276: Quotes endpoints fixes

## 1.5.0

### Minor Changes

- bdd7a6b: Add quotes endpoints

## 1.4.3

### Patch Changes

- 4d31d16: Add order history UI direction filter

## 1.4.2

### Patch Changes

- 3ce2df2: Remove limit order prices from order history

## 1.4.1

### Patch Changes

- 1d86e62: Add USD values to consumed & filled amounts for order history

## 1.4.0

### Minor Changes

- fd9d004: Order history & New market fields

## 1.3.9

### Patch Changes

- afbf2fb: Remove deprecated fields

## 1.3.8

### Patch Changes

- 4959406: Adjust trade history pnl struct

## 1.3.7

### Patch Changes

- ca90030: Add pnl bps to trade history entry

## 1.3.6

### Patch Changes

- f8bbe8d: Add spot position leverage field

## 1.3.5

### Patch Changes

- 3f7fdff: Fix trade history action filter

## 1.3.4

### Patch Changes

- dd04430: Expand trade history action enum

## 1.3.3

### Patch Changes

- 8d0de5f: Add trade history subscription topic

## 1.3.2

### Patch Changes

- 0f1be5b: Adjust trade history dto

## 1.3.1

### Patch Changes

- bf77bf4: Add trade history endpoint

## 1.3.0

### Minor Changes

- bcb4aed: Support limit orders filters & pagination

## 1.2.1

### Patch Changes

- fd08f53: Add spot position notification entity

## 1.2.0

### Minor Changes

- f197784: Add tuna spot position endpoints

## 1.1.56

### Patch Changes

- 310180f: Remove URL class usage

## 1.1.55

### Patch Changes

- ead10ed: Add new sqrt price fields

## 1.1.54

### Patch Changes

- 21be58c: Add staking position rank

## 1.1.53

### Patch Changes

- aa6065c: Add staking leaderboard search

## 1.1.52

### Patch Changes

- 3b85984: Add staking leaderboard

## 1.1.51

### Patch Changes

- fa5d5f1: Add vault & market fields

## 1.1.50

### Patch Changes

- 85b3918: Adjust staking revenue endpoint filters logic

## 1.1.49

### Patch Changes

- 12472cb: Add treasury flags

## 1.1.48

### Patch Changes

- 8e664ef: Fix staking revenue stats mistype

## 1.1.47

### Patch Changes

- 8e51bc4: Add staking revenue stats endpoint

## 1.1.46

### Patch Changes

- 0ea1485: Add olp fee rate

## 1.1.45

### Patch Changes

- a810e86: Add compound rewards action to staking history

## 1.1.44

### Patch Changes

- 6e12b10: Add fees stats endpoint

## 1.1.43

### Patch Changes

- ce86577: Add staking history action amount

## 1.1.42

### Patch Changes

- 1b1066f: Add pool price change 24h

## 1.1.41

### Patch Changes

- c0e86d2: Add staking position into NotificationEntity

## 1.1.40

### Patch Changes

- 970ca86: Fix staking date fields

## 1.1.39

### Patch Changes

- 91ac223: Add staking position notification type

## 1.1.38

### Patch Changes

- 4d5fa80: Rename staking intervals fields

## 1.1.37

### Patch Changes

- 88c36de: Staking integration

## 1.1.36

### Patch Changes

- ca0cbd8: Add vault history endpoint

## 1.1.35

### Patch Changes

- 47fac79: Add ts to getPoolUpdatesStream query

## 1.1.34

### Patch Changes

- 1ed0e03: Add amountUsd to PoolSwap

## 1.1.33

### Patch Changes

- 2368f4c: Add price candle volume

## 1.1.32

### Patch Changes

- 4f6538e: Add wallet entities notification types

## 1.1.31

### Patch Changes

- f11e6ee: Extend notifications entities list

## 1.1.30

### Patch Changes

- 1804dcf: Add general stream endpoint

## 1.1.29

### Patch Changes

- f324ea5: Update LimitOrder amount fields

## 1.1.28

### Patch Changes

- 6c1a725: Add fusion types & endpoints

## 1.1.27

### Patch Changes

- 8a86556: Remove AbortSignal.any usage

## 1.1.26

### Patch Changes

- 7e3af72: Remove AbortSignal.timeout usage

## 1.1.25

### Patch Changes

- 7d879e7f: Adds setConfig method to TunaApiClient & fixes config references

## 1.1.24

### Patch Changes

- ec01461: Rename collateral fields

## 1.1.23

### Patch Changes

- 44c272d: TunaPosition:

  - Added openedAt field
  - Added updatedAtSlot
  - Added providedCollateralA, providedCollateralB, providedCollateralUsd fields

  Pool

  - Added stats.\*.yieldOverTvl field

## 1.1.22

### Patch Changes

- b086fd3: Added pool swaps

## 1.1.21

### Patch Changes

- 6de4f5b: Add lending position shares & rename fields

## 1.1.20

### Patch Changes

- a97c4b2: Add market borrow fields

## 1.1.19

### Patch Changes

- 429906c: Add tokens pnl

## 1.1.18

### Patch Changes

- cadf21d: Added Market borrow fields

## 1.1.17

### Patch Changes

- afa3d17: Add vault pythOraclePriceUpdate field

## 1.1.16

### Patch Changes

- f1b6449: Add vault depositedShares field

## 1.1.15

### Patch Changes

- 6fadc51: Add market protocolFeeOnCollateral field

## 1.1.14

### Patch Changes

- 403a52d: Market disabled field

## 1.1.13

### Patch Changes

- 2b6f589: Pool fields adjustments

## 1.1.12

### Patch Changes

- 6276db6: Market fields adjustments

## 1.1.11

### Patch Changes

- 66d95fc: Add Vault utilization field

## 1.1.10

### Patch Changes

- 5659a2c: Add borrowedShares & pythOracleFeedId Vault fields

## 1.1.9

### Patch Changes

- d838649: Add pool vault addresses

## 1.1.8

### Patch Changes

- cd10597: Public version

## 1.1.7

### Patch Changes

- 54b1211: Add Tuna Position flags

## 1.1.6

### Patch Changes

- f238209: Single lending position endpoint
- f238209: Add single lending position endpoint

## 1.1.5

### Patch Changes

- 981f1dc: Remove poolTickSpacing

## 1.1.4

### Patch Changes

- 77aca97: Add tickSpacing to Tuna Positions

## 1.1.3

### Patch Changes

- f2c6f1f: Add PnL bps

## 1.1.2

### Patch Changes

- 5aa5594: Publish

## 1.1.1

### Patch Changes

- 4436ea0: Tuna Position state enum

## 1.1.0

### Minor Changes

- fe87df4: First version

## 1.0.0

### Major Changes

- a40e215: First version
