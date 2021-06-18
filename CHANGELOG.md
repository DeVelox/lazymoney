## Changelog
### 0.9.11
- Fixed a bug where the module would remove currency from higher denominations even when there was enough to pay.
### 0.9.10
- Reworked the logic for removing currency so it doesn't always start with the highest denomination.
### 0.9.9
- Added an option to ignore electrum when converting.
### 0.9.8
- Lazy Money now uses the currency conversion rates from `CONFIG.DND5E.currencyConversion`.
### 0.9.7
- Added an option to automatically convert when adding currency.
- Added a brief red flash to indicate if there isn't enough currency to remove.
